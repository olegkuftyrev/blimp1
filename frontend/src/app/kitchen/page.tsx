'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ArrowLeft, ChefHat, Clock, Utensils, History, Settings, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

function KitchenModuleContent() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{data: Restaurant[]}>('simple-auth/restaurants');
      const restaurantList = response.data || [];
      setRestaurants(restaurantList);

      // If user has access to only one restaurant, auto-redirect to kitchen dashboard
      if (restaurantList.length === 1) {
        // Small delay to show the page briefly, then redirect
        setTimeout(() => {
          window.location.href = `/kitchen/${restaurantList[0].id}`;
        }, 1000);
      }
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

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
          <Button onClick={fetchRestaurants}>Try Again</Button>
        </div>
      </div>
    );
  }

  // If only one restaurant, show loading message while redirecting
  if (restaurants.length === 1) {
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
              <Badge className="mt-2 bg-green-500">Active</Badge>
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
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                        {restaurant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        📍 {restaurant.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📞 {restaurant.phone}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
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
            </div>
          )}
        </div>

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
