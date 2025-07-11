import { supabase } from './supabaseClient';
import { 
  ExpenseGroup, 
  GroupMember, 
  GroupExpense, 
  ExpenseSplit, 
  ExpensePayment, 
  UserBalance, 
  GroupSummary 
} from '../types/database';

export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface CreateExpenseData {
  group_id: string;
  description: string;
  total_amount: number;
  category: string;
  expense_date: string;
  notes?: string;
  split_type: 'equal' | 'custom';
  splits: { user_id: string; amount: number }[];
}

export interface UserSearchResult {
  id: string;
  full_name: string;
  email: string;
}

export interface DetailedBalance {
  creditor_id: string;
  creditor_name: string;
  debtor_id: string;
  debtor_name: string;
  amount: number;
}

export interface SettlementSuggestion {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
}

export interface EnhancedGroupBalances {
  user_balances: UserBalance[];
  detailed_balances: DetailedBalance[];
  settlement_suggestions: SettlementSuggestion[];
  total_group_expenses: number;
  pending_amount: number;
}

// GROUP MANAGEMENT
export const createGroup = async (groupData: CreateGroupData): Promise<ExpenseGroup | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('expense_groups')
      .insert([{
        name: groupData.name,
        description: groupData.description,
        created_by: user.user.id
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '42P17' || error.code === '42P01') {
        // RLS recursion or table doesn't exist
        alert('Database not set up yet! Please run the SQL schema in your Supabase dashboard first.');
        return null;
      }
      throw error;
    }

    // Automatically add creator as a member
    await addGroupMember(data.id, user.user.id);

    return data;
  } catch (error) {
    console.error('Error creating group:', error);
    return null;
  }
};

export const getUserGroups = async (): Promise<ExpenseGroup[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    // First get group IDs where user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.user.id)
      .eq('is_active', true);

    if (memberError) {
      console.error('Database tables not set up yet. Returning empty array.');
      return [];
    }
    
    if (!memberData || memberData.length === 0) return [];

    const groupIds = memberData.map(m => m.group_id);

    // Then get the actual groups
    const { data, error } = await supabase
      .from('expense_groups')
      .select('*')
      .in('id', groupIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database tables not set up yet. Returning empty array.');
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};

export const getGroupDetails = async (groupId: string): Promise<GroupSummary | null> => {
  try {
    // Get group info
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;

    // Get group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true);

    if (membersError) throw membersError;

    // Get user details for members
    const memberUserIds = members?.map(m => m.user_id) || [];
    const { data: memberUsers } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', memberUserIds);

    // Combine member data with user details
    const membersWithUserData = members?.map(member => {
      const userData = memberUsers?.find(u => u.id === member.user_id);
      return {
        ...member,
        user_name: userData?.full_name,
        user_email: userData?.email
      };
    }) || [];

    // Get recent expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('group_expenses')
      .select('*')
      .eq('group_id', groupId)
      .order('expense_date', { ascending: false })
      .limit(10);

    if (expensesError) throw expensesError;

    // Get user details for expense payers
    const payerIds = expenses?.map(e => e.paid_by) || [];
    const { data: payerUsers } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', payerIds);

    // Combine expense data with user details
    const expensesWithUserData = expenses?.map(expense => {
      const payerData = payerUsers?.find(u => u.id === expense.paid_by);
      return {
        ...expense,
        paid_by_name: payerData?.full_name
      };
    }) || [];

    // Calculate user balances
    const userBalances = await calculateGroupBalances(groupId);

    return {
      group,
      members: membersWithUserData,
      recent_expenses: expensesWithUserData,
      user_balances: userBalances,
      total_group_expenses: expensesWithUserData.reduce((sum, e) => sum + Number(e.total_amount), 0),
      pending_settlements: userBalances.filter(b => b.net_balance < 0).length
    };
  } catch (error) {
    console.error('Error fetching group details:', error);
    return null;
  }
};

// MEMBER MANAGEMENT
export const searchUsers = async (searchTerm: string): Promise<UserSearchResult[]> => {
  try {
    if (searchTerm.length < 2) return [];

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

export const addGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userId,
        added_by: user.user.id
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding group member:', error);
    return false;
  }
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_members')
      .update({ is_active: false })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing group member:', error);
    return false;
  }
};

