import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, DollarSign, Tag, Clock, CheckCircle, AlertCircle, Building } from "lucide-react";

interface Bill {
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

const BillList: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchBills();
  }, [user]);

  const fetchBills = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });
      
    if (error) {
      console.error("Error fetching bills:", error);
    } else {
      setBills(data || []);
    }
    setIsLoading(false);
  };

  const updateBillStatus = async (billId: string, newStatus: "pending" | "paid" | "overdue") => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const previousStatus = bill.status || "pending";

    try {
      // Update bill status
      const { error: billError } = await supabase
        .from("bills")
        .update({ status: newStatus })
        .eq("id", billId);
        
      if (billError) {
        console.error("Error updating bill status:", billError);
        alert("Error updating bill status. Please try again.");
        return;
      }

      // Handle transaction creation/removal based on status change
      if (previousStatus !== "paid" && newStatus === "paid") {
        // Create transaction when marking as paid
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert([{
            user_id: user?.id,
            amount: bill.amount,
            description: `Bill payment: ${bill.name}${bill.company ? ` (${bill.company})` : ''}`,
            category: bill.category || 'Bills',
            type: 'expense',
            date: new Date().toISOString()
          }]);

        if (transactionError) {
          console.error("Error creating transaction:", transactionError);
          // Revert bill status if transaction creation fails
          await supabase
            .from("bills")
            .update({ status: previousStatus })
            .eq("id", billId);
          alert("Error creating transaction. Bill status reverted.");
          return;
        }
      } else if (previousStatus === "paid" && newStatus !== "paid") {
        // Remove the most recent transaction for this bill (by description match)
        const { error: deleteError } = await supabase
          .from("transactions")
          .delete()
          .eq("user_id", user?.id)
          .eq("type", "expense")
          .eq("category", bill.category || 'Bills')
          .ilike("description", `%${bill.name}%`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (deleteError) {
          console.error("Error removing transaction:", deleteError);
          // You might want to handle this case differently
        }
      }

      // Update local state
      setBills(bills.map(b => 
        b.id === billId ? { ...b, status: newStatus } : b
      ));

      // Show success message
      if (previousStatus !== "paid" && newStatus === "paid") {
        alert(`Bill marked as paid! Transaction created for ${formatCurrency(bill.amount)}`);
      }

    } catch (error) {
      console.error("Error in updateBillStatus:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getStatusColor = (dueDate: string, status?: string) => {
    if (status === "paid") return "default"; // green
    if (status === "overdue") return "destructive"; // red
    
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return "destructive"; // overdue - red
    if (daysUntilDue <= 3) return "secondary"; // due soon - yellow
    return "outline"; // normal - purple
  };

  const getStatusIcon = (dueDate: string, status?: string) => {
    if (status === "paid") return <CheckCircle className="h-4 w-4" />;
    if (status === "overdue") return <AlertCircle className="h-4 w-4" />;
    
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `${daysUntilDue} days left`;
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
          <p className="text-muted-foreground">Loading bills...</p>
        </div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bills found</h3>
        <p className="text-muted-foreground">
          Start by adding your first bill to track your payments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <Card key={bill.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Bill Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bill.name}</h3>
                    {bill.company && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Building className="h-3 w-3" />
                        {bill.company}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(bill.amount)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className="text-muted-foreground">{formatDate(bill.due_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-muted-foreground">{bill.category || 'Uncategorized'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(bill.due_date, bill.status)}
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-muted-foreground">{getDaysUntilDue(bill.due_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge 
                    variant={getStatusColor(bill.due_date, bill.status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(bill.due_date, bill.status)}
                    {bill.status ? bill.status.charAt(0).toUpperCase() + bill.status.slice(1) : 'Pending'}
                  </Badge>
                  
                  {bill.is_recurring && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      🔄 Recurring
                    </Badge>
                  )}
                </div>

                {/* Status Update Dropdown */}
                                 <Select
                   value={bill.status || "pending"}
                   onValueChange={(value: string) => updateBillStatus(bill.id, value as "pending" | "paid" | "overdue")}
                 >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Paid
                      </div>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BillList;
