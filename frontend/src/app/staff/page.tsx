'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Users, Plus, Edit, Trash2, Building, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContextSWR';
import { useUsers, useCreateUser } from '@/hooks/useSWRAuth';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToastAlerts, toast } from '@/components/ToastAlert';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet';
  jobTitle: 'Hourly Associate' | 'AM' | 'Chef' | 'SM/GM/TL' | 'ACO' | 'RDO';
  restaurants?: Restaurant[];
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
}

interface NewUserForm {
  fullName: string;
  email: string;
  password: string;
  role: string;
  jobTitle: string;
  restaurantIds: number[];
}

interface EditUserForm {
  fullName: string;
  email: string;
  role: string;
  jobTitle: string;
  restaurantIds: number[];
}

const roleLabels = {
  'admin': 'Admin',
  'ops_lead': 'Operations Lead',
  'black_shirt': 'Black Shirt',
  'associate': 'Associate'
};

const jobTitleLabels = {
  'Hourly Associate': 'Hourly Associate',
  'AM': 'Assistant Manager',
  'Chef': 'Chef',
  'SM/GM/TL': 'Store Manager/General Manager/Team Lead',
  'ACO': 'Area Coach',
  'RDO': 'Regional Director of Operations'
};

function StaffManagementContent() {
  const { user: currentUser } = useAuth();
  
  // Helper function to get available roles based on current user
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case 'admin':
        return Object.entries(roleLabels);
      case 'ops_lead':
        return Object.entries(roleLabels).filter(([value]) => ['black_shirt', 'associate'].includes(value));
      case 'black_shirt':
        return [['black_shirt', 'Black Shirt'], ['associate', 'Associate']]; // Can create black shirts and associates
      case 'associate':
        return [['associate', 'Associate']]; // Only associate
      default:
        return [];
    }
  };
  
  // Helper function to get available job titles based on role being created
  const getAvailableJobTitles = (role: string) => {
    if (role === 'associate') {
      // Associates typically have these job titles
      return Object.entries(jobTitleLabels).filter(([value]) => 
        ['Hourly Associate', 'AM', 'Chef'].includes(value)
      );
    }
    // For other roles, show all job titles
    return Object.entries(jobTitleLabels);
  };
  // Use SWR for users data
  const { users, loading: usersLoading, error: usersError, mutate: refetchUsers } = useUsers();
  const { createUser, isCreating, createError } = useCreateUser();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  const { addAlert, ToastContainer } = useToastAlerts();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [inactiveRestaurants, setInactiveRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  // moved to kitchen page
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // moved to kitchen page
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({
    fullName: '',
    email: '',
    password: '',
    role: '',
    jobTitle: '',
    restaurantIds: []
  });
  const [editUser, setEditUser] = useState<EditUserForm>({
    fullName: '',
    email: '',
    role: '',
    jobTitle: '',
    restaurantIds: []
  });

  // Pagination state for each table
  const [pagination, setPagination] = useState({
    rdo: 1,
    aco: 1,
    blackShirts: 1,
    hourlyAssociates: 1,
    tablets: 1,
    otherStaff: 1
  });

  const ITEMS_PER_PAGE = 10;

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet'>('all');
  const [filterJobTitle, setFilterJobTitle] = useState<'all' | 'Hourly Associate' | 'AM' | 'Chef' | 'SM/GM/TL' | 'ACO' | 'RDO'>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'jobTitle' | 'email'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique restaurants from all users
  const uniqueRestaurants = useMemo(() => {
    if (!users) return [];
    
    const restaurantMap = new Map();
    users.forEach((user: User) => {
      (user.restaurants || []).forEach(restaurant => {
        restaurantMap.set(restaurant.id, restaurant);
      });
    });
    
    return Array.from(restaurantMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  // Enhanced search, filter, and sort function
  const searchFilterAndSortUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter((user: User) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = user.fullName.toLowerCase().includes(searchLower);
        const emailMatch = user.email.toLowerCase().includes(searchLower);
        const jobTitleMatch = user.jobTitle.toLowerCase().includes(searchLower);
        const restaurantMatch = (user.restaurants || []).some(restaurant => 
          restaurant.name.toLowerCase().includes(searchLower)
        );
        if (!nameMatch && !emailMatch && !jobTitleMatch && !restaurantMatch) return false;
      }

      // Role filter
      if (filterRole !== 'all' && user.role !== filterRole) return false;

      // Job title filter
      if (filterJobTitle !== 'all' && user.jobTitle !== filterJobTitle) return false;

      // Store filter
      if (filterStore !== 'all') {
        const storeId = parseInt(filterStore);
        const hasStore = (user.restaurants || []).some(restaurant => restaurant.id === storeId);
        if (!hasStore) return false;
      }

      return true;
    });

    // Sort users
    filtered.sort((a: User, b: User) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'jobTitle':
          comparison = a.jobTitle.localeCompare(b.jobTitle);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchQuery, filterRole, filterJobTitle, filterStore, sortBy, sortOrder]);

  // Legacy search function for backward compatibility
  const searchUsers = (users: User[], query: string) => {
    if (!query.trim()) return users;
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter((user: User) => 
      user.fullName.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.jobTitle.toLowerCase().includes(lowercaseQuery) ||
      (user.restaurants || []).some(restaurant => 
        restaurant.name.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  // Reset pagination when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Reset all pagination to page 1 when search changes
    setPagination({
      rdo: 1,
      aco: 1,
      blackShirts: 1,
      hourlyAssociates: 1,
      tablets: 1,
      otherStaff: 1
    });
  };

  // Pagination functions
  const updatePagination = (tableType: keyof typeof pagination, page: number) => {
    setPagination(prev => ({ ...prev, [tableType]: page }));
  };

  const getPaginatedUsers = (users: User[], tableType: keyof typeof pagination) => {
    const currentPage = pagination[tableType];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return users.slice(startIndex, endIndex);
  };

  const getTotalPages = (users: User[]) => {
    return Math.ceil(users.length / ITEMS_PER_PAGE);
  };

  // Pagination Component
  const PaginationComponent = ({ 
    currentPage, 
    totalPages, 
    totalItems,
    onPageChange, 
    tableType 
  }: { 
    currentPage: number; 
    totalPages: number; 
    totalItems: number;
    onPageChange: (page: number) => void;
    tableType: keyof typeof pagination;
  }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  // moved to kitchen page

  useEffect(() => {
    fetchRestaurants();
    checkUserRole();
  }, []);

  // Auto-set role for restricted users when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && currentUser) {
      const availableRoles = getAvailableRoles();
      if (availableRoles.length === 1) {
        // If user can only create one type of role, auto-select it
        setNewUser(prev => ({ ...prev, role: availableRoles[0][0] }));
      }
    }
  }, [isCreateDialogOpen, currentUser]);

  // Staff Management is now accessible to all authenticated users
  // Backend policies will handle specific permissions for different actions

  const checkUserRole = async () => {
    try {
      // Check if we have a token
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Auth token exists:', !!token);
      console.log('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Get current user info
      try {
        const userData = await apiFetch<{user: any}>('auth/me');
        console.log('👤 Current user from auth/me:', userData.user);
      } catch (error) {
        console.error('❌ Failed to get current user:', error);
      }
    } catch (error) {
      console.error('❌ Failed to check user role:', error);
    }
  };

  // Compute visible users - show all users for now
  const visibleUsers = useMemo(() => {
    console.log('🔍 Showing all users:', users.length);
    return users;
  }, [users]);


  const fetchRestaurants = async () => {
    try {
      // includeInactive=1 to receive both lists
      const data = await apiFetch<{data: Restaurant[] | { active: Restaurant[]; inactive: Restaurant[] } }>('restaurants?includeInactive=1');
      const payload: any = data.data;
      if (Array.isArray(payload)) {
        setRestaurants(payload || []);
        setInactiveRestaurants([]);
      } else {
        setRestaurants(payload.active || []);
        setInactiveRestaurants(payload.inactive || []);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.role || !newUser.jobTitle) {
      showConfirm({
        title: 'Missing Information',
        description: 'Please fill in all required fields before creating the user.',
        confirmText: 'OK',
        variant: 'default',
        onConfirm: () => {}, // Just close the dialog
      });
      return;
    }

    try {
      await createUser(newUser);
      
      // Reset form
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        role: '',
        jobTitle: '',
        restaurantIds: []
      });
      setIsCreateDialogOpen(false);
      refetchUsers();
      
      addAlert(toast.success('User Created!', `${newUser.fullName} has been created successfully.`));
    } catch (error) {
      console.error('Failed to create user:', error);
      
      addAlert(toast.error('Failed to Create User', error instanceof Error ? error.message : 'Unknown error occurred'));
    }
  };

  const handleRestaurantToggle = (restaurantId: number, checked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      restaurantIds: checked 
        ? [...prev.restaurantIds, restaurantId]
        : prev.restaurantIds.filter(id => id !== restaurantId)
    }));
  };

  const handleDeleteUser = async (user: User) => {
    showConfirm({
      title: 'Delete User',
      description: `Are you sure you want to delete ${user.fullName}? This action cannot be undone and will permanently remove the user from the system.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await apiFetch(`users/${user.id}`, {
            method: 'DELETE',
          });
          refetchUsers();
          
          addAlert(toast.success('User Deleted!', `${user.fullName} has been deleted successfully.`));
        } catch (error) {
          console.error('Failed to delete user:', error);
          
          addAlert(toast.error('Failed to Delete User', error instanceof Error ? error.message : 'Unknown error occurred'));
        }
      },
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUser({
      fullName: user.fullName || '',
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle,
      restaurantIds: user.restaurants?.map(r => r.id) || []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUser.fullName || !editUser.email || !editUser.role || !editUser.jobTitle) {
      showConfirm({
        title: 'Missing Information',
        description: 'Please fill in all required fields before updating the user.',
        confirmText: 'OK',
        variant: 'default',
        onConfirm: () => {}, // Just close the dialog
      });
      return;
    }

    try {
      await apiFetch(`users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUser),
      });
      
      // Reset form
      setEditUser({
        fullName: '',
        email: '',
        role: '',
        jobTitle: '',
        restaurantIds: []
      });
      setEditingUser(null);
      setIsEditDialogOpen(false);
      refetchUsers();
      
      addAlert(toast.success('User Updated!', `${editUser.fullName} has been updated successfully.`));
    } catch (error) {
      console.error('Failed to update user:', error);
      
      addAlert(toast.error('Failed to Update User', error instanceof Error ? error.message : 'Unknown error occurred'));
    }
  };

  const handleEditRestaurantToggle = (restaurantId: number, checked: boolean) => {
    setEditUser(prev => ({
      ...prev,
      restaurantIds: checked 
        ? [...prev.restaurantIds, restaurantId]
        : prev.restaurantIds.filter(id => id !== restaurantId)
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Staff Management
              </h1>
              <p className="text-muted-foreground text-lg">
                Create users, assign roles, and manage restaurant access
              </p>
            </div>
            {currentUser?.role !== 'associate' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {getAvailableRoles().length > 1 ? (
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableRoles().map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
                          {getAvailableRoles()[0]?.[1] || 'Associate'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can only create {getAvailableRoles()[0]?.[1] || 'Associate'} users
                        </p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Select value={newUser.jobTitle} onValueChange={(value) => setNewUser(prev => ({ ...prev, jobTitle: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job title" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableJobTitles(newUser.role).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newUser.role === 'associate' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Job titles available for Associates
                        </p>
                      )}
                    </div>
                  </div>

                  {newUser.role && newUser.role !== 'admin' && (
                    <div>
                      <Label>Restaurant Access</Label>
                      <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {restaurants.map((restaurant) => (
                            <div key={restaurant.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`restaurant-${restaurant.id}`}
                                checked={newUser.restaurantIds.includes(restaurant.id)}
                                onCheckedChange={(checked) => handleRestaurantToggle(restaurant.id, checked as boolean)}
                              />
                              <Label htmlFor={`restaurant-${restaurant.id}`} className="text-sm">
                                {restaurant.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select which restaurants this {roleLabels[newUser.role as keyof typeof roleLabels]} can access
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            )}

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editFullName">Full Name *</Label>
                      <Input
                        id="editFullName"
                        value={editUser.fullName}
                        onChange={(e) => setEditUser(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEmail">Email *</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        value={editUser.email}
                        onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {getAvailableRoles().length > 1 ? (
                      <div>
                        <Label htmlFor="editRole">Role *</Label>
                        <Select value={editUser.role} onValueChange={(value) => setEditUser(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableRoles().map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="editRole">Role *</Label>
                        <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
                          {roleLabels[editUser.role as keyof typeof roleLabels] || 'Associate'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Role cannot be changed
                        </p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="editJobTitle">Job Title *</Label>
                      <Select value={editUser.jobTitle} onValueChange={(value) => setEditUser(prev => ({ ...prev, jobTitle: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job title" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableJobTitles(editUser.role).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editUser.role === 'associate' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Job titles available for Associates
                        </p>
                      )}
                    </div>
                  </div>

                  {editUser.role && editUser.role !== 'admin' && (
                    <div>
                      <Label>Restaurant Access</Label>
                      <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {restaurants.map((restaurant) => (
                            <div key={restaurant.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-restaurant-${restaurant.id}`}
                                checked={editUser.restaurantIds.includes(restaurant.id)}
                                onCheckedChange={(checked) => handleEditRestaurantToggle(restaurant.id, checked as boolean)}
                              />
                              <Label htmlFor={`edit-restaurant-${restaurant.id}`} className="text-sm">
                                {restaurant.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select which restaurants this {roleLabels[editUser.role as keyof typeof roleLabels]} can access
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateUser}>
                      Update User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visibleUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Associates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visibleUsers.filter((u: User) => u.role === 'associate').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Regular users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Black Shirts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visibleUsers.filter((u: User) => u.role === 'black_shirt').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Restaurant managers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ops Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visibleUsers.filter((u: User) => u.role === 'ops_lead').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Operations leaders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, job title, or restaurant..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="ops_lead">Operations Lead</SelectItem>
                  <SelectItem value="black_shirt">Black Shirt</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterJobTitle} onValueChange={(value: any) => setFilterJobTitle(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Job Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Titles</SelectItem>
                  <SelectItem value="Hourly Associate">Hourly Associate</SelectItem>
                  <SelectItem value="AM">Assistant Manager</SelectItem>
                  <SelectItem value="Chef">Chef</SelectItem>
                  <SelectItem value="SM/GM/TL">Store Manager/General Manager/Team Lead</SelectItem>
                  <SelectItem value="ACO">Area Coach</SelectItem>
                  <SelectItem value="RDO">Regional Director of Operations</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStore} onValueChange={(value: any) => setFilterStore(value)}>
                <SelectTrigger className="w-[160px]">
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {uniqueRestaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="jobTitle">Job Title</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {(searchQuery || filterRole !== 'all' || filterJobTitle !== 'all' || filterStore !== 'all') && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {searchFilterAndSortUsers.length} of {users?.length || 0} users
                {searchQuery && ` matching "${searchQuery}"`}
                {filterRole !== 'all' && ` filtered by ${roleLabels[filterRole as keyof typeof roleLabels] || filterRole}`}
                {filterJobTitle !== 'all' && ` filtered by ${jobTitleLabels[filterJobTitle as keyof typeof jobTitleLabels] || filterJobTitle}`}
                {filterStore !== 'all' && ` filtered by ${uniqueRestaurants.find(r => r.id.toString() === filterStore)?.name || 'Store'}`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setFilterRole('all')
                  setFilterJobTitle('all')
                  setFilterStore('all')
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Restaurant UI moved to /kitchen */}

        {/* Users Tables by Job Title */}
        {usersLoading ? (
        <Card>
          <CardContent>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading users...</p>
              </div>
            </CardContent>
          </Card>
            ) : usersError ? (
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">Error loading users</div>
                <p className="text-muted-foreground mb-4">{usersError.message}</p>
                <Button onClick={() => refetchUsers()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
            ) : visibleUsers.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found. Create your first user to get started.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Regional Director of Operations */}
            {(() => {
              const rdoUsers = searchFilterAndSortUsers.filter((user: User) => user.jobTitle === 'RDO');
              const paginatedRdoUsers = getPaginatedUsers(rdoUsers, 'rdo');
              const totalPages = getTotalPages(rdoUsers);
              
              return rdoUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Regional Director of Operations ({rdoUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Restaurants</TableHead>
                            {currentUser?.role !== 'associate' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedRdoUsers.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.role === 'admin' ? (
                                  <span className="text-muted-foreground text-sm">All restaurants</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {user.restaurants?.map((restaurant: Restaurant) => (
                                      <Badge key={restaurant.id} variant="outline" className="text-xs">
                                        {restaurant.name}
                                      </Badge>
                                    )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                                  </div>
                                )}
                              </TableCell>
                              {currentUser?.role !== 'associate' && (
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit user"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Delete user"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationComponent
                      currentPage={pagination.rdo}
                      totalPages={totalPages}
                      totalItems={rdoUsers.length}
                      onPageChange={(page) => updatePagination('rdo', page)}
                      tableType="rdo"
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* Area Coach */}
            {(() => {
              const acoUsers = searchFilterAndSortUsers.filter((user: User) => user.jobTitle === 'ACO');
              const paginatedAcoUsers = getPaginatedUsers(acoUsers, 'aco');
              const totalPages = getTotalPages(acoUsers);
              
              return acoUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Area Coach ({acoUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Restaurants</TableHead>
                            {currentUser?.role !== 'associate' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAcoUsers.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.role === 'admin' ? (
                                  <span className="text-muted-foreground text-sm">All restaurants</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {user.restaurants?.map((restaurant: Restaurant) => (
                                      <Badge key={restaurant.id} variant="outline" className="text-xs">
                                        {restaurant.name}
                                      </Badge>
                                    )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                                  </div>
                                )}
                              </TableCell>
                              {currentUser?.role !== 'associate' && (
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit user"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Delete user"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationComponent
                      currentPage={pagination.aco}
                      totalPages={totalPages}
                      totalItems={acoUsers.length}
                      onPageChange={(page) => updatePagination('aco', page)}
                      tableType="aco"
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* Black Shirts */}
            {(() => {
              const blackShirtUsers = searchFilterAndSortUsers.filter((user: User) => user.role === 'black_shirt');
              const paginatedBlackShirtUsers = getPaginatedUsers(blackShirtUsers, 'blackShirts');
              const totalPages = getTotalPages(blackShirtUsers);
              
              return blackShirtUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Black Shirts ({blackShirtUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Restaurants</TableHead>
                            {currentUser?.role !== 'associate' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedBlackShirtUsers.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{jobTitleLabels[user.jobTitle as keyof typeof jobTitleLabels]}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.restaurants?.map((restaurant: Restaurant) => (
                                    <Badge key={restaurant.id} variant="outline" className="text-xs">
                                      {restaurant.name}
                                    </Badge>
                                  )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                                </div>
                              </TableCell>
                              {currentUser?.role !== 'associate' && (
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit user"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Delete user"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationComponent
                      currentPage={pagination.blackShirts}
                      totalPages={totalPages}
                      totalItems={blackShirtUsers.length}
                      onPageChange={(page) => updatePagination('blackShirts', page)}
                      tableType="blackShirts"
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* Hourly Associates */}
            {(() => {
              const hourlyAssociateUsers = searchFilterAndSortUsers.filter((user: User) => user.jobTitle === 'Hourly Associate' && user.role !== 'tablet');
              const paginatedHourlyAssociateUsers = getPaginatedUsers(hourlyAssociateUsers, 'hourlyAssociates');
              const totalPages = getTotalPages(hourlyAssociateUsers);
              
              return hourlyAssociateUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Hourly Associates ({hourlyAssociateUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Restaurants</TableHead>
                            {currentUser?.role !== 'associate' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedHourlyAssociateUsers.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.restaurants?.map((restaurant: Restaurant) => (
                                    <Badge key={restaurant.id} variant="outline" className="text-xs">
                                      {restaurant.name}
                                    </Badge>
                                  )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                                </div>
                              </TableCell>
                              {currentUser?.role !== 'associate' && (
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit user"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Delete user"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationComponent
                      currentPage={pagination.hourlyAssociates}
                      totalPages={totalPages}
                      totalItems={hourlyAssociateUsers.length}
                      onPageChange={(page) => updatePagination('hourlyAssociates', page)}
                      tableType="hourlyAssociates"
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* Tablets */}
            {(() => {
              const tabletUsers = searchFilterAndSortUsers.filter((user: User) => user.role === 'tablet');
              const paginatedTabletUsers = getPaginatedUsers(tabletUsers, 'tablets');
              const totalPages = getTotalPages(tabletUsers);
              
              return tabletUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Tablets ({tabletUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Restaurants</TableHead>
                            {currentUser?.role !== 'associate' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTabletUsers.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{jobTitleLabels[user.jobTitle as keyof typeof jobTitleLabels]}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.restaurants?.map((restaurant: Restaurant) => (
                                    <Badge key={restaurant.id} variant="outline" className="text-xs">
                                      {restaurant.name}
                                    </Badge>
                                  )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                                </div>
                              </TableCell>
                              {currentUser?.role !== 'associate' && (
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit user"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Delete user"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationComponent
                      currentPage={pagination.tablets}
                      totalPages={totalPages}
                      totalItems={tabletUsers.length}
                      onPageChange={(page) => updatePagination('tablets', page)}
                      tableType="tablets"
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* Other Users (catch-all for any users that don't fit the above categories) */}
            {(() => {
              const otherUsers = searchFilterAndSortUsers.filter((user: User) => 
                user.jobTitle !== 'RDO' && 
                user.jobTitle !== 'ACO' && 
                user.role !== 'black_shirt' && 
                user.jobTitle !== 'Hourly Associate' && 
                user.role !== 'tablet'
              );
              const paginatedOtherUsers = getPaginatedUsers(otherUsers, 'otherStaff');
              const totalPages = getTotalPages(otherUsers);
              
              return otherUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Other Staff ({otherUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Restaurants</TableHead>
                            {currentUser?.role !== 'associate' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedOtherUsers.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{jobTitleLabels[user.jobTitle as keyof typeof jobTitleLabels]}</TableCell>
                              <TableCell>
                                {user.role === 'admin' ? (
                                  <span className="text-muted-foreground text-sm">All restaurants</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {user.restaurants?.map((restaurant: Restaurant) => (
                                      <Badge key={restaurant.id} variant="outline" className="text-xs">
                                        {restaurant.name}
                                      </Badge>
                                    )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                                  </div>
                                )}
                              </TableCell>
                              {currentUser?.role !== 'associate' && (
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit user"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Delete user"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationComponent
                      currentPage={pagination.otherStaff}
                      totalPages={totalPages}
                      totalItems={otherUsers.length}
                      onPageChange={(page) => updatePagination('otherStaff', page)}
                      tableType="otherStaff"
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* No Results State */}
            {searchFilterAndSortUsers.length === 0 && users && users.length > 0 && (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Users Found</h3>
                    <p className="text-muted-foreground">
                      No users match your current search and filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setFilterRole('all')
                        setFilterJobTitle('all')
                        setFilterStore('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {/* Confirm Dialog Component */}
      <ConfirmDialogComponent />
      
      {/* Toast Alerts */}
      <ToastContainer />
    </div>
  );
}

export default function StaffManagement() {
  return (
    <ProtectedRoute>
      <StaffManagementContent />
    </ProtectedRoute>
  );
}