import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Calendar, DollarSign, Building, Tag, RotateCcw } from "lucide-react";

interface BillFormData {
  name: string;
  amount: string;
  due_date: string;
  category: string;
  is_recurring: boolean;
  company: string;
}

interface AddBillFormProps {
  onClose: () => void;
}

const AddBillForm: React.FC<AddBillFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<BillFormData>({ 
    name: "", 
    amount: "", 
    due_date: "", 
    category: "", 
    is_recurring: false, 
    company: "" 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
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

    const { name, amount, due_date, category, is_recurring, company } = form;
    
    if (!name || !amount || !due_date) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from("bills").insert([{ 
      user_id: user.id, 
      name, 
      amount: parseFloat(amount), 
      due_date, 
      category, 
      is_recurring, 
      company,
      status: "pending"
    }]);
    
    if (error) {
      console.error("Error adding bill:", error);
      alert("Error adding bill. Please try again.");
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  const categories = [
    "Utilities", "Entertainment", "Internet", "Phone", "Insurance", 
    "Rent/Mortgage", "Credit Card", "Loans", "Subscriptions", "Other"
  ];

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Bill Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Bill Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter bill name"
              value={form.name}
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

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date *
            </Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Category
            </Label>
            <Select value={form.category} onValueChange={(value) => handleSelectChange('category', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., Electric Company, Netflix"
              value={form.company}
              onChange={handleChange}
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
              id="is_recurring"
            />
            <Label htmlFor="is_recurring" className="flex items-center gap-2 text-sm font-medium text-purple-700 cursor-pointer">
              <RotateCcw className="h-4 w-4" />
              This is a recurring bill
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
            {isLoading ? "Adding..." : "Add Bill"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBillForm;