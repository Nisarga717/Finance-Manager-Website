import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Calculator, 
  Activity,
  Wallet,
  PieChart,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { ExpenseGroup, UserBalance } from '../types/database';
import { getUserGroups, getUserDues } from '../lib/splitExpenseService';
import CreateGroupForm from '../components/CreateGroupForm';
import GroupList from '../components/GroupList';
import DuesSection from '../components/DuesSection';

const SplitExpenses: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [dues, setDues] = useState<UserBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [groupsData, duesData] = await Promise.all([
        getUserGroups(),
        getUserDues()
      ]);
      setGroups(groupsData);
      setDues(duesData);
    } catch (error) {
      console.error('Error loading split expenses data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupCreated = () => {
    setShowCreateGroup(false);
    loadData();
  };

  const totalDues = dues.reduce((sum, due) => sum + due.total_owes, 0);
  const totalOwed = dues.reduce((sum, due) => sum + Math.max(0, due.net_balance), 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-600 border-t-white"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                      <Sparkles className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        SmartSplit
                      </h1>
                      <p className="text-gray-400 text-sm font-medium">Professional Expense Management</p>
                    </div>
                  </div>
                  <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                    Intelligent expense splitting platform designed for modern financial collaboration
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">Minimal Settlements</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Real-time Sync</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 rounded-2xl font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Active Groups</p>
                    <p className="text-3xl font-bold text-white">{groups.length}</p>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>All time</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Outstanding</p>
                    <p className="text-3xl font-bold text-red-400">₹{totalDues.toFixed(0)}</p>
                    <div className="flex items-center gap-1 text-xs text-red-400">
                      <TrendingDown className="h-3 w-3" />
                      <span>You owe</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-2xl">
                    <ArrowUpRight className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Receivables</p>
                    <p className="text-3xl font-bold text-green-400">₹{totalOwed.toFixed(0)}</p>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>Others owe</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-2xl">
                    <Wallet className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Net Position</p>
                    <p className={`text-3xl font-bold ${totalOwed - totalDues >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{Math.abs(totalOwed - totalDues).toFixed(0)}
                    </p>
                    <div className={`flex items-center gap-1 text-xs ${totalOwed - totalDues >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totalOwed - totalDues >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{totalOwed - totalDues >= 0 ? 'Positive' : 'Negative'}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Calculator className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="bg-gray-800/30 border-gray-700/30 backdrop-blur-sm">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-700/50 px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-700/30 p-1 rounded-xl">
                    <TabsTrigger 
                      value="groups" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 rounded-lg transition-all duration-200"
                    >
                      <Users className="h-4 w-4" />
                      Groups
                      <Badge className="bg-gray-600 text-gray-300 text-xs">{groups.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="dues" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 rounded-lg transition-all duration-200"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Balances
                      <Badge className="bg-gray-600 text-gray-300 text-xs">{dues.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 rounded-lg transition-all duration-200"
                    >
                      <PieChart className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="groups" className="mt-0 space-y-6">
                    {groups.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <Users className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Groups Yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                          Create your first group to start managing expenses with precision and intelligence.
                        </p>
                        <Button 
                          onClick={() => setShowCreateGroup(true)}
                          className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Group
                        </Button>
                      </div>
                    ) : (
                      <GroupList groups={groups} onGroupUpdate={loadData} />
                    )}
                  </TabsContent>

                  <TabsContent value="dues" className="mt-0 space-y-6">
                    <DuesSection dues={dues} onPaymentUpdate={loadData} />
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0 space-y-6">
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <PieChart className="h-10 w-10 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Advanced Analytics</h3>
                      <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Comprehensive expense analytics and insights coming soon to enhance your financial decisions.
                      </p>
                      <div className="flex items-center gap-4 justify-center">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">In Development</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Create Group Modal */}
          {showCreateGroup && (
            <CreateGroupForm 
              onClose={() => setShowCreateGroup(false)}
              onGroupCreated={handleGroupCreated}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SplitExpenses;
