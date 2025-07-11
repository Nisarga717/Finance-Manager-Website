export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_recurring: boolean;
  company: string;
  status?: "pending" | "paid" | "overdue";
  created_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reminder_date: string;
  is_recurring: boolean;
  created_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  billing_cycle: "monthly" | "yearly" | "weekly" | "other";
  next_due_date: string;
  status: "active" | "inactive" | "cancelled";
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: string;
  created_at?: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvestments: number;
  totalBills: number;
  upcomingBills: number;
  activeSubscriptions: number;
  upcomingReminders: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'transaction' | 'bill' | 'reminder' | 'subscription';
  title: string;
  amount?: number;
  date: string;
  status?: string;
  category?: string;
}

// Split Expenses Types
export interface ExpenseGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  total_expenses?: number;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  added_by: string;
  joined_at: string;
  is_active: boolean;
  // User details (joined from users table)
  user_name?: string;
  user_email?: string;
}

export interface GroupExpense {
  id: string;
  group_id: string;
  description: string;
  total_amount: number;
  paid_by: string;
  category: string;
  expense_date: string;
  created_at: string;
  updated_at?: string;
  is_settled: boolean;
  receipt_url?: string;
  notes?: string;
  // Additional details
  paid_by_name?: string;
  split_count?: number;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  is_paid: boolean;
  paid_at?: string;
  marked_paid_by?: string;
  created_at: string;
  // User details
  user_name?: string;
  user_email?: string;
}

export interface ExpensePayment {
  id: string;
  expense_id: string;
  split_id: string;
  paid_by: string;
  paid_to: string;
  amount: number;
  payment_date: string;
  marked_by: string;
  notes?: string;
  created_at: string;
}

export interface UserBalance {
  user_id: string;
  user_name: string;
  user_email: string;
  total_owed: number;
  total_owes: number;
  net_balance: number; // positive means they are owed money, negative means they owe
}

export interface GroupSummary {
  group: ExpenseGroup;
  members: GroupMember[];
  recent_expenses: GroupExpense[];
  user_balances: UserBalance[];
  total_group_expenses: number;
  pending_settlements: number;
} 