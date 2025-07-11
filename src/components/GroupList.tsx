import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  ArrowRight,
  Settings,
  Plus,
  BarChart3,
  Activity,
  Wallet,
  TrendingUp,
  Clock,
  X,
  Sparkles,
  Shield
} from 'lucide-react';
import { ExpenseGroup } from '../types/database';
import { getGroupDetails, calculateDetailedGroupBalances, EnhancedGroupBalances } from '../lib/splitExpenseService';
import AddExpenseForm from './AddExpenseForm';
import AdvancedBalanceView from './AdvancedBalanceView';

interface GroupListProps {
  groups: ExpenseGroup[];
  onGroupUpdate: () => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onGroupUpdate }) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [enhancedBalances, setEnhancedBalances] = useState<EnhancedGroupBalances | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Add Expense Form state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState<{ id: string; name: string } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = async (groupId: string, groupName: string) => {
    try {
      setIsLoadingDetails(true);
      setShowGroupDetails(true);
      
      // Load both basic details and enhanced balances in parallel
      const [groupDetails, enhancedBalanceData] = await Promise.all([
        getGroupDetails(groupId),
        calculateDetailedGroupBalances(groupId)
      ]);
      
      if (groupDetails) {
        setSelectedGroup(groupDetails);
        setEnhancedBalances(enhancedBalanceData);
      } else {
        // If group details fail to load, show basic info
        setSelectedGroup({ 
          group: { id: groupId, name: groupName },
          members: [],
          recent_expenses: [],
          user_balances: [],
          total_group_expenses: 0,
          pending_settlements: 0
        });
        setEnhancedBalances(enhancedBalanceData);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
      // Show basic group info even if details fail
      setSelectedGroup({ 
        group: { id: groupId, name: groupName },
        members: [],
        recent_expenses: [],
        user_balances: [],
        total_group_expenses: 0,
        pending_settlements: 0
      });
      setEnhancedBalances({
        user_balances: [],
        detailed_balances: [],
        settlement_suggestions: [],
        total_group_expenses: 0,
        pending_amount: 0
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAddExpense = (groupId: string, groupName: string) => {
    setSelectedGroupForExpense({ id: groupId, name: groupName });
    setShowAddExpense(true);
  };

  const closeGroupDetails = () => {
    setShowGroupDetails(false);
    setSelectedGroup(null);
    setEnhancedBalances(null);
  };

  const closeAddExpense = () => {
    setShowAddExpense(false);
    setSelectedGroupForExpense(null);
  };

  const handleExpenseAdded = async () => {
    // Refresh the groups data when an expense is added
    onGroupUpdate();
    
    // Also refresh the enhanced balances if group details are open
    if (selectedGroup?.group?.id) {
      try {
        const enhancedBalanceData = await calculateDetailedGroupBalances(selectedGroup.group.id);
        setEnhancedBalances(enhancedBalanceData);
      } catch (error) {
        console.error('Error refreshing balances:', error);
      }
    }
  };

  const handleRefreshBalances = async () => {
    if (selectedGroup?.group?.id) {
      try {
        setIsLoadingDetails(true);
        const enhancedBalanceData = await calculateDetailedGroupBalances(selectedGroup.group.id);
        setEnhancedBalances(enhancedBalanceData);
      } catch (error) {
        console.error('Error refreshing balances:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <Card 
            key={group.id} 
            className="group relative overflow-hidden bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Status indicator */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${group.is_active ? 'bg-green-400' : 'bg-gray-600'}`}></div>
            
            {/* Active badge for first group */}
            {index === 0 && group.is_active && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs px-2 py-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                  Active
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700/50 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                      {group.name}
                    </CardTitle>
                  </div>
                  {group.description && (
                    <CardDescription className="text-gray-400 text-sm leading-relaxed">
                      {group.description}
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-400 hover:text-white hover:bg-gray-700/50"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
              {/* Group Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-3 w-3 text-blue-400" />
                    </div>
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-1">
                    {group.member_count || 0}
                  </p>
                  <p className="text-xs text-gray-400">Members</p>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Wallet className="h-3 w-3 text-green-400" />
                    </div>
                    <BarChart3 className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-1">
                    ₹{(group.total_expenses || 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>

              {/* Group Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">Created</span>
                  </div>
                  <span className="text-xs text-gray-300 font-medium">{formatDate(group.created_at)}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">Status</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={group.is_active ? 
                      "bg-green-400/20 text-green-400 border-green-400/30 text-xs" : 
                      "bg-gray-600/20 text-gray-400 border-gray-600/30 text-xs"
                    }
                  >
                    {group.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-xl font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(group.id, group.name);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                    <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500 transition-all duration-200 rounded-xl font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddExpense(group.id, group.name);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Expense
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Group Details Modal */}
      <Dialog open={showGroupDetails} onOpenChange={closeGroupDetails} modal={true}>
        <DialogContent 
          className="fullscreen-dialog !max-w-none !max-h-none overflow-y-auto border-0 p-0 bg-gray-900 !w-[98vw] !h-[96vh]"
          style={{ 
            width: '98vw !important', 
            height: '96vh !important', 
            maxWidth: 'none !important',
            maxHeight: 'none !important',
            margin: '2vh auto !important'
          }}
        >
          <div className="relative">
            {/* Header with Dark Theme */}
            <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-6 pb-8 text-white border-b border-gray-700/50">
              <div className="relative z-10">
                <DialogHeader className="text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                        <BarChart3 className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-3xl font-bold text-white">
                          {selectedGroup?.group?.name || 'Group Details'}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-sm">
                            <Shield className="h-3 w-3 mr-1" />
                            SmartSplit Analytics
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-sm">
                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                            Live Data
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeGroupDetails}
                      className="text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <DialogDescription className="text-gray-400 text-lg leading-relaxed max-w-4xl">
                    Comprehensive expense analysis and intelligent settlement optimization for your financial group.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 bg-gray-900">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-600 border-t-blue-400"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-gray-600 opacity-20 animate-pulse"></div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Processing Data</h3>
                  <p className="text-gray-500">Analyzing expenses and optimizing settlements...</p>
                </div>
              </div>
            ) : selectedGroup && enhancedBalances ? (
              <div className="px-8 pb-8 bg-gray-900">
                <Tabs defaultValue="balances" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
                    <TabsTrigger 
                      value="balances" 
                      className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 transition-all duration-200"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Balances
                    </TabsTrigger>
                    <TabsTrigger 
                      value="members" 
                      className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 transition-all duration-200"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Members
                    </TabsTrigger>
                    <TabsTrigger 
                      value="expenses" 
                      className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 transition-all duration-200"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Transactions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="balances" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <BarChart3 className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            Balance Analytics
                          </h3>
                          <p className="text-gray-400 text-sm">Real-time settlement optimization</p>
                        </div>
                      </div>
                      <Button 
                        className="bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-xl"
                        size="sm" 
                        onClick={handleRefreshBalances}
                        disabled={isLoadingDetails}
                      >
                        {isLoadingDetails ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        ) : (
                          <Activity className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>
                    <AdvancedBalanceView 
                      balances={enhancedBalances}
                      groupName={selectedGroup.group.name}
                      onRefresh={handleRefreshBalances}
                    />
                  </TabsContent>

                  <TabsContent value="members" className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <Users className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            Active Members ({selectedGroup.members?.length || 0})
                          </h3>
                          <p className="text-gray-400 text-sm">Group collaboration overview</p>
                        </div>
                      </div>
                      {selectedGroup.members?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {selectedGroup.members.map((member: any) => (
                            <Card key={member.id} className="bg-gray-800/50 border-gray-700/50">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-700/50 rounded-xl flex items-center justify-center">
                                      <span className="text-gray-300 font-semibold">
                                        {(member.user_name || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-white truncate">{member.user_name || 'Unknown User'}</div>
                                      <div className="text-sm text-gray-400 truncate">{member.user_email}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                      Joined {formatDate(member.joined_at)}
                                    </Badge>
                                    <div className="text-xs text-gray-500">
                                      {member.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400">No members found</p>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-gray-700/50" />

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-white">Group Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gray-800/50 border-gray-700/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-white">
                              {selectedGroup.members?.length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Total Members</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gray-800/50 border-gray-700/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              ₹{(selectedGroup.total_group_expenses || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-400">Total Expenses</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gray-800/50 border-gray-700/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">
                              {selectedGroup.recent_expenses?.length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Transactions</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="expenses" className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <Wallet className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            Transaction History
                          </h3>
                          <p className="text-gray-400 text-sm">Complete expense timeline</p>
                        </div>
                      </div>
                      {selectedGroup.recent_expenses?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGroup.recent_expenses.slice(0, 10).map((expense: any) => (
                            <Card key={expense.id} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center">
                                      <IndianRupee className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">{expense.description}</div>
                                      <div className="text-sm text-gray-400">
                                        Paid by <span className="text-gray-300">{expense.paid_by_name}</span> • {formatDate(expense.expense_date)}
                                      </div>
                                      <Badge variant="secondary" className="mt-1 text-xs bg-gray-700/50 text-gray-300">
                                        {expense.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xl font-semibold text-white">₹{expense.total_amount}</div>
                                    <div className="text-sm">
                                      {expense.is_settled ? 
                                        <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs">Settled</Badge> :
                                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-xs">Pending</Badge>
                                      }
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <IndianRupee className="h-8 w-8 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Expenses Yet</h3>
                          <p className="text-gray-500 text-center max-w-md mx-auto mb-6">
                            Start adding expenses to this group to see them here.
                          </p>
                          <Button 
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            onClick={() => {
                              closeGroupDetails();
                              handleAddExpense(selectedGroup.group.id, selectedGroup.group.name);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Expense
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Modal */}
      {selectedGroupForExpense && (
        <AddExpenseForm
          groupId={selectedGroupForExpense.id}
          groupName={selectedGroupForExpense.name}
          open={showAddExpense}
          onClose={closeAddExpense}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </>
  );
};

export default GroupList; 