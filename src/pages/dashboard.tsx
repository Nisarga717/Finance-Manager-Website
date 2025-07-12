import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Bell, 
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  Target,
  Zap
} from 'lucide-react';
import { 
  DashboardDataService, 
  DashboardStats, 
  CategorySpending, 
  RecentActivity 
} from '../lib/dashboard-data';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardStats, spending, activity] = await Promise.all([
        DashboardDataService.calculateDashboardStats(user.id),
        DashboardDataService.getCategorySpending(user.id),
        DashboardDataService.getRecentActivity(user.id)
      ]);
      
      setStats(dashboardStats);
      setCategorySpending(spending);
      setRecentActivity(activity);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const formatted = Math.abs(percentage).toFixed(1);
    return `${percentage >= 0 ? '+' : '-'}${formatted}%`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <DollarSign className="h-4 w-4" />;
      case 'bill': return <CreditCard className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      case 'subscription': return <Zap className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'bg-blue-100 text-blue-800';
      case 'bill': return 'bg-orange-100 text-orange-800';
      case 'reminder': return 'bg-purple-100 text-purple-800';
      case 'subscription': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-600 opacity-20 animate-pulse"></div>
                </div>
                <p className="text-purple-700">Loading your financial dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeInScale">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-purple">
            Financial Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome back, {user?.fullName || user?.email}! Here's your comprehensive financial overview.
          </p>
        </div>

        {error && (
          <Alert className="border-destructive glass-card">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats?.totalBalance || 0)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {(stats?.balanceChange || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={stats?.balanceChange && stats.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(stats?.balanceChange || 0)}
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-2000">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Income
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.monthlyIncome || 0)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {(stats?.incomeChange || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={stats?.incomeChange && stats.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(stats?.incomeChange || 0)}
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-4000">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Expenses
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats?.monthlyExpenses || 0)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {(stats?.expenseChange || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-red-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                )}
                <span className={stats?.expenseChange && stats.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatPercentage(stats?.expenseChange || 0)}
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-6000">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Investments
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats?.totalInvestments || 0)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+{formatPercentage(stats?.investmentChange || 0)}</span>
                <span>portfolio growth</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass grid w-full lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="spending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              <PieChart className="h-4 w-4 mr-2" />
              Spending
            </TabsTrigger>
            <TabsTrigger value="bills" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Bills & Subscriptions
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              <Clock className="h-4 w-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="lg:col-span-2 glass-card border-0 shadow-lg hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Financial Health</span>
                  </CardTitle>
                  <CardDescription>
                    Overview of your financial status and upcoming obligations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Upcoming Bills</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={stats?.upcomingBills && stats.upcomingBills > 0 ? "destructive" : "secondary"}>
                          {stats?.upcomingBills || 0}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Next 30 days</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Active Subscriptions</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{stats?.activeSubscriptions || 0}</Badge>
                        <span className="text-sm text-muted-foreground">Services</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Upcoming Reminders</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={stats?.upcomingReminders && stats.upcomingReminders > 0 ? "default" : "secondary"}>
                          {stats?.upcomingReminders || 0}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Next 7 days</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Total Bills</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{stats?.totalBills || 0}</Badge>
                        <span className="text-sm text-muted-foreground">Tracked</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Savings Rate */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Savings Rate</p>
                      <span className="text-sm text-muted-foreground">
                        {stats?.monthlyIncome && stats.monthlyExpenses ? 
                          Math.round(((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats?.monthlyIncome && stats.monthlyExpenses ? 
                        Math.max(0, ((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100) : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Spending */}
              <Card className="glass-card border-0 shadow-lg hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <span>Top Categories</span>
                  </CardTitle>
                  <CardDescription>Your spending by category this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {categorySpending.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No spending data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categorySpending.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="font-medium">{category.category}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {formatCurrency(category.amount)}
                            </span>
                          </div>
                          <Progress 
                            value={category.percentage} 
                            className="h-2"
                            style={{ 
                              backgroundColor: `${category.color}20`,
                            }}
                          />
                          <p className="text-xs text-muted-foreground text-right">
                            {category.percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Your latest transactions, bills, and reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                              {activity.category && (
                                <span className="text-xs text-muted-foreground">
                                  {activity.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            {activity.amount && (
                              <p className={`text-sm font-medium ${
                                activity.amount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(activity.amount)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {index < recentActivity.length - 1 && <Separator />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card border-0 shadow-lg hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">Bills Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Bills</span>
                    <Badge variant="outline">{stats?.totalBills || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Upcoming (30 days)</span>
                    <Badge variant={stats?.upcomingBills && stats.upcomingBills > 0 ? "destructive" : "secondary"}>
                      {stats?.upcomingBills || 0}
                    </Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 btn-pulse" size="sm">
                    Manage Bills
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">Subscriptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Services</span>
                    <Badge variant="outline">{stats?.activeSubscriptions || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Cost</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(stats?.monthlyExpenses || 0)}
                    </span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 btn-pulse" size="sm">
                    Manage Subscriptions
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">Reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Upcoming (7 days)</span>
                    <Badge variant={stats?.upcomingReminders && stats.upcomingReminders > 0 ? "default" : "secondary"}>
                      {stats?.upcomingReminders || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">All set</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 btn-pulse" size="sm">
                    View Reminders
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spending" className="space-y-6">
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Spending Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of your expenses this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categorySpending.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No spending data available for this month</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categorySpending.map((category, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(category.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.percentage.toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={category.percentage} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;