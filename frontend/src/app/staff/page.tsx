'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ArrowLeft, Users, Plus, Edit, Trash2, Building } from "lucide-react";
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

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'ops_lead' | 'black_shirt' | 'associate';
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
        return [['associate', 'Associate']]; // Only associate
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
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchUsers();
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
      console.log('Auth token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Get current user info
      try {
        const userData = await apiFetch<{user: any}>('auth/me');
        console.log('Current user:', userData.user);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<{data: User[]}>('users/team');
      setUsers(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      
      // Check if it's a permissions error
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('User does not have permission to view users list');
        alert('You do not have permission to view the users list. Please contact your administrator.');
      }
      
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const data = await apiFetch<{data: Restaurant[]}>('restaurants');
      setRestaurants(data.data || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.role || !newUser.jobTitle) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiFetch('users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
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
      fetchUsers();
      alert('User created successfully!');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user: ' + (error.message || 'Unknown error'));
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

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiFetch(`users/${userId}`, {
        method: 'DELETE',
      });
      fetchUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + (error.message || 'Unknown error'));
    }
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
      alert('Please fill in all required fields');
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
      fetchUsers();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user: ' + (error.message || 'Unknown error'));
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Staff Management
              </h1>
              <p className="text-muted-foreground text-lg">
                Create users, assign roles, and manage restaurant access
              </p>
            </div>
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
                    <Button onClick={handleCreateUser}>
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
              <div className="text-2xl font-bold">{users.length}</div>
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
                {users.filter(u => u.role === 'associate').length}
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
                {users.filter(u => u.role === 'black_shirt').length}
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
                {users.filter(u => u.role === 'ops_lead').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Operations leaders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found. Create your first user to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Restaurants</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>{jobTitleLabels[user.jobTitle]}</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <span className="text-muted-foreground text-sm">All restaurants</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {user.restaurants?.map(restaurant => (
                                <Badge key={restaurant.id} variant="outline" className="text-xs">
                                  {restaurant.name}
                                </Badge>
                              )) || <span className="text-muted-foreground text-sm">No restaurants assigned</span>}
                            </div>
                          )}
                        </TableCell>
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
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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