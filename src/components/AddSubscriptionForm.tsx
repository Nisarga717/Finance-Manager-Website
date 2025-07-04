import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DollarSign, Calendar, Zap, CheckCircle } from "lucide-react";

interface SubscriptionFormData {
  service_name: string;
  amount: string;
  billing_cycle: "monthly" | "yearly" | "weekly" | "other";
  next_due_date: string;
  status: "active" | "paused" | "cancelled";
}

interface AddSubscriptionFormProps {
  onClose: () => void;
}

const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<SubscriptionFormData>({ 
    service_name: "", 
    amount: "", 
    billing_cycle: "monthly", 
    next_due_date: "", 
    status: "active" 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    const { service_name, amount, billing_cycle, next_due_date, status } = form;
    
    if (!service_name || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from("subscriptions").insert([{ 
      user_id: user.id, 
      service_name, 
      amount: parseFloat(amount), 
      billing_cycle, 
      next_due_date, 
      status 
    }]);
    
    if (error) {
      console.error("Error adding subscription:", error);
      alert("Error adding subscription. Please try again.");
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  const billingCycles = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "weekly", label: "Weekly" },
    { value: "other", label: "Other" }
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="service_name" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Service Name *
            </Label>
            <Input
              id="service_name"
              name="service_name"
              placeholder="e.g., Netflix, Spotify, Adobe"
              value={form.service_name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount *
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Billing Cycle */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              📅 Billing Cycle
            </Label>
            <Select value={form.billing_cycle} onValueChange={(value) => handleSelectChange('billing_cycle', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {billingCycles.map((cycle) => (
                  <SelectItem key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Next Due Date */}
          <div className="space-y-2">
            <Label htmlFor="next_due_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Due Date
            </Label>
            <Input
              id="next_due_date"
              name="next_due_date"
              type="date"
              value={form.next_due_date}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Status
            </Label>
            <Select value={form.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {isLoading ? "Adding..." : "Add Subscription"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSubscriptionForm;
