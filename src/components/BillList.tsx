import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

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

  useEffect(() => {
    if (user?.id) fetchBills();
  }, [user]);

  const fetchBills = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error fetching bills:", error);
    } else {
      setBills(data || []);
    }
  };

  const getStatusColor = (dueDate: string, status?: string) => {
    if (status === "paid") return "#10b981"; // green
    if (status === "overdue") return "#ef4444"; // red
    
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) return "#ef4444"; // overdue - red
    if (daysUntilDue <= 3) return "#f59e0b"; // due soon - amber
    return "#7c3aed"; // normal - purple
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

  const billNameStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  };

  const companyStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
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

  return (
    <div style={containerStyles}>
      <h2 style={headerStyles}>Your Bills</h2>
      
      {bills.length === 0 ? (
        <div style={emptyStateStyles}>
          <p style={emptyTextStyles}>No bills found. Start by adding your first bill!</p>
        </div>
      ) : (
        <div>
          {bills.map((bill) => (
            <div 
              key={bill.id} 
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
                  <h3 style={billNameStyles}>{bill.name}</h3>
                  {bill.company && <p style={companyStyles}>{bill.company}</p>}
                </div>
                <div style={amountStyles}>₹{bill.amount.toFixed(2)}</div>
              </div>

              <div style={cardBodyStyles}>
                <div style={infoItemStyles}>
                  <span style={labelStyles}>Due Date</span>
                  <span style={valueStyles}>{formatDate(bill.due_date)}</span>
                </div>
                
                <div style={infoItemStyles}>
                  <span style={labelStyles}>Category</span>
                  <span style={valueStyles}>{bill.category || 'Uncategorized'}</span>
                </div>
              </div>

              <div style={footerStyles}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={badgeStyles(getStatusColor(bill.due_date, bill.status))}>
                    {getDaysUntilDue(bill.due_date)}
                  </span>
                  {bill.is_recurring && (
                    <span style={recurringBadgeStyles}>
                      🔄 Recurring
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillList;
