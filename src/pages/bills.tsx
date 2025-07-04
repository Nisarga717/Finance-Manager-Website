import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Receipt, 
  Zap, 
  Bell, 
  Plus, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { supabase } from '../lib/supabaseClient';

// Import your existing components
import AddBillForm from '../components/AddBillForm';
import BillList from '../components/BillList';
import AddSubscriptionForm from '../components/AddSubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import AddReminderForm from '../components/AddReminderForm';
import ReminderList from '../components/ReminderList';

interface BillStats {
  pending: number;
  paid: number;
  overdue: number;
}

interface SubscriptionStats {
  active: number;
  monthlySpending: number;
}

interface ReminderStats {
  active: number;
  dueThisWeek: number;
}

const Bills: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bills');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'bill' | 'subscription' | 'reminder'>('bill');
  const [billStats, setBillStats] = useState<BillStats>({ pending: 0, paid: 0, overdue: 0 });
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({ active: 0, monthlySpending: 0 });
  const [reminderStats, setReminderStats] = useState<ReminderStats>({ active: 0, dueThisWeek: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bills statistics
  const fetchBillStats = useCallback(async () => {
    if (!user?.id) return;
    
    const { data: bills, error } = await supabase
      .from("bills")
      .select("status, due_date")
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error fetching bills:", error);
      return;
    }

    const stats = { pending: 0, paid: 0, overdue: 0 };
    const today = new Date();
    
    bills?.forEach(bill => {
      const dueDate = new Date(bill.due_date);
      const status = bill.status || 'pending';
      
      if (status === 'paid') {
        stats.paid++;
      } else if (status === 'overdue' || (status === 'pending' && dueDate < today)) {
        stats.overdue++;
      } else {
        stats.pending++;
      }
    });
    
    setBillStats(stats);
  }, [user?.id]);

  // Fetch subscription statistics
  const fetchSubscriptionStats = useCallback(async () => {
    if (!user?.id) return;
    
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("status, amount, billing_cycle")
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error fetching subscriptions:", error);
      return;
    }

    let activeCount = 0;
    let monthlySpending = 0;
    
    subscriptions?.forEach(sub => {
      if (sub.status === 'active') {
        activeCount++;
        
        // Convert all billing cycles to monthly amount
        let monthlyAmount = sub.amount;
        switch (sub.billing_cycle) {
          case 'yearly':
            monthlyAmount = sub.amount / 12;
            break;
          case 'weekly':
            monthlyAmount = sub.amount * 4.33; // Average weeks per month
            break;
          case 'monthly':
          default:
            monthlyAmount = sub.amount;
            break;
        }
        monthlySpending += monthlyAmount;
      }
    });
    
    setSubscriptionStats({ active: activeCount, monthlySpending: Math.round(monthlySpending) });
  }, [user?.id]);

  // Fetch reminder statistics
  const fetchReminderStats = useCallback(async () => {
    if (!user?.id) return;
    
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("status, reminder_date")
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error fetching reminders:", error);
      return;
    }

    let activeCount = 0;
    let dueThisWeek = 0;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    reminders?.forEach(reminder => {
      const reminderDate = new Date(reminder.reminder_date);
      const status = reminder.status || 'pending';
      
      if (status !== 'completed' && status !== 'dismissed') {
        activeCount++;
        
        if (reminderDate >= today && reminderDate <= nextWeek) {
          dueThisWeek++;
        }
      }
    });
    
    setReminderStats({ active: activeCount, dueThisWeek });
  }, [user?.id]);

  // Fetch all statistics
  const fetchAllStats = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    await Promise.all([
      fetchBillStats(),
      fetchSubscriptionStats(),
      fetchReminderStats()
    ]);
    setIsLoading(false);
  }, [user?.id, fetchBillStats, fetchSubscriptionStats, fetchReminderStats]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleOpenDialog = (type: 'bill' | 'subscription' | 'reminder') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Refresh statistics when dialog closes (after adding new item)
    fetchAllStats();
  };

  const getDialogComponent = () => {
    switch (dialogType) {
      case 'bill': return <AddBillForm onClose={handleCloseDialog} />;
      case 'subscription': return <AddSubscriptionForm onClose={handleCloseDialog} />;
      case 'reminder': return <AddReminderForm onClose={handleCloseDialog} />;
      default: return null;
    }
  };

  const getAddButtonType = () => {
    switch (activeTab) {
      case 'bills': return 'bill';
      case 'subscriptions': return 'subscription';
      case 'reminders': return 'reminder';
      default: return 'bill';
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'bill': return 'Add New Bill';
      case 'subscription': return 'Add New Subscription';
      case 'reminder': return 'Add New Reminder';
      default: return 'Add New Item';
    }
  };

  const getDialogDescription = () => {
    switch (dialogType) {
      case 'bill': return 'Add a new bill to track your upcoming payments';
      case 'subscription': return 'Add a new subscription to manage your recurring services';
      case 'reminder': return 'Add a new reminder to never miss important dates';
      default: return '';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeInScale">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-purple">
            Financial Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your bills, subscriptions, and reminders all in one place
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-6">
            {/* Bills Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Bills
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {isLoading ? '...' : billStats.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting payment
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-2000">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paid Bills
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {isLoading ? '...' : billStats.paid}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-4000">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Bills
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {isLoading ? '...' : billStats.overdue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bills List */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Bills</CardTitle>
                  <CardDescription>
                    Track and manage all your upcoming payments
                  </CardDescription>
                </div>
                <Dialog open={openDialog && dialogType === 'bill'} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleOpenDialog('bill')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{getDialogTitle()}</DialogTitle>
                      <DialogDescription>{getDialogDescription()}</DialogDescription>
                    </DialogHeader>
                    {getDialogComponent()}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <BillList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            {/* Subscriptions Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? '...' : subscriptionStats.active}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently running services
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-2000">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Spending
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {isLoading ? '...' : `₹${subscriptionStats.monthlySpending.toLocaleString()}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total subscription costs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subscriptions List */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Subscriptions</CardTitle>
                  <CardDescription>
                    Manage your recurring services and payments
                  </CardDescription>
                </div>
                <Dialog open={openDialog && dialogType === 'subscription'} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleOpenDialog('subscription')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{getDialogTitle()}</DialogTitle>
                      <DialogDescription>{getDialogDescription()}</DialogDescription>
                    </DialogHeader>
                    {getDialogComponent()}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <SubscriptionList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            {/* Reminders Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Reminders
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {isLoading ? '...' : reminderStats.active}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming notifications
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover-lift animate-slideInUp animation-delay-2000">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Due This Week
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {isLoading ? '...' : reminderStats.dueThisWeek}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In the next 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reminders List */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Reminders</CardTitle>
                  <CardDescription>
                    Never miss important dates and deadlines
                  </CardDescription>
                </div>
                <Dialog open={openDialog && dialogType === 'reminder'} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleOpenDialog('reminder')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reminder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{getDialogTitle()}</DialogTitle>
                      <DialogDescription>{getDialogDescription()}</DialogDescription>
                    </DialogHeader>
                    {getDialogComponent()}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ReminderList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Bills;