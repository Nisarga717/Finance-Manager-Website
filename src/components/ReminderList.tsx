import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, Bell, Clock, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reminder_date: string;
  is_recurring: boolean;
  status?: "pending" | "completed" | "dismissed";
  created_at?: string;
}

const ReminderList: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchReminders();
  }, [user]);

  const fetchReminders = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_date", { ascending: true });
      
    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      setReminders(data || []);
    }
    setIsLoading(false);
  };

  const updateReminderStatus = async (reminderId: string, newStatus: "pending" | "completed" | "dismissed") => {
    const { error } = await supabase
      .from("reminders")
      .update({ status: newStatus })
      .eq("id", reminderId);
      
    if (error) {
      console.error("Error updating reminder status:", error);
    } else {
      // Update local state
      setReminders(reminders.map(reminder => 
        reminder.id === reminderId ? { ...reminder, status: newStatus } : reminder
      ));
    }
  };

  const getStatusColor = (reminderDate: string, status?: string) => {
    if (status === "completed") return "default"; // green
    if (status === "dismissed") return "secondary"; // gray
    
    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysUntilReminder = Math.ceil((reminder.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilReminder < 0) return "secondary"; // past due - gray
    if (daysUntilReminder === 0) return "destructive"; // today - red
    if (daysUntilReminder === 1) return "secondary"; // tomorrow - orange
    if (daysUntilReminder <= 7) return "outline"; // this week - purple
    return "default"; // future - green
  };

  const getStatusIcon = (reminderDate: string, status?: string) => {
    if (status === "completed") return <CheckCircle className="h-4 w-4" />;
    if (status === "dismissed") return <AlertCircle className="h-4 w-4" />;
    
    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysUntilReminder = Math.ceil((reminder.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilReminder <= 0) return <Bell className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getReminderStatus = (reminderDate: string, status?: string) => {
    if (status === "completed") return { text: "Completed", color: "default" };
    if (status === "dismissed") return { text: "Dismissed", color: "secondary" };
    
    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysUntilReminder = Math.ceil((reminder.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilReminder < 0) return { text: `${Math.abs(daysUntilReminder)} days ago`, color: "secondary" };
    if (daysUntilReminder === 0) return { text: "Today", color: "destructive" };
    if (daysUntilReminder === 1) return { text: "Tomorrow", color: "secondary" };
    if (daysUntilReminder <= 7) return { text: `In ${daysUntilReminder} days`, color: "outline" };
    return { text: `In ${daysUntilReminder} days`, color: "default" };
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="loading-spin w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reminders...</p>
        </div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <Bell className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders found</h3>
        <p className="text-muted-foreground">
          Start by adding your first reminder to never miss important dates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => {
        const status = getReminderStatus(reminder.reminder_date, reminder.status);
        return (
          <Card key={reminder.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Reminder Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Reminder Date</p>
                        <p className="text-muted-foreground">{formatDate(reminder.reminder_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-muted-foreground">{formatTime(reminder.reminder_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant={status.color as any}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(reminder.reminder_date, reminder.status)}
                      {status.text}
                    </Badge>
                    
                    {reminder.is_recurring && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Recurring
                      </Badge>
                    )}
                  </div>

                  {/* Status Update Dropdown */}
                  <Select
                    value={reminder.status || "pending"}
                    onValueChange={(value: string) => updateReminderStatus(reminder.id, value as "pending" | "completed" | "dismissed")}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="dismissed">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          Dismissed
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

export default ReminderList;