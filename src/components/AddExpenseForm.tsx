import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  Calculator, 
  Check, 
  X, 
  IndianRupee, 
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Divide,
  Sparkles,
  Zap,
  Crown,
  Star,
  Coins,
  Wallet,
  CreditCard,
  TrendingUp,
  Activity,
  Shield,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { getGroupDetails, createExpense, markSplitAsPaid, markSplitAsUnpaid } from '../lib/splitExpenseService';

interface GroupMember {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  is_active: boolean;
}

interface ExpenseSplit {
  user_id: string;
  user_name?: string;
  amount: number;
  is_paid: boolean;
  split_id?: string;
}

interface AddExpenseFormProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ 
  groupId, 
  groupName, 
  open, 
  onClose, 
  onExpenseAdded 
}) => {
  const { user } = useAuth();
  
  // Form state
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  
  // Members and splits
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('details');
  const [expenseCreated, setExpenseCreated] = useState(false);
  const [createdExpenseId, setCreatedExpenseId] = useState<string | null>(null);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Travel',
    'Healthcare',
    'Education',
    'Other'
  ];

  // Load group members
  useEffect(() => {
    if (open && groupId) {
      loadGroupMembers();
    }
  }, [open, groupId]);

  // Auto-select current user and calculate splits when members or amount changes
  useEffect(() => {
    if (members.length > 0 && user?.id) {
      // Auto-select current user
      if (!selectedMembers.has(user.id)) {
        setSelectedMembers(prev => {
          const newSet = new Set(prev);
          newSet.add(user.id);
          return newSet;
        });
      }
      
      calculateSplits();
    }
  }, [members, totalAmount, selectedMembers, splitType, user?.id]);

  const loadGroupMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const groupDetails = await getGroupDetails(groupId);
      if (groupDetails && groupDetails.members) {
        setMembers(groupDetails.members);
      }
    } catch (error) {
      console.error('Error loading group members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const calculateSplits = () => {
    const amount = parseFloat(totalAmount) || 0;
    const selectedMembersList = members.filter(m => selectedMembers.has(m.user_id));
    
    if (amount <= 0 || selectedMembersList.length === 0) {
      setSplits([]);
      return;
    }

    const newSplits: ExpenseSplit[] = selectedMembersList.map(member => {
      let splitAmount = 0;
      
      if (splitType === 'equal') {
        splitAmount = amount / selectedMembersList.length;
      } else {
        // For custom splits, keep existing amounts or set to 0
        const existingSplit = splits.find(s => s.user_id === member.user_id);
        splitAmount = existingSplit?.amount || 0;
      }

      return {
        user_id: member.user_id,
        user_name: member.user_name || 'Unknown User',
        amount: splitAmount,
        is_paid: member.user_id === user?.id, // Auto-mark expense creator as paid
      };
    });

    setSplits(newSplits);
  };

  const handleMemberToggle = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleCustomAmountChange = (userId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setSplits(prev => prev.map(split => 
      split.user_id === userId 
        ? { ...split, amount: numAmount }
        : split
    ));
  };

  const handlePaymentToggle = async (userId: string, splitId?: string) => {
    if (!expenseCreated || !splitId) {
      // If expense isn't created yet, just toggle the UI state
      setSplits(prev => prev.map(split => 
        split.user_id === userId 
          ? { ...split, is_paid: !split.is_paid }
          : split
      ));
      return;
    }

    // If expense is created, update the database
    try {
      const currentSplit = splits.find(s => s.user_id === userId);
      if (currentSplit?.is_paid) {
        await markSplitAsUnpaid(splitId);
      } else {
        await markSplitAsPaid(splitId, createdExpenseId!);
      }
      
      // Update local state
      setSplits(prev => prev.map(split => 
        split.user_id === userId 
          ? { ...split, is_paid: !split.is_paid }
          : split
      ));
      
      // Refresh parent component
      onExpenseAdded();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      newErrors.totalAmount = 'Amount must be greater than 0';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (selectedMembers.size === 0) {
      newErrors.members = 'Select at least one member';
    }

    if (splitType === 'custom') {
      const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
      const amount = parseFloat(totalAmount) || 0;
      if (Math.abs(totalSplits - amount) > 0.01) {
        newErrors.splits = `Split amounts (₹${totalSplits.toFixed(2)}) don't match total amount (₹${amount.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateExpense = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const expenseData = {
        group_id: groupId,
        description: description.trim(),
        total_amount: parseFloat(totalAmount),
        category,
        expense_date: expenseDate,
        notes: notes.trim(),
        split_type: splitType,
        splits: splits.map(split => ({
          user_id: split.user_id,
          amount: split.amount
        }))
      };

      const result = await createExpense(expenseData);
      
      if (result.success && result.expenseId && result.splits) {
        setExpenseCreated(true);
        setCreatedExpenseId(result.expenseId);
        
        // Update splits with the actual split IDs from database
        const updatedSplits = splits.map(split => {
          const dbSplit = result.splits?.find(s => s.user_id === split.user_id);
          return {
            ...split,
            split_id: dbSplit?.id,
            is_paid: dbSplit?.is_paid || false
          };
        });
        setSplits(updatedSplits);
        
        setActiveTab('payment');
        onExpenseAdded();
      } else {
        setErrors({ general: 'Failed to create expense. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      setErrors({ general: 'Failed to create expense. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setDescription('');
    setTotalAmount('');
    setCategory('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSplitType('equal');
    setSelectedMembers(new Set());
    setSplits([]);
    setErrors({});
    setActiveTab('details');
    setExpenseCreated(false);
    setCreatedExpenseId(null);
    onClose();
  };

  const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
  const paidAmount = splits.filter(s => s.is_paid).reduce((sum, s) => sum + s.amount, 0);
  const unpaidAmount = totalSplitAmount - paidAmount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 p-0 bg-gray-900">
        <div className="relative">
          {/* Dark Professional Header */}
          <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-6 pb-8 text-white border-b border-gray-700/50">
            <div className="relative z-10">
              <DialogHeader className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                    <Sparkles className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      Add Expense
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-sm">
                        <Shield className="h-3 w-3 mr-1" />
                        {groupName}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-sm">
                        <Activity className="h-3 w-3 mr-1" />
                        SmartSplit
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogDescription className="text-gray-400 leading-relaxed max-w-2xl">
                  Create and manage shared expenses with intelligent splitting and real-time balance tracking.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {errors.general && (
            <div className="mx-6 mt-4 bg-red-400/10 border border-red-400/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-red-400">Error</h4>
                <span className="text-red-300 text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <div className="px-8 pb-8 bg-gray-900">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50 mt-6">
                <TabsTrigger 
                  value="details" 
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="split" 
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 transition-all duration-200"
                >
                  <Divide className="h-4 w-4 mr-2" />
                  Split
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-400 transition-all duration-200"
                  disabled={!expenseCreated}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-300">Description *</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Dinner at restaurant, Movie tickets..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`h-10 rounded-xl border-2 bg-gray-800/50 text-white placeholder:text-gray-500 ${
                        errors.description 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-gray-700 focus:border-blue-400'
                      } transition-all duration-300`}
                    />
                    {errors.description && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                        <AlertCircle className="h-3 w-3" />
                        <p className="text-xs">{errors.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-300">Total Amount *</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-green-500/20 rounded-lg">
                        <IndianRupee className="h-3 w-3 text-green-400" />
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className={`h-10 pl-12 font-medium rounded-xl border-2 bg-gray-800/50 text-white placeholder:text-gray-500 ${
                          errors.totalAmount 
                            ? 'border-red-400/50 focus:border-red-400' 
                            : 'border-gray-700 focus:border-green-400'
                        } transition-all duration-300`}
                        step="0.01"
                      />
                    </div>
                    {errors.totalAmount && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                        <AlertCircle className="h-3 w-3" />
                        <p className="text-xs">{errors.totalAmount}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-300">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className={`h-10 rounded-xl border-2 bg-gray-800/50 text-white ${
                        errors.category ? 'border-red-400/50' : 'border-gray-700'
                      } transition-all duration-300`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-gray-800 border-gray-700">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="py-2 rounded-lg text-white hover:bg-gray-700">
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3" />
                              {cat}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                        <AlertCircle className="h-3 w-3" />
                        <p className="text-xs">{errors.category}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-300">Date</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-500/20 rounded-lg">
                        <Calendar className="h-3 w-3 text-blue-400" />
                      </div>
                      <Input
                        id="date"
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="h-10 pl-12 rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white focus:border-blue-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-300">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional details about this expense..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-blue-400 transition-all duration-300 resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="split" className="space-y-6">
                {/* Split Type Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Split Type</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={splitType === 'equal' ? 'default' : 'outline'}
                      onClick={() => setSplitType('equal')}
                      className={`flex items-center gap-2 rounded-xl ${
                        splitType === 'equal' 
                          ? 'bg-white text-gray-900 hover:bg-gray-100' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      }`}
                      size="sm"
                    >
                      <Users className="h-4 w-4" />
                      Equal Split
                    </Button>
                    <Button
                      variant={splitType === 'custom' ? 'default' : 'outline'}
                      onClick={() => setSplitType('custom')}
                      className={`flex items-center gap-2 rounded-xl ${
                        splitType === 'custom' 
                          ? 'bg-white text-gray-900 hover:bg-gray-100' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      }`}
                      size="sm"
                    >
                      <Calculator className="h-4 w-4" />
                      Custom
                    </Button>
                  </div>
                </div>

                {/* Member Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Select Members *</Label>
                  {isLoadingMembers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-blue-400 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {members.map(member => (
                        <Card 
                          key={member.user_id}
                          className={`cursor-pointer transition-all bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 ${
                            selectedMembers.has(member.user_id) 
                              ? 'border-blue-400/50 bg-blue-500/10' 
                              : ''
                          }`}
                          onClick={() => handleMemberToggle(member.user_id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded border ${
                                  selectedMembers.has(member.user_id)
                                    ? 'bg-blue-400 border-blue-400'
                                    : 'border-gray-500'
                                }`}>
                                  {selectedMembers.has(member.user_id) && (
                                    <Check className="h-2 w-2 text-white" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-white text-sm">{member.user_name || 'Unknown User'}</div>
                                  <div className="text-xs text-gray-400">{member.user_email || 'Unknown Email'}</div>
                                </div>
                              </div>
                              {member.user_id === user?.id && (
                                <Badge className="bg-gray-700/50 text-gray-300 text-xs">You</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {errors.members && (
                    <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-lg border border-red-400/20">{errors.members}</p>
                  )}
                </div>

                {/* Split Preview */}
                {splits.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-300">Split Preview</Label>
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-white">Amount Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {splits.map(split => (
                          <div key={split.user_id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-white text-sm">{split.user_name || 'Unknown User'}</div>
                              {split.user_id === user?.id && (
                                <Badge className="bg-gray-600/50 text-gray-300 text-xs">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {splitType === 'custom' ? (
                                <div className="relative">
                                  <IndianRupee className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                                  <Input
                                    type="number"
                                    value={split.amount.toFixed(2)}
                                    onChange={(e) => handleCustomAmountChange(split.user_id, e.target.value)}
                                    className="w-20 h-8 pl-6 text-right text-xs bg-gray-800/50 border-gray-600 text-white"
                                    step="0.01"
                                  />
                                </div>
                              ) : (
                                <span className="font-semibold text-white text-sm">₹{split.amount.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <Separator className="bg-gray-700/50" />
                        
                        <div className="flex justify-between items-center font-semibold text-white">
                          <span>Total:</span>
                          <span>₹{totalSplitAmount.toFixed(2)}</span>
                        </div>
                        
                        {errors.splits && (
                          <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-lg border border-red-400/20">{errors.splits}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateExpense}
                    disabled={isLoading || Object.keys(errors).length > 0}
                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Expense'
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-6">
                {expenseCreated && (
                  <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <h3 className="font-semibold text-green-400">Expense Created Successfully!</h3>
                    </div>
                    <p className="text-green-300 text-sm">
                      You can now track payments from group members below.
                    </p>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-white">₹{totalSplitAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Total Amount</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-green-400">₹{paidAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Paid</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-red-400">₹{unpaidAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Pending</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Tracking */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Payment Status</Label>
                  <div className="space-y-3">
                    {splits.map(split => (
                      <Card key={split.user_id} className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-white text-sm">{split.user_name || 'Unknown User'}</div>
                              {split.user_id === user?.id && (
                                <Badge className="bg-gray-700/50 text-gray-300 text-xs">You</Badge>
                              )}
                              <span className="font-semibold text-white text-sm">₹{split.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                className={split.is_paid 
                                  ? "bg-green-400/20 text-green-400 border-green-400/30 text-xs" 
                                  : "bg-red-400/20 text-red-400 border-red-400/30 text-xs"
                                }
                              >
                                {split.is_paid ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Paid
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentToggle(split.user_id, split.split_id)}
                                className={`text-xs rounded-lg ${
                                  split.is_paid 
                                    ? "border-red-400/50 text-red-400 hover:bg-red-500/10" 
                                    : "border-green-400/50 text-green-400 hover:bg-green-500/10"
                                }`}
                              >
                                {split.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleClose} 
                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseForm; 