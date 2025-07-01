import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  billing_cycle: "monthly" | "yearly" | "weekly" | "other";
  next_due_date: string;
  status: "active" | "inactive" | "cancelled";
  created_at?: string;
}

const SubscriptionList: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    if (user?.id) fetchSubs();
  }, [user]);

  const fetchSubs = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error fetching subscriptions:", error);
    } else {
      setSubs(data || []);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#10b981"; // green
      case "inactive": return "#f59e0b"; // amber
      case "cancelled": return "#ef4444"; // red
      default: return "#6b7280"; // gray
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return { text: `${Math.abs(daysUntilDue)} days overdue`, color: "#ef4444" };
    if (daysUntilDue === 0) return { text: "Due today", color: "#ef4444" };
    if (daysUntilDue === 1) return { text: "Due tomorrow", color: "#f59e0b" };
    if (daysUntilDue <= 7) return { text: `${daysUntilDue} days left`, color: "#7c3aed" };
    return { text: `${daysUntilDue} days left`, color: "#10b981" };
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

  const serviceNameStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  };

  const amountStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#7c3aed'
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

  const statusBadgeStyles = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    backgroundColor: `${color}15`,
    color: color,
    border: `1px solid ${color}30`
  });

  const billingCycleStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#6b7280'
  };

  return (
    <div style={containerStyles}>
      <h2 style={headerStyles}>Your Subscriptions</h2>
      
      {subs.length === 0 ? (
        <div style={emptyStateStyles}>
          <p style={emptyTextStyles}>No subscriptions found. Start by adding your first subscription!</p>
        </div>
      ) : (
        <div>
          {subs.map((sub) => {
            const dueStatus = getDaysUntilDue(sub.next_due_date);
            return (
              <div 
                key={sub.id} 
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
                  <div>
                    <h3 style={serviceNameStyles}>{sub.service_name}</h3>
                    <div style={billingCycleStyles}>
                      <span>{getBillingCycleIcon(sub.billing_cycle)}</span>
                      <span>{capitalizeFirst(sub.billing_cycle)} billing</span>
                    </div>
                  </div>
                  <div style={amountStyles}>₹{sub.amount.toFixed(2)}</div>
                </div>

                <div style={cardBodyStyles}>
                  <div style={infoItemStyles}>
                    <span style={labelStyles}>Next Due Date</span>
                    <span style={valueStyles}>{formatDate(sub.next_due_date)}</span>
                  </div>
                  
                  <div style={infoItemStyles}>
                    <span style={labelStyles}>Billing Cycle</span>
                    <span style={valueStyles}>{capitalizeFirst(sub.billing_cycle)}</span>
                  </div>
                </div>

                <div style={footerStyles}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={badgeStyles(dueStatus.color)}>
                      {dueStatus.text}
                    </span>
                    <span style={statusBadgeStyles(getStatusColor(sub.status))}>
                      {capitalizeFirst(sub.status)}
                    </span>
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

export default SubscriptionList;
