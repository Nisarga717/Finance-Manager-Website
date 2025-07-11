import { supabase } from './supabaseClient';

export interface AppStats {
  userCount: number;
  totalMoneyManaged: string;
  uptime: string;
}

export const fetchUserCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching user count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
};

export const formatUserCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M+`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K+`;
  } else if (count === 0) {
    return "0";
  } else {
    return `${count}+`;
  }
};

export const fetchAppStats = async (): Promise<AppStats> => {
  const userCount = await fetchUserCount();
  
  return {
    userCount,
    totalMoneyManaged: "₹50M+", // You can make this dynamic too later
    uptime: "99.9%" // You can make this dynamic too later
  };
}; 