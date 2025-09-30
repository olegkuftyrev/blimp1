'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ArrowLeft, ChefHat, Clock, Utensils, History, Settings, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { useAuth } from '@/contexts/AuthContextSWR';
import { apiFetch } from '@/lib/api';
import { WebSocketStatus } from '@/components/WebSocketStatus';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

function KitchenModuleContent() {
  const { user } = useAuth();
  const { restaurants, inactiveRestaurants, loading, error, mutate } = useSWRRestaurants({ includeInactive: true });
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [isCreateRestaurantDialogOpen, setIsCreateRestaurantDialogOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState<{ name: string; address: string; phone: string }>({ name: '', address: '', phone: '' });

  useEffect(() => {
    // If non-admin user has access to only one restaurant, auto-redirect to its kitchen dashboard
    if (user?.role !== 'admin' && restaurants.length === 1 && !loading) {
      setTimeout(() => {
        window.location.href = `/kitchen/${restaurants[0].id}`;
      }, 1000);
    }
  }, [restaurants, loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <Button onClick={() => mutate()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // If only one restaurant, show loading message while redirecting
  if (user?.role !== 'admin' && restaurants.length === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Accessing {restaurants[0].name}
          </h2>
          <p className="text-muted-foreground">Redirecting to kitchen dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-orange-500">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Kitchen Management</h1>
              <div className="mt-2">
                <WebSocketStatus />
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            {user?.role === 'admin' 
              ? 'Select a restaurant to manage kitchen operations'
              : 'Access your assigned restaurant kitchen operations'
            }
          </p>
        </div>

        {/* Restaurant Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {user?.role === 'admin' ? 'All Restaurants' : 'Your Restaurants'} ({restaurants.length})
          </h2>
          
          {restaurants.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Restaurants Available</h3>
                <p className="text-muted-foreground">
                  {user?.role === 'admin' 
                    ? 'No restaurants found in the system.'
                    : 'You don\'t have access to any restaurants yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant: Restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                        {restaurant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-2 mb-4 flex-1">
                      <p className="text-sm text-muted-foreground min-h-[2.5rem]">
                        📍 {restaurant.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📞 {restaurant.phone}
                      </p>
                    </div>
                    
                    <div className="space-y-2 mt-auto">
                      {restaurant.isActive ? (
                        <Link
                          href={`/kitchen/${restaurant.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-600 text-white hover:bg-orange-700 h-10 px-4 py-2 w-full"
                        >
                          <ChefHat className="h-4 w-4 mr-2" />
                          Access Kitchen
                        </Link>
                      ) : (
                        <Button disabled className="w-full">
                          Restaurant Inactive
                        </Button>
                      )}
                      
                      {/* Edit Button - Only for admin, ops_lead, black_shirt */}
                      {user?.role && ['admin', 'ops_lead', 'black_shirt'].includes(user.role) && (
                        <Link
                          href={`/kitchen/${restaurant.id}/edit`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 w-full"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Info
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Create New Restaurant card (admin, ops_lead only) */}
              {user?.role && ['admin', 'ops_lead'].includes(user.role) && (
                <Card
                  className="hover:shadow-lg transition-all cursor-pointer h-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => setIsCreateRestaurantDialogOpen(true)}
                >
                  <CardContent className="h-full flex flex-col items-center justify-center p-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        creatingRestaurant ? 'bg-primary/20 animate-pulse' : 'bg-primary/10 hover:bg-primary/20'
                      }`}>
                        <Plus className={`h-8 w-8 transition-all ${creatingRestaurant ? 'text-primary animate-spin' : 'text-primary'}`} />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-1">{creatingRestaurant ? 'Creating...' : 'Create New Restaurant'}</h3>
                        <p className="text-sm text-muted-foreground">Add a new store and auto-generate a tablet user</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {user?.role === 'admin' && inactiveRestaurants?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Inactive Restaurants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveRestaurants.map((r: Restaurant) => (
                <Card key={r.id} className="border-destructive/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.address}</div>
                      </div>
                      <Badge variant="outline" className="text-destructive border-destructive/50">Inactive</Badge>
                    </div>
                    {user?.role && ['admin', 'ops_lead', 'black_shirt'].includes(user.role) && (
                      <div className="mt-3">
                        <Link
                          href={`/kitchen/${r.id}/edit`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Info
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create Restaurant Dialog */}
        <Dialog open={isCreateRestaurantDialogOpen} onOpenChange={setIsCreateRestaurantDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Restaurant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="12345"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newRestaurant.name}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setNewRestaurant(prev => ({ ...prev, name: digitsOnly }));
                  }}
                />
              </div>
              <div>
                <Input placeholder="123 Main St" value={newRestaurant.address} onChange={(e) => setNewRestaurant(prev => ({...prev, address: e.target.value}))} />
              </div>
              <div>
                <Input placeholder="(555) 123-4567" value={newRestaurant.phone} onChange={(e) => setNewRestaurant(prev => ({...prev, phone: e.target.value}))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsCreateRestaurantDialogOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  if (!newRestaurant.name || !newRestaurant.address || !newRestaurant.phone) return;
                  const payload = { ...newRestaurant, name: `px${newRestaurant.name}` };
                  try {
                    setCreatingRestaurant(true);
                    await apiFetch('restaurants', {
                      method: 'POST',
                      body: JSON.stringify(payload),
                    });
                  } finally {
                    setCreatingRestaurant(false);
                    setIsCreateRestaurantDialogOpen(false);
                    setNewRestaurant({ name: '', address: '', phone: '' });
                    mutate();
                  }
                }} disabled={creatingRestaurant}>{creatingRestaurant ? 'Creating...' : 'Create Restaurant'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Info */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Kitchen Management Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-foreground">Order Tracking</p>
                <p className="text-sm text-muted-foreground">Real-time order status</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Utensils className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-foreground">Kitchen Timers</p>
                <p className="text-sm text-muted-foreground">Cooking time management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <History className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-foreground">Order History</p>
                <p className="text-sm text-muted-foreground">Complete order records</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-foreground">Kitchen Settings</p>
                <p className="text-sm text-muted-foreground">Customize operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KitchenModule() {
  return (
    <ProtectedRoute>
      <KitchenModuleContent />
    </ProtectedRoute>
  );
}
