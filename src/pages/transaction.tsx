import React, { useState, useEffect, useCallback } from "react";
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Tag, 
  Calendar, 
  BarChart3, 
  PieChart as PieChartIcon,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
  date: string;
  created_at?: string;
}

interface FormData {
  amount: string;
  description: string;
  category: string;
  type: 'expense' | 'income';
}

interface CategoryData {
  [key: string]: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface PieChartData {
  name: string;
  value: number;
}

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<FormData>({ 
    amount: "", 
    description: "", 
    category: "", 
    type: "expense" 
  });
  const [showForm, setShowForm] = useState(false);
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    if (!form.amount || !form.category) {
      alert('Please fill in amount and category');
      return;
    }

    const newTransaction = {
      user_id: user.id,
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category,
      type: form.type,
      date: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("transactions")
      .insert([newTransaction]);

    if (error) {
      console.error("Error adding transaction:", error);
      alert('Error adding transaction');
    } else {
      fetchTransactions();
      setForm({ amount: "", description: "", category: "", type: "expense" });
      setShowForm(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;

  const categoryData: CategoryData = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + t.amount;
    }
    return acc;
  }, {} as CategoryData);

  const pieChartData: PieChartData[] = Object.entries(categoryData).map(([name, value]) => ({ 
    name, 
    value 
  }));

  const monthlyData: MonthlyData[] = Object.values(
    transactions.reduce((acc, t) => {
      const month = new Date(t.date || t.created_at || Date.now()).toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
      
      if (!acc[month]) {
        acc[month] = { month, income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      
      return acc;
    }, {} as { [key: string]: MonthlyData })
  ).slice(-6);

  const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeInScale">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-purple">
            Transaction Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your income and expenses with powerful analytics and insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalIncome.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span>Money earned</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-2000">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{totalExpenses.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <ArrowDownRight className="h-3 w-3 text-red-600" />
                <span>Money spent</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-4000">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                balance >= 0 ? 'bg-purple-100' : 'bg-orange-100'
              }`}>
                <Wallet className={`h-4 w-4 ${balance >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                balance >= 0 ? 'text-purple-600' : 'text-orange-600'
              }`}>
                ₹{Math.abs(balance).toLocaleString()}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {balance >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Positive balance</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Deficit</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Transaction Button */}
        <div className="flex justify-center">
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-pulse"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-md">
              <DialogHeader>
                <DialogTitle className="gradient-text-purple">Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record your income or expense with detailed information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, amount: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter description (optional)"
                    value={form.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Food, Transport, Salary"
                    value={form.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, category: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={form.type} onValueChange={(value: 'expense' | 'income') => setForm({...form, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 btn-pulse"
                >
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics Section */}
        {transactions.length > 0 && (
          <Tabs value={activeChart} onValueChange={(value) => setActiveChart(value as 'pie' | 'bar' | 'line')} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <TabsList className="glass">
                <TabsTrigger value="pie" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="bar">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="line">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trends
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pie">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>Breakdown of your spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {pieChartData.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {pieChartData.map((item, index) => (
                        <div key={item.name} className="text-center p-4 rounded-lg hover:bg-purple-50/50 transition-colors">
                          <div 
                            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          >
                            {Math.round((item.value / pieChartData.reduce((sum, i) => sum + i.value, 0)) * 100)}%
                          </div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-muted-foreground">₹{item.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No expense data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bar">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>Income vs expenses over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No monthly data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="line">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Spending Trends</CardTitle>
                  <CardDescription>Track your financial trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
                          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No trend data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Transactions List */}
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spin w-8 h-8"></div>
                <span className="ml-3 text-muted-foreground">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">Add your first transaction to get started!</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-purple-50/50 transition-colors border border-purple-100">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description || 'No description'}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>{tx.category}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(tx.date || tx.created_at || Date.now()).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </p>
                      <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;