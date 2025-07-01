import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

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
    const { error } = await supabase.from("reminders").insert([{ 
      user_id: user.id, 
      title, 
      description, 
      reminder_date, 
      is_recurring 
    }]);
    
    if (error) {
      console.error("Error adding reminder:", error);
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

  const textareaStyles: React.CSSProperties = {
    ...inputStyles,
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit'
  };

  const checkboxContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: '#faf5ff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  const checkboxStyles: React.CSSProperties = {
    marginRight: '12px',
    width: '18px',
    height: '18px',
    accentColor: '#7c3aed'
  };

  const checkboxLabelStyles: React.CSSProperties = {
    fontSize: '16px',
    color: '#6b21a8',
    fontWeight: '500',
    cursor: 'pointer'
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
      <h2 style={titleStyles}>Add New Reminder</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyles}>
          <label style={labelStyles}>Reminder Title *</label>
          <input 
            name="title" 
            placeholder="Enter reminder title" 
            value={form.title} 
            onChange={handleChange} 
            required 
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={inputContainerStyles}>
          <label style={labelStyles}>Description</label>
          <textarea 
            name="description" 
            placeholder="Enter reminder description (optional)" 
            value={form.description} 
            onChange={handleChange} 
            style={textareaStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={inputContainerStyles}>
          <label style={labelStyles}>Reminder Date *</label>
          <input 
            name="reminder_date" 
            type="date" 
            value={form.reminder_date} 
            onChange={handleChange} 
            required 
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={checkboxContainerStyles}>
          <input 
            type="checkbox" 
            name="is_recurring" 
            checked={form.is_recurring} 
            onChange={handleChange} 
            style={checkboxStyles}
            id="is_recurring_reminder"
          />
          <label htmlFor="is_recurring_reminder" style={checkboxLabelStyles}>
            This is a recurring reminder
          </label>
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
            Add Reminder
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReminderForm;
