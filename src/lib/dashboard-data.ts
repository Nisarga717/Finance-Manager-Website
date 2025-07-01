import { supabase } from './supabaseClient';

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
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
  investmentChange: number;
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

export class DashboardDataService {
  static async fetchBills(userId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async fetchReminders(userId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async fetchSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async fetchTransactions(userId: string): Promise<Transaction[]> {
    // Try to fetch from transactions table, if it doesn't exist, return empty array
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);
      
      if (error) {
        console.warn('Transactions table not found, returning empty array');
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Transactions table not found, returning empty array');
      return [];
    }
  }

  static async calculateDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const [bills, subscriptions, reminders, transactions] = await Promise.all([
        this.fetchBills(userId),
        this.fetchSubscriptions(userId),
        this.fetchReminders(userId),
        this.fetchTransactions(userId)
      ]);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Calculate current month transactions
      const currentMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      });

      // Calculate last month transactions for comparison
      const lastMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
      });

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const lastMonthIncome = lastMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonthExpenses = lastMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate subscription monthly cost
      const monthlySubscriptionCost = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          switch (s.billing_cycle) {
            case 'monthly': return sum + s.amount;
            case 'yearly': return sum + (s.amount / 12);
            case 'weekly': return sum + (s.amount * 4.33);
            default: return sum + s.amount;
          }
        }, 0);

      // Calculate upcoming bills (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const upcomingBills = bills.filter(b => {
        const dueDate = new Date(b.due_date);
        return dueDate >= now && dueDate <= thirtyDaysFromNow && b.status !== 'paid';
      }).length;

      // Calculate upcoming reminders (next 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const upcomingReminders = reminders.filter(r => {
        const reminderDate = new Date(r.reminder_date);
        return reminderDate >= now && reminderDate <= sevenDaysFromNow;
      }).length;

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const totalBalance = monthlyIncome - monthlyExpenses;
      const totalInvestments = 285000; // This could be fetched from investment API or separate table

      // Calculate percentage changes
      const balanceChange = lastMonthIncome - lastMonthExpenses !== 0 
        ? ((totalBalance - (lastMonthIncome - lastMonthExpenses)) / Math.abs(lastMonthIncome - lastMonthExpenses)) * 100 
        : 0;
      
      const incomeChange = lastMonthIncome !== 0 
        ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 
        : 0;
      
      const expenseChange = lastMonthExpenses !== 0 
        ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
        : 0;

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses: monthlyExpenses + monthlySubscriptionCost,
        totalInvestments,
        totalBills: bills.length,
        upcomingBills,
        activeSubscriptions,
        upcomingReminders,
        balanceChange,
        incomeChange,
        expenseChange,
        investmentChange: 15.7 // Mock data - could be calculated from investment API
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      // Return default stats if there's an error
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        totalInvestments: 0,
        totalBills: 0,
        upcomingBills: 0,
        activeSubscriptions: 0,
        upcomingReminders: 0,
        balanceChange: 0,
        incomeChange: 0,
        expenseChange: 0,
        investmentChange: 0
      };
    }
  }

  static async getCategorySpending(userId: string): Promise<CategorySpending[]> {
    try {
      const transactions = await this.fetchTransactions(userId);
      const subscriptions = await this.fetchSubscriptions(userId);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Get current month transactions
      const currentMonthExpenses = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === currentMonth && 
               tDate.getFullYear() === currentYear;
      });

      // Group by category
      const categoryTotals: { [key: string]: number } = {};
      
      // Add transaction expenses
      currentMonthExpenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      // Add subscription expenses
      subscriptions.filter(s => s.status === 'active').forEach(s => {
        const monthlyAmount = s.billing_cycle === 'monthly' ? s.amount : 
                             s.billing_cycle === 'yearly' ? s.amount / 12 :
                             s.billing_cycle === 'weekly' ? s.amount * 4.33 : s.amount;
        categoryTotals['Subscriptions'] = (categoryTotals['Subscriptions'] || 0) + monthlyAmount;
      });

      const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
      
      const colors = [
        '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
      ];

      return Object.entries(categoryTotals)
        .map(([category, amount], index) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories
    } catch (error) {
      console.error('Error getting category spending:', error);
      return [];
    }
  }

  static async getRecentActivity(userId: string): Promise<RecentActivity[]> {
    try {
      const [bills, subscriptions, reminders, transactions] = await Promise.all([
        this.fetchBills(userId),
        this.fetchSubscriptions(userId),
        this.fetchReminders(userId),
        this.fetchTransactions(userId)
      ]);

      const activities: RecentActivity[] = [];

      // Add recent transactions
      transactions.slice(0, 5).forEach(t => {
        activities.push({
          id: t.id,
          type: 'transaction',
          title: t.description,
          amount: t.type === 'expense' ? -t.amount : t.amount,
          date: t.date,
          category: t.category
        });
      });

      // Add recent bills
      bills.slice(0, 3).forEach(b => {
        activities.push({
          id: b.id,
          type: 'bill',
          title: b.name,
          amount: -b.amount,
          date: b.due_date,
          status: b.status
        });
      });

      // Add upcoming reminders
      const now = new Date();
      const upcomingReminders = reminders
        .filter(r => new Date(r.reminder_date) >= now)
        .slice(0, 2);
      
      upcomingReminders.forEach(r => {
        activities.push({
          id: r.id,
          type: 'reminder',
          title: r.title,
          date: r.reminder_date
        });
      });

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
} 