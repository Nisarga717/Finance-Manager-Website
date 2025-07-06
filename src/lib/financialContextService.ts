import { DashboardDataService, DashboardStats, CategorySpending, RecentActivity } from './dashboard-data';
import { supabase } from './supabaseClient';

export interface BillData {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  is_recurring: boolean;
}

export interface SubscriptionData {
  id: string;
  name: string;
  amount: number;
  billing_cycle: 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'paused';
  category: string;
  next_billing: string;
}

export interface FinancialContext {
  hasData: boolean;
  summary: string;
  stats: DashboardStats | null;
  categorySpending: CategorySpending[];
  recentActivity: RecentActivity[];
  insights: string[];
  bills: BillData[];
  subscriptions: SubscriptionData[];
}

export interface FilteredContext {
  hasData: boolean;
  summary: string;
  relevantData: any;
  insights: string[];
  queryType: 'general' | 'stats' | 'bills' | 'subscriptions' | 'transactions' | 'investments' | 'budgeting';
}

export class FinancialContextService {
  static async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async fetchFinancialContext(): Promise<FinancialContext> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        return {
          hasData: false,
          summary: "User not authenticated",
          stats: null,
          categorySpending: [],
          recentActivity: [],
          insights: [],
          bills: [],
          subscriptions: []
        };
      }

      const [stats, categorySpending, recentActivity, bills, subscriptions] = await Promise.all([
        DashboardDataService.calculateDashboardStats(userId),
        DashboardDataService.getCategorySpending(userId),
        DashboardDataService.getRecentActivity(userId),
        this.fetchBills(userId),
        this.fetchSubscriptions(userId)
      ]);

      const insights = this.generateFinancialInsights(stats, categorySpending, bills, subscriptions);
      const summary = this.createFinancialSummary(stats, categorySpending, recentActivity, bills, subscriptions);

      return {
        hasData: true,
        summary,
        stats,
        categorySpending,
        recentActivity,
        insights,
        bills,
        subscriptions
      };
    } catch (error) {
      console.error('Error fetching financial context:', error);
      return {
        hasData: false,
        summary: "Unable to fetch financial data",
        stats: null,
        categorySpending: [],
        recentActivity: [],
        insights: [],
        bills: [],
        subscriptions: []
      };
    }
  }

  static async fetchBills(userId: string): Promise<BillData[]> {
    try {
      const { data: bills, error } = await supabase
        .from('bills')
        .select('id, name, amount, due_date, status, category, is_recurring')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching bills:', error);
        return [];
      }

      return bills || [];
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  }

  static async fetchSubscriptions(userId: string): Promise<SubscriptionData[]> {
    try {
      console.log('🔍 Fetching subscriptions for user:', userId);
      
      // First, let's try to get all columns to see what's available
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching subscriptions:', error);
        return [];
      }

      console.log('📊 Raw subscriptions data:', subscriptions);
      console.log('🔢 Number of subscriptions found:', subscriptions?.length || 0);
      
      if (subscriptions && subscriptions.length > 0) {
        console.log('📋 First subscription structure:', subscriptions[0]);
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
        console.log('✅ Active subscriptions:', activeSubscriptions.length);
        console.log('📋 Active subscription details:', activeSubscriptions);
      }

      // Map the data to match our interface, using fallback values for missing fields
      const mappedSubscriptions = subscriptions?.map(sub => ({
        id: sub.id || sub.subscription_id || 'unknown',
        name: sub.name || sub.service_name || 'Unknown Service',
        amount: sub.amount || sub.monthly_cost || 0,
        billing_cycle: sub.billing_cycle || 'monthly',
        status: sub.status || 'active',
        category: sub.category || 'Other',
        next_billing: sub.next_billing || sub.next_billing_date || new Date().toISOString()
      })) || [];

      console.log('🔄 Mapped subscriptions:', mappedSubscriptions);
      return mappedSubscriptions;
    } catch (error) {
      console.error('💥 Exception in fetchSubscriptions:', error);
      return [];
    }
  }

  static analyzeQueryType(userMessage: string): FilteredContext['queryType'] {
    const message = userMessage.toLowerCase();
    
    // Check for specific keywords
    if (message.includes('bill') || message.includes('payment') || message.includes('due') || message.includes('overdue')) {
      return 'bills';
    }
    
    if (message.includes('subscription') || message.includes('recurring') || message.includes('monthly service') || message.includes('netflix') || message.includes('spotify')) {
      return 'subscriptions';
    }
    
    if (message.includes('transaction') || message.includes('purchase') || message.includes('spent') || message.includes('expense')) {
      return 'transactions';
    }
    
    if (message.includes('investment') || message.includes('portfolio') || message.includes('stock') || message.includes('bond') || message.includes('mutual fund')) {
      return 'investments';
    }
    
    if (message.includes('budget') || message.includes('spending') || message.includes('category') || message.includes('allocation')) {
      return 'budgeting';
    }
    
    if (message.includes('stat') || message.includes('overview') || message.includes('summary') || message.includes('total') || message.includes('balance')) {
      return 'stats';
    }
    
    return 'general';
  }

  static async fetchFilteredContext(userMessage: string): Promise<FilteredContext> {
    const queryType = this.analyzeQueryType(userMessage);
    const fullContext = await this.fetchFinancialContext();
    
    if (!fullContext.hasData) {
      return {
        hasData: false,
        summary: 'No financial data available',
        relevantData: null,
        insights: [],
        queryType
      };
    }

    switch (queryType) {
      case 'bills':
        return this.createBillsContext(fullContext, userMessage);
      case 'subscriptions':
        return this.createSubscriptionsContext(fullContext, userMessage);
      case 'stats':
        return this.createStatsContext(fullContext, userMessage);
      case 'transactions':
        return this.createTransactionsContext(fullContext, userMessage);
      case 'investments':
        return this.createInvestmentsContext(fullContext, userMessage);
      case 'budgeting':
        return this.createBudgetingContext(fullContext, userMessage);
      default:
        return this.createGeneralContext(fullContext, userMessage);
    }
  }

  private static createBillsContext(context: FinancialContext, userMessage: string): FilteredContext {
    const bills = context.bills;
    const today = new Date();
    
    const pendingBills = bills.filter(bill => bill.status === 'pending');
    const overdueBills = bills.filter(bill => bill.status === 'overdue' || 
      (bill.status === 'pending' && new Date(bill.due_date) < today));
    const upcomingBills = bills.filter(bill => 
      bill.status === 'pending' && new Date(bill.due_date) >= today);
    
    const totalBillAmount = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);
    const overdueAmount = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const billsInsights = [
      `Total pending bills: $${totalBillAmount.toLocaleString()}`,
      `Overdue bills: ${overdueBills.length} ($${overdueAmount.toLocaleString()})`,
      `Upcoming bills: ${upcomingBills.length}`,
      `Recurring bills: ${bills.filter(bill => bill.is_recurring).length}`
    ];

    return {
      hasData: true,
      summary: `BILLS OVERVIEW:
- Total Bills: ${bills.length}
- Pending: ${pendingBills.length} ($${totalBillAmount.toLocaleString()})
- Overdue: ${overdueBills.length} ($${overdueAmount.toLocaleString()})
- Paid: ${bills.filter(bill => bill.status === 'paid').length}

UPCOMING BILLS:
${upcomingBills.slice(0, 5).map(bill => 
  `• ${bill.name}: $${bill.amount.toLocaleString()} (Due: ${new Date(bill.due_date).toLocaleDateString()})`
).join('\n')}

OVERDUE BILLS:
${overdueBills.slice(0, 3).map(bill => 
  `• ${bill.name}: $${bill.amount.toLocaleString()} (Due: ${new Date(bill.due_date).toLocaleDateString()})`
).join('\n')}`,
      relevantData: {
        bills,
        pendingBills,
        overdueBills,
        upcomingBills,
        totalBillAmount,
        overdueAmount
      },
      insights: billsInsights,
      queryType: 'bills'
    };
  }

  private static createSubscriptionsContext(context: FinancialContext, userMessage: string): FilteredContext {
    const subscriptions = context.subscriptions;
    console.log('🔍 Creating subscriptions context with data:', subscriptions);
    
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    console.log('✅ Active subscriptions found:', activeSubscriptions.length);
    console.log('📋 Active subscriptions details:', activeSubscriptions);
    
    let monthlyTotal = 0;
    activeSubscriptions.forEach(sub => {
      switch (sub.billing_cycle) {
        case 'monthly':
          monthlyTotal += sub.amount;
          break;
        case 'yearly':
          monthlyTotal += sub.amount / 12;
          break;
        case 'weekly':
          monthlyTotal += sub.amount * 4.33;
          break;
      }
    });

    console.log('💰 Monthly total calculated:', monthlyTotal);

    const subscriptionInsights = [
      `Active subscriptions: ${activeSubscriptions.length}`,
      `Monthly subscription cost: $${monthlyTotal.toFixed(2)}`,
      `Annual subscription cost: $${(monthlyTotal * 12).toFixed(2)}`,
      `Most expensive: ${activeSubscriptions.length > 0 ? activeSubscriptions.reduce((max, sub) => 
        sub.amount > max.amount ? sub : max).name : 'None'}`
    ];

    return {
      hasData: true,
      summary: `SUBSCRIPTIONS OVERVIEW:
- Active Subscriptions: ${activeSubscriptions.length}
- Monthly Cost: $${monthlyTotal.toFixed(2)}
- Annual Cost: $${(monthlyTotal * 12).toFixed(2)}

ACTIVE SUBSCRIPTIONS:
${activeSubscriptions.slice(0, 8).map(sub => 
  `• ${sub.name}: $${sub.amount.toLocaleString()}/${sub.billing_cycle} (Next: ${new Date(sub.next_billing).toLocaleDateString()})`
).join('\n')}

SUBSCRIPTION CATEGORIES:
${this.getSubscriptionsByCategory(activeSubscriptions)}`,
      relevantData: {
        subscriptions,
        activeSubscriptions,
        monthlyTotal,
        yearlyTotal: monthlyTotal * 12
      },
      insights: subscriptionInsights,
      queryType: 'subscriptions'
    };
  }

  private static createStatsContext(context: FinancialContext, userMessage: string): FilteredContext {
    const stats = context.stats!;
    const netIncome = stats.monthlyIncome - stats.monthlyExpenses;
    const savingsRate = stats.monthlyIncome > 0 ? ((netIncome / stats.monthlyIncome) * 100).toFixed(1) : '0';
    
    const statsInsights = [
      `Net monthly income: $${netIncome.toLocaleString()}`,
      `Savings rate: ${savingsRate}%`,
      `Investment allocation: ${stats.totalBalance > 0 ? ((stats.totalInvestments / stats.totalBalance) * 100).toFixed(1) : '0'}%`,
      `Bills vs Income: ${stats.monthlyIncome > 0 ? ((stats.monthlyExpenses / stats.monthlyIncome) * 100).toFixed(1) : '0'}%`
    ];

    return {
      hasData: true,
      summary: `FINANCIAL STATISTICS:
- Monthly Income: $${stats.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${stats.monthlyExpenses.toLocaleString()}
- Net Monthly: $${netIncome.toLocaleString()} (${netIncome >= 0 ? 'surplus' : 'deficit'})
- Savings Rate: ${savingsRate}%
- Total Balance: $${stats.totalBalance.toLocaleString()}
- Total Investments: $${stats.totalInvestments.toLocaleString()}
- Active Subscriptions: ${stats.activeSubscriptions}
- Upcoming Bills: ${stats.upcomingBills}`,
      relevantData: {
        stats,
        netIncome,
        savingsRate: parseFloat(savingsRate)
      },
      insights: statsInsights,
      queryType: 'stats'
    };
  }

  private static createTransactionsContext(context: FinancialContext, userMessage: string): FilteredContext {
    const transactions = context.recentActivity.filter(activity => activity.type === 'transaction');
    const totalSpent = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    
    return {
      hasData: true,
      summary: `RECENT TRANSACTIONS:
- Total Transactions: ${transactions.length}
- Total Amount: $${totalSpent.toLocaleString()}

RECENT ACTIVITY:
${transactions.slice(0, 10).map(transaction => 
  `• ${transaction.title}: $${transaction.amount?.toLocaleString() || '0'} (${new Date(transaction.date).toLocaleDateString()})`
).join('\n')}`,
      relevantData: {
        transactions,
        totalSpent,
        categorySpending: context.categorySpending
      },
      insights: [`Recent spending: $${totalSpent.toLocaleString()}`],
      queryType: 'transactions'
    };
  }

  private static createInvestmentsContext(context: FinancialContext, userMessage: string): FilteredContext {
    const stats = context.stats!;
    const investmentRatio = stats.totalBalance > 0 ? ((stats.totalInvestments / stats.totalBalance) * 100).toFixed(1) : '0';
    
    return {
      hasData: true,
      summary: `INVESTMENT OVERVIEW:
- Total Investments: $${stats.totalInvestments.toLocaleString()}
- Investment Ratio: ${investmentRatio}% of total balance
- Total Balance: $${stats.totalBalance.toLocaleString()}`,
      relevantData: {
        totalInvestments: stats.totalInvestments,
        totalBalance: stats.totalBalance,
        investmentRatio: parseFloat(investmentRatio)
      },
      insights: [`Investment allocation: ${investmentRatio}%`],
      queryType: 'investments'
    };
  }

  private static createBudgetingContext(context: FinancialContext, userMessage: string): FilteredContext {
    const categorySpending = context.categorySpending;
    const topSpendingCategory = categorySpending.length > 0 ? categorySpending[0] : null;
    
    return {
      hasData: true,
      summary: `BUDGET BREAKDOWN:
${categorySpending.map(category => 
  `• ${category.category}: $${category.amount.toLocaleString()} (${category.percentage.toFixed(1)}%)`
).join('\n')}

${topSpendingCategory ? `Top spending category: ${topSpendingCategory.category} ($${topSpendingCategory.amount.toLocaleString()})` : ''}`,
      relevantData: {
        categorySpending,
        topSpendingCategory
      },
      insights: categorySpending.slice(0, 3).map(cat => `${cat.category}: ${cat.percentage.toFixed(1)}%`),
      queryType: 'budgeting'
    };
  }

  private static createGeneralContext(context: FinancialContext, userMessage: string): FilteredContext {
    const summary = this.createFinancialSummary(
      context.stats!,
      context.categorySpending,
      context.recentActivity,
      context.bills,
      context.subscriptions
    );

    return {
      hasData: true,
      summary,
      relevantData: {
        stats: context.stats,
        bills: context.bills,
        subscriptions: context.subscriptions,
        categorySpending: context.categorySpending
      },
      insights: context.insights,
      queryType: 'general'
    };
  }

  private static getSubscriptionsByCategory(subscriptions: SubscriptionData[]): string {
    const categories = subscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .map(([category, count]) => `• ${category}: ${count}`)
      .join('\n');
  }

  private static createFinancialSummary(
    stats: DashboardStats,
    categorySpending: CategorySpending[],
    recentActivity: RecentActivity[],
    bills: BillData[],
    subscriptions: SubscriptionData[]
  ): string {
    const netIncome = stats.monthlyIncome - stats.monthlyExpenses;
    const savingsRate = stats.monthlyIncome > 0 ? ((netIncome / stats.monthlyIncome) * 100).toFixed(1) : '0';
    
    const pendingBills = bills.filter(bill => bill.status === 'pending');
    const overdueBills = bills.filter(bill => bill.status === 'overdue');
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    const topSpendingCategory = categorySpending.length > 0 ? categorySpending[0] : null;
    const recentTransactionCount = recentActivity.filter(a => a.type === 'transaction').length;

    return `
Financial Overview:
- Monthly Income: $${stats.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${stats.monthlyExpenses.toLocaleString()}
- Net Monthly: $${netIncome.toLocaleString()} (${netIncome >= 0 ? 'surplus' : 'deficit'})
- Savings Rate: ${savingsRate}%
- Total Balance: $${stats.totalBalance.toLocaleString()}
- Investments: $${stats.totalInvestments.toLocaleString()}

Bills & Subscriptions:
- Pending Bills: ${pendingBills.length}
- Overdue Bills: ${overdueBills.length}
- Active Subscriptions: ${activeSubscriptions.length}

${topSpendingCategory ? `Top Spending: ${topSpendingCategory.category} ($${topSpendingCategory.amount.toLocaleString()})` : ''}
Recent Activity: ${recentTransactionCount} transactions
    `.trim();
  }

  private static generateFinancialInsights(
    stats: DashboardStats,
    categorySpending: CategorySpending[],
    bills: BillData[],
    subscriptions: SubscriptionData[]
  ): string[] {
    const insights: string[] = [];
    
    // Cash flow insights
    const netIncome = stats.monthlyIncome - stats.monthlyExpenses;
    if (netIncome < 0) {
      insights.push("User has a monthly deficit - needs expense reduction or income increase");
    } else if (netIncome > 0) {
      const savingsRate = (netIncome / stats.monthlyIncome) * 100;
      if (savingsRate < 10) {
        insights.push("Low savings rate - could benefit from budgeting optimization");
      } else if (savingsRate > 20) {
        insights.push("Strong savings rate - good candidate for investment planning");
      }
    }

    // Investment insights
    const investmentRatio = stats.totalBalance > 0 ? (stats.totalInvestments / stats.totalBalance) * 100 : 0;
    if (investmentRatio < 10) {
      insights.push("Low investment allocation - may want to discuss investment strategies");
    } else if (investmentRatio > 70) {
      insights.push("High investment allocation - ensure adequate emergency fund");
    }

    // Bills insights
    const overdueBills = bills.filter(bill => bill.status === 'overdue');
    if (overdueBills.length > 0) {
      insights.push(`${overdueBills.length} overdue bills requiring immediate attention`);
    }

    // Subscription insights
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    if (activeSubscriptions.length > 10) {
      insights.push("High number of active subscriptions - potential for subscription audit");
    }

    // Calculate monthly subscription cost
    let monthlySubscriptionCost = 0;
    activeSubscriptions.forEach(sub => {
      switch (sub.billing_cycle) {
        case 'monthly':
          monthlySubscriptionCost += sub.amount;
          break;
        case 'yearly':
          monthlySubscriptionCost += sub.amount / 12;
          break;
        case 'weekly':
          monthlySubscriptionCost += sub.amount * 4.33;
          break;
      }
    });

    if (monthlySubscriptionCost > stats.monthlyIncome * 0.15) {
      insights.push("Subscription costs are high relative to income - consider optimization");
    }

    // Spending pattern insights
    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      if (topCategory.percentage > 40) {
        insights.push(`High spending concentration in ${topCategory.category} (${topCategory.percentage.toFixed(1)}%)`);
      }
    }

    return insights;
  }

  static formatContextForAI(context: FinancialContext): string {
    if (!context.hasData) {
      return "No financial data available for this user.";
    }

    return `
USER'S FINANCIAL CONTEXT:
${context.summary}

KEY INSIGHTS:
${context.insights.map(insight => `• ${insight}`).join('\n')}

RECENT ACTIVITY:
${context.recentActivity.slice(0, 5).map(activity => 
  `• ${activity.title} ${activity.amount ? `($${activity.amount.toLocaleString()})` : ''} - ${new Date(activity.date).toLocaleDateString()}`
).join('\n')}

Please provide personalized financial advice based on this context.
    `.trim();
  }

  static formatFilteredContextForAI(context: FilteredContext): string {
    if (!context.hasData) {
      return "No financial data available for this user.";
    }

    return `
USER'S ${context.queryType.toUpperCase()} CONTEXT:
${context.summary}

KEY INSIGHTS:
${context.insights.map(insight => `• ${insight}`).join('\n')}

QUERY TYPE: ${context.queryType}
Please provide specific advice related to ${context.queryType} based on this context.
    `.trim();
  }
} 