import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reminder_date: string;
  is_recurring: boolean;
  created_at?: string;
}

const ReminderList: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (user?.id) fetchReminders();
  }, [user]);

  const fetchReminders = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      setReminders(data || []);
    }
  };

  const getReminderStatus = (reminderDate: string) => {
    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysUntilReminder = Math.ceil((reminder.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilReminder < 0) return { text: `${Math.abs(daysUntilReminder)} days ago`, color: "#6b7280" };
    if (daysUntilReminder === 0) return { text: "Today", color: "#ef4444" };
    if (daysUntilReminder === 1) return { text: "Tomorrow", color: "#f59e0b" };
    if (daysUntilReminder <= 7) return { text: `In ${daysUntilReminder} days`, color: "#7c3aed" };
    return { text: `In ${daysUntilReminder} days`, color: "#10b981" };
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

  const containerStyles: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#4c1d95',
    marginBottom: '24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#faf5ff',
    borderRadius: '16px',
    border: '2px dashed #ddd6fe'
  };

  const emptyTextStyles: React.CSSProperties = {
    fontSize: '18px',
    color: '#6b21a8',
    fontWeight: '500'
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const cardHeaderStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0
  };

  const cardBodyStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  };

  const infoItemStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b21a8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px'
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  };

  const footerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  };

  const badgeStyles = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: `${color}15`,
    color: color,
    border: `1px solid ${color}30`
  });

  const recurringBadgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: '1px solid #d1d5db'
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '24px',
    color: '#7c3aed'
  };

  return (
    <div style={containerStyles}>
      <h2 style={headerStyles}>Your Reminders</h2>
      
      {reminders.length === 0 ? (
        <div style={emptyStateStyles}>
          <p style={emptyTextStyles}>No reminders found. Start by adding your first reminder!</p>
        </div>
      ) : (
        <div>
          {reminders.map((reminder) => {
            const status = getReminderStatus(reminder.reminder_date);
            return (
              <div 
                key={reminder.id} 
                style={cardStyles}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(147, 51, 234, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.1)';
                }}
              >
                <div style={cardHeaderStyles}>
                  <div style={{ flex: 1 }}>
                    <h3 style={titleStyles}>{reminder.title}</h3>
                    {reminder.description && (
                      <p style={descriptionStyles}>{reminder.description}</p>
                    )}
                  </div>
                  <div style={iconStyles}>🔔</div>
                </div>

                <div style={cardBodyStyles}>
                  <div style={infoItemStyles}>
                    <span style={labelStyles}>Reminder Date</span>
                    <span style={valueStyles}>{formatDate(reminder.reminder_date)}</span>
                  </div>
                  
                  <div style={infoItemStyles}>
                    <span style={labelStyles}>Time</span>
                    <span style={valueStyles}>{formatTime(reminder.reminder_date)}</span>
                  </div>
                </div>

                <div style={footerStyles}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={badgeStyles(status.color)}>
                      {status.text}
                    </span>
                    {reminder.is_recurring && (
                      <span style={recurringBadgeStyles}>
                        🔄 Recurring
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReminderList;