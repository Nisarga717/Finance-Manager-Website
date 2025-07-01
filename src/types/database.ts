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