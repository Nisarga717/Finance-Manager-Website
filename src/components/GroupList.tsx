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
            className="group relative overflow-hidden bg-white/80 border-purple-200 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            {/* Status indicator */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${group.is_active ? 'bg-green-500' : 'bg-purple-400'}`}></div>
            
            {/* Active badge for first group */}
            {index === 0 && group.is_active && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                  Active
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-purple-800 group-hover:text-purple-900 transition-colors duration-200">
                      {group.name}
                    </CardTitle>
                  </div>
                  {group.description && (
                    <CardDescription className="text-purple-600 text-sm leading-relaxed">
                      {group.description}
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
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
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 bg-purple-200 rounded-lg flex items-center justify-center">
                      <Users className="h-3 w-3 text-purple-600" />
                    </div>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                  <p className="text-lg font-semibold text-purple-800 mb-1">
                    {group.member_count || 0}
                  </p>
                  <p className="text-xs text-purple-600">Members</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 bg-green-200 rounded-lg flex items-center justify-center">
                      <Wallet className="h-3 w-3 text-green-600" />
                    </div>
                    <BarChart3 className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-lg font-semibold text-purple-800 mb-1">
                    ₹{(group.total_expenses || 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-purple-600">Total</p>
                </div>
              </div>

              {/* Group Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-600">Created</span>
                  </div>
                  <span className="text-xs text-purple-700 font-medium">{formatDate(group.created_at)}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-600">Status</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={group.is_active ? 
                      "bg-green-100 text-green-700 border-green-300 text-xs" : 
                      "bg-purple-100 text-purple-700 border-purple-300 text-xs"
                    }
                  >
                    {group.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 rounded-xl font-medium"
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
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-400 transition-all duration-200 rounded-xl font-medium"
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
          className="fullscreen-dialog !max-w-none !max-h-none overflow-y-auto border-0 p-0 bg-white !w-[98vw] !h-[96vh] shadow-2xl"
          style={{ 
            width: '98vw !important', 
            height: '96vh !important', 
            maxWidth: 'none !important',
            maxHeight: 'none !important',
            margin: '2vh auto !important'
          }}
        >
          <div className="relative">
            {/* Header with Light Purple Theme */}
            <div className="relative bg-gradient-to-r from-purple-100 to-blue-100 p-6 pb-8 border-b border-purple-200">
              <div className="relative z-10">
                <DialogHeader className="text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-3xl font-bold text-purple-800">
                          {selectedGroup?.group?.name || 'Group Details'}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-purple-200 text-purple-700 border-purple-300 text-sm">
                            <Shield className="h-3 w-3 mr-1" />
                            SmartSplit Analytics
                          </Badge>
                          <Badge className="bg-green-200 text-green-700 border-green-300 text-sm">
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
                      className="text-purple-600 hover:text-purple-800 hover:bg-white/50 backdrop-blur-sm rounded-xl"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <DialogDescription className="text-purple-700 text-lg leading-relaxed max-w-4xl">
                    Comprehensive expense analysis and intelligent settlement optimization for your financial group.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 bg-white">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-2 border-purple-200 border-t-purple-600"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-600 opacity-20 animate-pulse"></div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">Processing Data</h3>
                  <p className="text-purple-600">Analyzing expenses and optimizing settlements...</p>
                </div>
              </div>
            ) : selectedGroup && enhancedBalances ? (
              <div className="px-8 pb-8 bg-white">
                <Tabs defaultValue="balances" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-purple-100 p-1 rounded-xl border border-purple-200">
                    <TabsTrigger 
                      value="balances" 
                      className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-purple-800 text-purple-600 transition-all duration-200"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Balances
                    </TabsTrigger>
                    <TabsTrigger 
                      value="members" 
                      className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-purple-800 text-purple-600 transition-all duration-200"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Members
                    </TabsTrigger>
                    <TabsTrigger 
                      value="expenses" 
                      className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-purple-800 text-purple-600 transition-all duration-200"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Transactions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="balances" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                          <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-purple-800">
                            Balance Analytics
                          </h3>
                          <p className="text-purple-600 text-sm">Real-time settlement optimization</p>
                        </div>
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 rounded-xl"
                        size="sm" 
                        onClick={handleRefreshBalances}
                        disabled={isLoadingDetails}
                      >
                        {isLoadingDetails ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                        <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-purple-800">
                            Active Members ({selectedGroup.members?.length || 0})
                          </h3>
                          <p className="text-purple-600 text-sm">Group collaboration overview</p>
                        </div>
                      </div>
                      {selectedGroup.members?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {selectedGroup.members.map((member: any) => (
                            <Card key={member.id} className="bg-white border-purple-200 shadow-lg">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                      <span className="text-purple-700 font-semibold">
                                        {(member.user_name || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-purple-800 truncate">{member.user_name || 'Unknown User'}</div>
                                      <div className="text-sm text-purple-600 truncate">{member.user_email}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                                      Joined {formatDate(member.joined_at)}
                                    </Badge>
                                    <div className="text-xs text-purple-600">
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
                          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-purple-600" />
                          </div>
                          <p className="text-purple-600">No members found</p>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-purple-200" />

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-purple-800">Group Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-purple-50 border-purple-200 shadow-lg">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-800">
                              {selectedGroup.members?.length || 0}
                            </div>
                            <div className="text-sm text-purple-600">Total Members</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 border-purple-200 shadow-lg">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              ₹{(selectedGroup.total_group_expenses || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-purple-600">Total Expenses</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 border-purple-200 shadow-lg">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedGroup.recent_expenses?.length || 0}
                            </div>
                            <div className="text-sm text-purple-600">Transactions</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="expenses" className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                          <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-purple-800">
                            Transaction History
                          </h3>
                          <p className="text-purple-600 text-sm">Complete expense timeline</p>
                        </div>
                      </div>
                      {selectedGroup.recent_expenses?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGroup.recent_expenses.slice(0, 10).map((expense: any) => (
                            <Card key={expense.id} className="bg-white border-purple-200 hover:bg-purple-50 transition-colors shadow-lg">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                      <IndianRupee className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-purple-800">{expense.description}</div>
                                      <div className="text-sm text-purple-600">
                                        Paid by <span className="text-purple-700">{expense.paid_by_name}</span> • {formatDate(expense.expense_date)}
                                      </div>
                                      <Badge variant="secondary" className="mt-1 text-xs bg-purple-100 text-purple-700 border-purple-200">
                                        {expense.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xl font-semibold text-purple-800">₹{expense.total_amount}</div>
                                    <div className="text-sm">
                                      {expense.is_settled ? 
                                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Settled</Badge> :
                                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">Pending</Badge>
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
                          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <IndianRupee className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-purple-800 mb-2">No Expenses Yet</h3>
                          <p className="text-purple-600 text-center max-w-md mx-auto mb-6">
                            Start adding expenses to this group to see them here.
                          </p>
                          <Button 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
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