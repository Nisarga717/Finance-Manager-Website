import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Zap, RotateCcw } from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  billing_cycle: "monthly" | "yearly" | "weekly" | "other";
  next_due_date: string;
  status: "active" | "paused" | "cancelled";
  created_at?: string;
}

const SubscriptionList: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchSubs();
  }, [user]);

  const fetchSubs = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("next_due_date", { ascending: true });
      
    if (error) {
      console.error("Error fetching subscriptions:", error);
    } else {
      setSubs(data || []);
    }
    setIsLoading(false);
  };

  const updateSubscriptionStatus = async (subId: string, newStatus: "active" | "paused" | "cancelled") => {
    const subscription = subs.find(s => s.id === subId);
    if (!subscription) return;

    const previousStatus = subscription.status;

    try {
      // Update subscription status
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("id", subId);
        
      if (subError) {
        console.error("Error updating subscription status:", subError);
        alert("Error updating subscription status. Please try again.");
        return;
      }

      // Handle transaction creation when subscription becomes active
      // Only create transaction if subscription wasn't active before and is now active
      if (previousStatus !== "active" && newStatus === "active") {
        // Create transaction when subscription becomes active (payment made)
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert([{
            user_id: user?.id,
            amount: subscription.amount,
            description: `Subscription payment: ${subscription.service_name}`,
            category: 'Subscriptions',
            type: 'expense',
            date: new Date().toISOString()
          }]);

        if (transactionError) {
          console.error("Error creating transaction:", transactionError);
          // Revert subscription status if transaction creation fails
          await supabase
            .from("subscriptions")
            .update({ status: previousStatus })
            .eq("id", subId);
          alert("Error creating transaction. Subscription status reverted.");
          return;
        }
             } else if (previousStatus === "active" && newStatus !== "active") {
         // Optionally remove the most recent transaction when subscription is paused/cancelled
         // This might not always be desired, so you can comment this out if needed
        const { error: deleteError } = await supabase
          .from("transactions")
          .delete()
          .eq("user_id", user?.id)
          .eq("type", "expense")
          .eq("category", "Subscriptions")
          .ilike("description", `%${subscription.service_name}%`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (deleteError) {
          console.error("Error removing transaction:", deleteError);
          // You might want to handle this case differently
        }
      }

      // Update local state
      setSubs(subs.map(sub => 
        sub.id === subId ? { ...sub, status: newStatus } : sub
      ));

      // Show success message
      if (previousStatus !== "active" && newStatus === "active") {
        alert(`Subscription activated! Transaction created for ${formatCurrency(subscription.amount)}`);
      }

    } catch (error) {
      console.error("Error in updateSubscriptionStatus:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default"; // green
      case "paused": return "secondary"; // gray
      case "cancelled": return "destructive"; // red
      default: return "outline"; // default
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />;
      case "paused": return <Clock className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return { text: `${Math.abs(daysUntilDue)} days overdue`, color: "destructive" };
    if (daysUntilDue === 0) return { text: "Due today", color: "destructive" };
    if (daysUntilDue === 1) return { text: "Due tomorrow", color: "secondary" };
    if (daysUntilDue <= 7) return { text: `${daysUntilDue} days left`, color: "outline" };
    return { text: `${daysUntilDue} days left`, color: "default" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getBillingCycleIcon = (cycle: string) => {
    switch (cycle) {
      case "monthly": return "📅";
      case "yearly": return "🗓️";
      case "weekly": return "📆";
      default: return "⏰";
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="loading-spin w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (subs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <Zap className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions found</h3>
        <p className="text-muted-foreground">
          Start by adding your first subscription to track your recurring services
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subs.map((sub) => {
        const dueStatus = getDaysUntilDue(sub.next_due_date);
        return (
          <Card key={sub.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Subscription Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{sub.service_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <span>{getBillingCycleIcon(sub.billing_cycle)}</span>
                        <span>{capitalizeFirst(sub.billing_cycle)} billing</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(sub.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Next Due Date</p>
                        <p className="text-muted-foreground">{formatDate(sub.next_due_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Billing Cycle</p>
                        <p className="text-muted-foreground">{capitalizeFirst(sub.billing_cycle)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant={dueStatus.color as any}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {dueStatus.text}
                    </Badge>
                    
                    <Badge 
                      variant={getStatusColor(sub.status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(sub.status)}
                      {capitalizeFirst(sub.status)}
                    </Badge>
                  </div>

                  {/* Status Update Dropdown */}
                  <Select
                    value={sub.status}
                    onValueChange={(value: string) => updateSubscriptionStatus(sub.id, value as "active" | "paused" | "cancelled")}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="paused">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Paused
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionList;