// EXPENSE MANAGEMENT
export const createExpense = async (expenseData: CreateExpenseData): Promise<{success: boolean, expenseId?: string, splits?: any[]}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return {success: false};

    // Create the expense
    const { data: expense, error: expenseError } = await supabase
      .from('group_expenses')
      .insert([{
        group_id: expenseData.group_id,
        description: expenseData.description,
        total_amount: expenseData.total_amount,
        paid_by: user.user.id,
        category: expenseData.category,
        expense_date: expenseData.expense_date,
        notes: expenseData.notes
      }])
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Create the splits
    const splits = expenseData.splits.map(split => ({
      expense_id: expense.id,
      user_id: split.user_id,
      amount_owed: split.amount,
      is_paid: split.user_id === user.user.id, // Auto-mark expense creator as paid
      paid_at: split.user_id === user.user.id ? new Date().toISOString() : null,
      marked_paid_by: split.user_id === user.user.id ? user.user.id : null
    }));

    const { data: createdSplits, error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splits)
      .select();

    if (splitsError) throw splitsError;

    // Create payment record for the expense creator
    const creatorSplit = createdSplits?.find(s => s.user_id === user.user.id);
    if (creatorSplit) {
      await supabase
        .from('expense_payments')
        .insert([{
          expense_id: expense.id,
          split_id: creatorSplit.id,
          paid_by: user.user.id,
          paid_to: user.user.id,
          amount: creatorSplit.amount_owed,
          payment_date: new Date().toISOString().split('T')[0],
          marked_by: user.user.id
        }]);
    }

    return {success: true, expenseId: expense.id, splits: createdSplits};
  } catch (error) {
    console.error('Error creating expense:', error);
    return {success: false};
  }
};

export const getGroupExpenses = async (groupId: string): Promise<GroupExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('group_expenses')
      .select(`
        *,
        users!group_expenses_paid_by_fkey(full_name),
        expense_splits(count)
      `)
      .eq('group_id', groupId)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    
    return data?.map(expense => ({
      ...expense,
      paid_by_name: expense.users?.full_name,
      split_count: expense.expense_splits?.length || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    return [];
  }
};

export const getExpenseSplits = async (expenseId: string): Promise<ExpenseSplit[]> => {
  try {
    const { data, error } = await supabase
      .from('expense_splits')
      .select(`
        *,
        users!expense_splits_user_id_fkey(full_name, email)
      `)
      .eq('expense_id', expenseId)
      .order('amount_owed', { ascending: false });

    if (error) throw error;
    
    return data?.map(split => ({
      ...split,
      user_name: split.users?.full_name,
      user_email: split.users?.email
    })) || [];
  } catch (error) {
    console.error('Error fetching expense splits:', error);
    return [];
  }
};

// PAYMENT MANAGEMENT
export const markSplitAsPaid = async (splitId: string, expenseId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    // Update the split
    const { error: splitError } = await supabase
      .from('expense_splits')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        marked_paid_by: user.user.id
      })
      .eq('id', splitId);

    if (splitError) throw splitError;

    // Get split details for payment record
    const { data: split } = await supabase
      .from('expense_splits')
      .select('user_id, amount_owed')
      .eq('id', splitId)
      .single();

    const { data: expense } = await supabase
      .from('group_expenses')
      .select('paid_by')
      .eq('id', expenseId)
      .single();

    if (split && expense) {
      // Create payment record
      await supabase
        .from('expense_payments')
        .insert([{
          expense_id: expenseId,
          split_id: splitId,
          paid_by: split.user_id,
          paid_to: expense.paid_by,
          amount: split.amount_owed,
          payment_date: new Date().toISOString().split('T')[0],
          marked_by: user.user.id
        }]);
    }

    return true;
  } catch (error) {
    console.error('Error marking split as paid:', error);
    return false;
  }
};

