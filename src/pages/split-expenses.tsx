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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-600 opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200">
                      <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                        SmartSplit
                      </h1>
                      <p className="text-purple-600 text-sm font-medium">Professional Expense Management</p>
                    </div>
                  </div>
                  <p className="text-xl text-purple-700 max-w-2xl leading-relaxed">
                    Intelligent expense splitting platform designed for modern financial collaboration
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">Minimal Settlements</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Real-time Sync</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-2xl font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 border-purple-200 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-600">Active Groups</p>
                    <p className="text-3xl font-bold text-purple-800">{groups.length}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>All time</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-2xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 border-purple-200 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-600">Outstanding</p>
                    <p className="text-3xl font-bold text-red-600">₹{totalDues.toFixed(0)}</p>
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      <span>You owe</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 border-purple-200 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-600">Receivables</p>
                    <p className="text-3xl font-bold text-green-600">₹{totalOwed.toFixed(0)}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Others owe</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-2xl">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 border-purple-200 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-600">Net Position</p>
                    <p className={`text-3xl font-bold ${totalOwed - totalDues >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(totalOwed - totalDues).toFixed(0)}
                    </p>
                    <div className={`flex items-center gap-1 text-xs ${totalOwed - totalDues >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalOwed - totalDues >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{totalOwed - totalDues >= 0 ? 'Positive' : 'Negative'}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="bg-white/70 border-purple-200 backdrop-blur-sm shadow-lg">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-purple-200 px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3 bg-purple-100 p-1 rounded-xl">
                    <TabsTrigger 
                      value="groups" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 text-purple-600 rounded-lg transition-all duration-200"
                    >
                      <Users className="h-4 w-4" />
                      Groups
                      <Badge className="bg-purple-200 text-purple-700 text-xs">{groups.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="dues" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 text-purple-600 rounded-lg transition-all duration-200"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Balances
                      <Badge className="bg-purple-200 text-purple-700 text-xs">{dues.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 text-purple-600 rounded-lg transition-all duration-200"
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
                        <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <Users className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-purple-800 mb-2">No Groups Yet</h3>
                        <p className="text-purple-600 mb-8 max-w-md mx-auto">
                          Create your first group to start managing expenses with precision and intelligence.
                        </p>
                        <Button 
                          onClick={() => setShowCreateGroup(true)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-3 rounded-xl font-semibold"
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
                      <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <PieChart className="h-10 w-10 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">Advanced Analytics</h3>
                      <p className="text-purple-600 mb-8 max-w-md mx-auto">
                        Comprehensive expense analytics and insights coming soon to enhance your financial decisions.
                      </p>
                      <div className="flex items-center gap-4 justify-center">
                        <div className="flex items-center gap-2 text-purple-600">
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
