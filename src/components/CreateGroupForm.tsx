import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  X, 
  Users, 
  Search, 
  Plus, 
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Activity,
  CheckCircle
} from 'lucide-react';
import { createGroup, searchUsers, addGroupMember } from '../lib/splitExpenseService';
import { UserSearchResult } from '../lib/splitExpenseService';

interface CreateGroupFormProps {
  onClose: () => void;
  onGroupCreated: () => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onClose, onGroupCreated }) => {
  const [step, setStep] = useState<'details' | 'members'>('details');
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchTerm);
          // Filter out already selected members
          const filteredResults = results.filter(
            result => !selectedMembers.some(member => member.id === result.id)
          );
          setSearchResults(filteredResults);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedMembers]);

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.length < 3) {
      newErrors.groupName = 'Group name must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep('members');
    }
  };

  const handleAddMember = (user: UserSearchResult) => {
    setSelectedMembers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(result => result.id !== user.id));
    setSearchTerm('');
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== userId));
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    try {
      const newGroup = await createGroup({
        name: groupName.trim(),
        description: description.trim() || undefined
      });

      if (newGroup) {
        // Add selected members to the group
        for (const member of selectedMembers) {
          await addGroupMember(newGroup.id, member.id);
        }
        
        onGroupCreated();
      } else {
        setErrors({ submit: 'Failed to create group. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setErrors({ submit: 'Failed to create group. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto border-0 p-0 bg-white shadow-2xl">
        <div className="relative">
          {/* Header with Light Purple Theme */}
          <div className="relative bg-gradient-to-r from-purple-100 to-blue-100 p-6 pb-8 border-b border-purple-200">
            <div className="relative z-10">
              <DialogHeader className="text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200">
                      <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-purple-800">
                        Create New Group
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-purple-200 text-purple-700 border-purple-300 text-sm">
                          <Shield className="h-3 w-3 mr-1" />
                          Step {step === 'details' ? '1' : '2'} of 2
                        </Badge>
                        <Badge className="bg-green-200 text-green-700 border-green-300 text-sm">
                          <Activity className="h-3 w-3 mr-1" />
                          SmartSplit
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-purple-600 hover:text-purple-800 hover:bg-white/50 backdrop-blur-sm rounded-xl"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <DialogDescription className="text-purple-700 leading-relaxed max-w-xl">
                  {step === 'details' 
                    ? 'Set up your expense group with intelligent splitting and real-time balance tracking'
                    : 'Add members to your group by searching for existing users or create the group to invite them later'
                  }
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="p-8 bg-white">
            {step === 'details' ? (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="groupName" className="text-lg font-medium text-purple-800">
                      Group Name *
                    </Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Weekend Trip, Office Lunch, Roommates..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className={`h-12 text-lg rounded-xl border-2 bg-white text-purple-800 placeholder:text-purple-400 ${
                        errors.groupName 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-purple-300 focus:border-purple-500'
                      } transition-all duration-300`}
                    />
                    {errors.groupName && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                        <X className="h-4 w-4" />
                        <p className="text-sm">{errors.groupName}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-lg font-medium text-purple-800">
                      Description (Optional)
                    </Label>
                    <Input
                      id="description"
                      placeholder="Brief description of this group's purpose..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-12 text-lg rounded-xl border-2 border-purple-300 bg-white text-purple-800 placeholder:text-purple-400 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="h-12 px-8 rounded-xl border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-400 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      Next: Add Members
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Search Section */}
                <div className="space-y-4">
                  <Label htmlFor="memberSearch" className="text-lg font-medium text-purple-800">
                    Search & Add Members
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Search className="h-5 w-5 text-purple-500" />
                    </div>
                    <Input
                      id="memberSearch"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 pl-12 pr-12 text-lg rounded-xl border-2 border-purple-300 bg-white text-purple-800 placeholder:text-purple-400 focus:border-purple-500 transition-all duration-300"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Card className="bg-purple-50 border-purple-200 shadow-lg">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Search Results ({searchResults.length})
                      </h3>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {searchResults.map(user => (
                          <div 
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-semibold">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-purple-800">{user.full_name}</p>
                                <p className="text-sm text-purple-600">{user.email}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddMember(user)}
                              className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 rounded-lg"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Selected Members */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-purple-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Selected Members ({selectedMembers.length})
                  </Label>
                  {selectedMembers.length > 0 ? (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex flex-wrap gap-3">
                        {selectedMembers.map(member => (
                          <Badge 
                            key={member.id} 
                            className="flex items-center gap-2 py-2 px-3 bg-white text-purple-700 border-purple-300 rounded-xl"
                          >
                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-semibold text-xs">
                              {member.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{member.full_name}</span>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="ml-1 p-0.5 hover:bg-red-100 hover:text-red-600 rounded transition-all duration-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl p-8 text-center">
                      <Users className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-purple-600 font-medium">
                        No members selected yet. You can add members now or invite them later.
                      </p>
                    </div>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700">Error</h4>
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('details')}
                    className="h-12 px-8 rounded-xl border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-400 transition-all duration-300"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    disabled={isLoading}
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Create Group
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupForm; 