export const markSplitAsUnpaid = async (splitId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expense_splits')
      .update({
        is_paid: false,
        paid_at: null,
        marked_paid_by: null
      })
      .eq('id', splitId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking split as unpaid:', error);
    return false;
  }
};

// BALANCE CALCULATIONS
export const calculateGroupBalances = async (groupId: string): Promise<UserBalance[]> => {
  try {
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('is_active', true);

    if (!members) return [];

    // Get user details
    const userIds = members.map(m => m.user_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);

    const balances: UserBalance[] = [];

    for (const member of members) {
      const userData = users?.find(u => u.id === member.user_id);
      // Calculate what they are owed (they paid for others)
      const { data: paidExpenses } = await supabase
        .from('group_expenses')
        .select('total_amount')
        .eq('group_id', groupId)
        .eq('paid_by', member.user_id);

      // Calculate what they owe (their splits)
      const { data: owedSplits } = await supabase
        .from('expense_splits')
        .select('amount_owed, is_paid')
        .eq('user_id', member.user_id)
        .in('expense_id', 
          await supabase
            .from('group_expenses')
            .select('id')
            .eq('group_id', groupId)
            .then(res => res.data?.map(e => e.id) || [])
        );

      const totalPaid = paidExpenses?.reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;
      const totalOwed = owedSplits?.reduce((sum, s) => sum + Number(s.amount_owed), 0) || 0;
      const totalUnpaidOwed = owedSplits?.filter(s => !s.is_paid).reduce((sum, s) => sum + Number(s.amount_owed), 0) || 0;

      balances.push({
        user_id: member.user_id,
        user_name: userData?.full_name || '',
        user_email: userData?.email || '',
        total_owed: totalPaid - totalOwed, // What they are owed
        total_owes: totalUnpaidOwed, // What they still owe
        net_balance: totalPaid - totalOwed // Positive = owed money, Negative = owes money
      });
    }

    return balances;
  } catch (error) {
    console.error('Error calculating group balances:', error);
    return [];
  }
};

export const getUserDues = async (): Promise<UserBalance[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    // Get all groups user is a member of
    const { data: userGroups, error } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Database tables not set up yet. Returning empty dues.');
      return [];
    }

    if (!userGroups) return [];

    const allDues: UserBalance[] = [];

    for (const group of userGroups) {
      const groupBalances = await calculateGroupBalances(group.group_id);
      const userBalance = groupBalances.find(b => b.user_id === user.user.id);
      if (userBalance && userBalance.total_owes > 0) {
        allDues.push(userBalance);
      }
    }

    return allDues;
  } catch (error) {
    console.error('Error fetching user dues:', error);
    return [];
  }
};

