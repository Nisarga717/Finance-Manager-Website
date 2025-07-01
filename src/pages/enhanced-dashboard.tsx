import React from 'react';
import { useAuth } from '../context/authContext';

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Enhanced Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome {user?.fullName || user?.email}! This enhanced dashboard is under development.
        </p>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">
            Enhanced features coming soon. For now, please use the main dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard; 