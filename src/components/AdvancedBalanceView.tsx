import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  IndianRupee, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calculator,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Lightbulb,
  BarChart3,
  Sparkles,
  Zap,
  Crown,
  Star,
  Coins,
  Wallet,
  CreditCard,
  PieChart,
  DollarSign,
  Target,
  Activity,
  Shuffle,
  TrendingUp as TrendingUpIcon,
  Award,
  Shield
} from 'lucide-react';
import { EnhancedGroupBalances } from '../lib/splitExpenseService';
import { useAuth } from '../context/authContext';

interface AdvancedBalanceViewProps {
  balances: EnhancedGroupBalances;
  groupName: string;
  onRefresh: () => void;
}

const AdvancedBalanceView: React.FC<AdvancedBalanceViewProps> = ({ 
  balances, 
  groupName, 
  onRefresh 
}) => {
  const { user } = useAuth();
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  const filteredUserBalances = showZeroBalances 
    ? balances.user_balances 
    : balances.user_balances.filter(balance => Math.abs(balance.net_balance) > 0.01);

  const currentUserBalance = balances.user_balances.find(b => b.user_id === user?.id);
  const userOwedAmount = currentUserBalance?.total_owed || 0;
  const userOwesAmount = currentUserBalance?.total_owes || 0;
  const userNetBalance = currentUserBalance?.net_balance || 0;

  return (
    <div className="space-y-8">
      {/* Enhanced Quick Summary for Current User */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Your Financial Overview
              </h2>
              <p className="text-purple-100 text-sm font-normal">Real-time balance tracking</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="absolute top-3 right-3">
                {userNetBalance >= 0 ? (
                  <TrendingUpIcon className="h-5 w-5 text-green-300" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                )}
              </div>
              <div className={`text-2xl font-semibold mb-2 ${userNetBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {userNetBalance >= 0 ? '+' : ''}₹{Math.abs(userNetBalance).toFixed(2)}
              </div>
              <div className="text-purple-100 text-sm font-normal mb-3">Net Balance</div>
              <Badge className={`${userNetBalance >= 0 ? 
                'bg-green-400/20 text-green-200 border-green-300/30' : 
                'bg-red-400/20 text-red-200 border-red-300/30'
              } backdrop-blur-sm`}>
                <div className="flex items-center gap-1">
                  {userNetBalance >= 0 ? (
                    <Star className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {userNetBalance >= 0 ? 'You are owed' : 'You owe'}
                </div>
              </Badge>
            </div>
            
            <div className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="absolute top-3 right-3">
                <Coins className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="text-2xl font-semibold text-emerald-300 mb-2">₹{userOwedAmount.toFixed(2)}</div>
              <div className="text-purple-100 text-sm font-normal mb-3">Others owe you</div>
              <Badge className="bg-emerald-400/20 text-emerald-200 border-emerald-300/30 backdrop-blur-sm">
                <Wallet className="h-3 w-3 mr-1" />
                Receivable
              </Badge>
            </div>
            
            <div className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="absolute top-3 right-3">
                <CreditCard className="h-5 w-5 text-orange-300" />
              </div>
              <div className="text-2xl font-semibold text-orange-300 mb-2">₹{userOwesAmount.toFixed(2)}</div>
              <div className="text-purple-100 text-sm font-normal mb-3">You owe others</div>
              <Badge className="bg-orange-400/20 text-orange-200 border-orange-300/30 backdrop-blur-sm">
                <Target className="h-3 w-3 mr-1" />
                Payable
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-xl border-0 p-1 rounded-2xl">
          <TabsTrigger 
            value="balances" 
            className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            User Balances
          </TabsTrigger>
          <TabsTrigger 
            value="settlements" 
            className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Settlement Plan
          </TabsTrigger>
          <TabsTrigger 
            value="overview" 
            className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <PieChart className="h-4 w-4 mr-2" />
            Group Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Individual Balances
            </h3>
            <p className="text-gray-600 font-normal">Smart balance distribution</p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              size="sm"
              onClick={() => setShowZeroBalances(!showZeroBalances)}
            >
              {showZeroBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showZeroBalances ? 'Hide Zero Balances' : 'Show All Users'}
            </Button>
          </div>

          <div className="grid gap-6">
            {filteredUserBalances.map((balance, index) => (
              <Card 
                key={balance.user_id} 
                className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-0"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 8px 60px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Gradient top border */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  balance.net_balance > 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
                  balance.net_balance < 0 ? 'bg-gradient-to-r from-red-400 to-rose-500' : 
                  'bg-gradient-to-r from-gray-400 to-slate-500'
                }`}></div>
                
                {/* Premium badge for current user */}
                {balance.user_id === user?.id && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 px-3 py-1 shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      You
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        balance.net_balance > 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 
                        balance.net_balance < 0 ? 'bg-gradient-to-br from-red-400 to-rose-500' : 
                        'bg-gradient-to-br from-gray-400 to-slate-500'
                      }`}>
                        <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                        <span className="relative z-10">
                          {balance.user_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-3">
                          {balance.user_name}
                          {balance.user_id === user?.id && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                              <Shield className="h-3 w-3 mr-1" />
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-600 font-normal">{balance.user_email}</div>
                        
                        {(balance.total_owed > 0 || balance.total_owes > 0) && (
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUpIcon className="h-3 w-3" />
                              <span>Owed: ₹{balance.total_owed.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="h-3 w-3" />
                              <span>Owes: ₹{balance.total_owes.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xl font-semibold mb-2 ${
                        balance.net_balance > 0 ? 'text-green-600' : 
                        balance.net_balance < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {balance.net_balance > 0 ? '+' : ''}₹{Math.abs(balance.net_balance).toFixed(2)}
                      </div>
                      <Badge 
                        className={`${
                          balance.net_balance > 0 ? 'bg-green-100 text-green-800 border-green-200' : 
                          balance.net_balance < 0 ? 'bg-red-100 text-red-800 border-red-200' : 
                          'bg-gray-100 text-gray-800 border-gray-200'
                        } font-semibold px-3 py-1`}
                      >
                        {balance.net_balance > 0 ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Gets back
                          </div>
                        ) : balance.net_balance < 0 ? (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Needs to pay
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Settled up
                          </div>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUserBalances.length === 0 && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">All Settled!</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Everyone in the group is settled up. No pending balances!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settlements" className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                AI-Optimized Settlement Plan
              </h3>
              <p className="text-gray-600 font-normal">Minimize transactions with smart routing</p>
            </div>
          </div>
          
          {balances.settlement_suggestions.length > 0 ? (
            <>
              <div className="relative overflow-hidden bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
                <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-200/30 rounded-full blur-lg"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Smart Settlement Algorithm
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Our AI has optimized your settlements! To clear all group debts, only <strong className="text-orange-600">{balances.settlement_suggestions.length} transaction{balances.settlement_suggestions.length > 1 ? 's' : ''}</strong> {balances.settlement_suggestions.length > 1 ? 'are' : 'is'} needed instead of the traditional {balances.user_balances.filter(b => b.net_balance !== 0).length} transactions.
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Activity className="h-3 w-3 mr-1" />
                      {Math.round((1 - balances.settlement_suggestions.length / Math.max(balances.user_balances.filter(b => b.net_balance !== 0).length, 1)) * 100)}% fewer transactions
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Optimized
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {balances.settlement_suggestions.map((settlement, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-semibold text-sm">
                                {settlement.from_user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{settlement.from_user_name}</span>
                            {settlement.from_user_id === user?.id && (
                              <Badge variant="secondary">You</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">pays</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-sm">
                                {settlement.to_user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{settlement.to_user_name}</span>
                            {settlement.to_user_id === user?.id && (
                              <Badge variant="secondary">You</Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-600">
                            ₹{settlement.amount.toFixed(2)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Transaction {index + 1}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Settlements Needed!</h3>
                <p className="text-gray-500 text-center max-w-md">
                  All balances are settled. No transactions required.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-purple-600">
                  ₹{balances.total_group_expenses.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 font-normal">Total Expenses</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-orange-600">
                  ₹{balances.pending_amount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 font-normal">Pending Payments</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {balances.user_balances.length}
                </div>
                <div className="text-sm text-gray-600 font-normal">Total Members</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-green-600">
                  {balances.settlement_suggestions.length}
                </div>
                <div className="text-sm text-gray-600 font-normal">Settlements Needed</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Financial Health
              </CardTitle>
              <CardDescription>
                Overview of financial activity in {groupName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Users with positive balance</span>
                </div>
                <span className="font-semibold">
                  {balances.user_balances.filter(b => b.net_balance > 0).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Users with negative balance</span>
                </div>
                <span className="font-semibold">
                  {balances.user_balances.filter(b => b.net_balance < 0).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Users settled up</span>
                </div>
                <span className="font-semibold">
                  {balances.user_balances.filter(b => Math.abs(b.net_balance) < 0.01).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedBalanceView; 