// ENHANCED BALANCE CALCULATIONS
export const calculateDetailedGroupBalances = async (groupId: string): Promise<EnhancedGroupBalances> => {
  try {
    // Get all group expenses and their splits
    const { data: expenses } = await supabase
      .from('group_expenses')
      .select('id, paid_by, total_amount')
      .eq('group_id', groupId);

    const { data: splits } = await supabase
      .from('expense_splits')
      .select('expense_id, user_id, amount_owed, is_paid')
      .in('expense_id', expenses?.map(e => e.id) || []);

    // Get user details
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('is_active', true);

    const userIds = members?.map(m => m.user_id) || [];
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);

    // Calculate detailed balances between users
    const detailedBalances: DetailedBalance[] = [];
    const userNetBalances: { [userId: string]: number } = {};

    // Initialize user balances
    userIds.forEach(userId => {
      userNetBalances[userId] = 0;
    });

    // Calculate what each user paid vs what they owe
    expenses?.forEach(expense => {
      const expenseSplits = splits?.filter(s => s.expense_id === expense.id) || [];
      const payerId = expense.paid_by;
      
      expenseSplits.forEach(split => {
        if (split.user_id !== payerId) {
          // This person owes money to the payer
          userNetBalances[split.user_id] -= split.amount_owed;
          userNetBalances[payerId] += split.amount_owed;
        }
      });
    });

    // Create detailed balance entries for non-zero balances
    Object.entries(userNetBalances).forEach(([userId, balance]) => {
      if (balance < 0) {
        // This user owes money, find who they owe to
        Object.entries(userNetBalances).forEach(([creditorId, creditorBalance]) => {
          if (creditorBalance > 0 && userId !== creditorId) {
            const amount = Math.min(Math.abs(balance), creditorBalance);
            if (amount > 0.01) {
              const debtor = users?.find(u => u.id === userId);
              const creditor = users?.find(u => u.id === creditorId);
              
              detailedBalances.push({
                creditor_id: creditorId,
                creditor_name: creditor?.full_name || 'Unknown',
                debtor_id: userId,
                debtor_name: debtor?.full_name || 'Unknown',
                amount: amount
              });
            }
          }
        });
      }
    });

    // Calculate user balances
    const userBalances: UserBalance[] = userIds.map(userId => {
      const userData = users?.find(u => u.id === userId);
      const netBalance = userNetBalances[userId] || 0;
      const totalOwed = Math.max(netBalance, 0);
      const totalOwes = Math.abs(Math.min(netBalance, 0));

      return {
        user_id: userId,
        user_name: userData?.full_name || '',
        user_email: userData?.email || '',
        total_owed: totalOwed,
        total_owes: totalOwes,
        net_balance: netBalance
      };
    });

    // Calculate settlement suggestions (minimize transactions)
    const settlementSuggestions = calculateOptimalSettlements(userBalances, users || []);

    // Calculate totals
    const totalGroupExpenses = expenses?.reduce((sum, e) => sum + Number(e.total_amount), 0) || 0;
    const pendingAmount = splits?.filter(s => !s.is_paid).reduce((sum, s) => sum + Number(s.amount_owed), 0) || 0;

    return {
      user_balances: userBalances,
      detailed_balances: detailedBalances,
      settlement_suggestions: settlementSuggestions,
      total_group_expenses: totalGroupExpenses,
      pending_amount: pendingAmount
    };
  } catch (error) {
    console.error('Error calculating detailed group balances:', error);
    return {
      user_balances: [],
      detailed_balances: [],
      settlement_suggestions: [],
      total_group_expenses: 0,
      pending_amount: 0
    };
  }
};

const calculateOptimalSettlements = (
  userBalances: UserBalance[], 
  users: Array<{id: string, full_name: string}>
): SettlementSuggestion[] => {
  const settlements: SettlementSuggestion[] = [];
  
  // Create arrays of creditors (owed money) and debtors (owe money)
  const creditors = userBalances.filter(u => u.net_balance > 0).map(u => ({
    user_id: u.user_id,
    amount: u.net_balance
  }));
  
  const debtors = userBalances.filter(u => u.net_balance < 0).map(u => ({
    user_id: u.user_id,
    amount: Math.abs(u.net_balance)
  }));

  // Use greedy algorithm to minimize transactions
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const settleAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settleAmount > 0.01) {
      const creditorUser = users.find(u => u.id === creditor.user_id);
      const debtorUser = users.find(u => u.id === debtor.user_id);
      
      settlements.push({
        from_user_id: debtor.user_id,
        from_user_name: debtorUser?.full_name || 'Unknown',
        to_user_id: creditor.user_id,
        to_user_name: creditorUser?.full_name || 'Unknown',
        amount: settleAmount
      });
    }
    
    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;
    
    if (creditor.amount <= 0.01) i++;
    if (debtor.amount <= 0.01) j++;
  }
  
  return settlements;
}; 