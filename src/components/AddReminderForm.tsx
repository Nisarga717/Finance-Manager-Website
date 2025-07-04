import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Bell, Calendar, FileText, RotateCcw } from "lucide-react";

interface ReminderFormData {
  title: string;
  description: string;
  reminder_date: string;
  is_recurring: boolean;
}

interface AddReminderFormProps {
  onClose: () => void;
}

const AddReminderForm: React.FC<AddReminderFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<ReminderFormData>({ 
    title: "", 
    description: "", 
    reminder_date: "", 
    is_recurring: false 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    const { title, description, reminder_date, is_recurring } = form;
    
    if (!title || !reminder_date) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from("reminders").insert([{ 
      user_id: user.id, 
      title, 
      description, 
      reminder_date, 
      is_recurring,
      status: "pending"
    }]);
    
    if (error) {
      console.error("Error adding reminder:", error);
      alert("Error adding reminder. Please try again.");
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Reminder Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminder Title *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter reminder title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter reminder description (optional)"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
            />
          </div>

          {/* Reminder Date */}
          <div className="space-y-2">
            <Label htmlFor="reminder_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reminder Date *
            </Label>
            <Input
              id="reminder_date"
              name="reminder_date"
              type="date"
              value={form.reminder_date}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Recurring Checkbox */}
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border">
            <input
              type="checkbox"
              name="is_recurring"
              checked={form.is_recurring}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              id="is_recurring_reminder"
            />
            <Label htmlFor="is_recurring_reminder" className="flex items-center gap-2 text-sm font-medium text-purple-700 cursor-pointer">
              <RotateCcw className="h-4 w-4" />
              This is a recurring reminder
            </Label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Reminder"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddReminderForm;
