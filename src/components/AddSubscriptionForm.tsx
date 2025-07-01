import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

interface SubscriptionFormData {
  service_name: string;
  amount: string;
  billing_cycle: "monthly" | "yearly" | "weekly" | "other";
  next_due_date: string;
  status: "active" | "inactive" | "cancelled";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    const { service_name, amount, billing_cycle, next_due_date, status } = form;
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
    } else {
      onClose();
    }
  };

  const formStyles: React.CSSProperties = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: '24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const inputContainerStyles: React.CSSProperties = {
    marginBottom: '20px'
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b21a8',
    marginBottom: '8px'
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#374151',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b21a8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
    appearance: 'none'
  };

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '32px'
  };

  const submitButtonStyles: React.CSSProperties = {
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  };

  const cancelButtonStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#6b21a8',
    border: '2px solid #ddd6fe',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={formStyles}>
      <h2 style={titleStyles}>Add New Subscription</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyles}>
          <label style={labelStyles}>Service Name *</label>
          <input 
            name="service_name" 
            placeholder="e.g., Netflix, Spotify, Adobe" 
            value={form.service_name} 
            onChange={handleChange} 
            required 
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={inputContainerStyles}>
          <label style={labelStyles}>Amount *</label>
          <input 
            name="amount" 
            type="number" 
            step="0.01"
            placeholder="0.00" 
            value={form.amount} 
            onChange={handleChange} 
            required 
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={inputContainerStyles}>
          <label style={labelStyles}>Billing Cycle</label>
          <select 
            name="billing_cycle" 
            value={form.billing_cycle} 
            onChange={handleChange}
            style={selectStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={inputContainerStyles}>
          <label style={labelStyles}>Next Due Date</label>
          <input 
            name="next_due_date" 
            type="date" 
            value={form.next_due_date} 
            onChange={handleChange} 
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={inputContainerStyles}>
          <label style={labelStyles}>Status</label>
          <select 
            name="status" 
            value={form.status} 
            onChange={handleChange}
            style={selectStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={buttonContainerStyles}>
          <button 
            type="button" 
            onClick={onClose}
            style={cancelButtonStyles}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#7c3aed';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#ddd6fe';
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            style={submitButtonStyles}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#6d28d9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
            }}
          >
            Add Subscription
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubscriptionForm;
