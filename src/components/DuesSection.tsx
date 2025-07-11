import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  IndianRupee, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { UserBalance } from '../types/database';

interface DuesSectionProps {
  dues: UserBalance[];
  onPaymentUpdate: () => void;
}

const DuesSection: React.FC<DuesSectionProps> = ({ dues, onPaymentUpdate }) => {
  const [loadingPayments, setLoadingPayments] = useState<Set<string>>(new Set());

  const handleMarkAsPaid = async (dueId: string) => {
    setLoadingPayments(prev => {
      const newSet = new Set(prev);
      newSet.add(dueId);
      return newSet;
    });
    try {
      // This would typically call the payment marking service
      // For now, we'll just simulate the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      onPaymentUpdate();
    } catch (error) {
      console.error('Error marking payment:', error);
    } finally {
      setLoadingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(dueId);
        return newSet;
      });
    }
  };

  const owedToYou = dues.filter(due => due.net_balance > 0);
  const youOwe = dues.filter(due => due.total_owes > 0);

  if (dues.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">All Settled!</h3>
          <p className="text-gray-500 text-center max-w-md">
            You don't have any pending dues. All your expenses are settled up.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* You Owe Section */}
      {youOwe.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ArrowUpRight className="h-5 w-5" />
              You Owe ({youOwe.length})
            </CardTitle>
            <CardDescription>
              Amounts you need to pay to settle your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {youOwe.map((due) => (
                <div 
                  key={due.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{due.user_name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {due.user_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-600">
                        ₹{due.total_owes.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Amount Due</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleMarkAsPaid(due.user_id)}
                      disabled={loadingPayments.has(due.user_id)}
                    >
                      {loadingPayments.has(due.user_id) ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Paid
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-700">Total You Owe:</span>
                <span className="text-xl font-bold text-red-700">
                  ₹{youOwe.reduce((sum, due) => sum + due.total_owes, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owed to You Section */}
      {owedToYou.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ArrowDownRight className="h-5 w-5" />
              Owed to You ({owedToYou.length})
            </CardTitle>
            <CardDescription>
              Amounts that others owe you for shared expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {owedToYou.map((due) => (
                <div 
                  key={due.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{due.user_name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {due.user_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        ₹{due.net_balance.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Amount Owed</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-700">Total Owed to You:</span>
                <span className="text-xl font-bold text-green-700">
                  ₹{owedToYou.reduce((sum, due) => sum + due.net_balance, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Net Balance</p>
              <p className={`text-3xl font-bold ${
                owedToYou.reduce((sum, due) => sum + due.net_balance, 0) - 
                youOwe.reduce((sum, due) => sum + due.total_owes, 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                ₹{(
                  owedToYou.reduce((sum, due) => sum + due.net_balance, 0) - 
                  youOwe.reduce((sum, due) => sum + due.total_owes, 0)
                ).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {owedToYou.reduce((sum, due) => sum + due.net_balance, 0) - 
                 youOwe.reduce((sum, due) => sum + due.total_owes, 0) >= 0 
                  ? 'You are owed more' 
                  : 'You owe more'
                }
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-purple-600">
                {dues.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Pending settlements
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <Badge 
                variant={dues.length === 0 ? "default" : "secondary"}
                className={dues.length === 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                {dues.length === 0 ? 'All Settled' : 'Pending Dues'}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                Current state
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuesSection; 