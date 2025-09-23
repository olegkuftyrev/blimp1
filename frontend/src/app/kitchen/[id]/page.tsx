'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';
import { ArrowLeft, ChefHat, Clock, Utensils, History, Settings, Users, Table, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSWRRestaurants, useSWROrders, findRestaurantById } from '@/hooks/useSWRKitchen';
import { useAuth } from '@/contexts/AuthContextSWR';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface Order {
  id: number;
  tableSection: number;
  status: string;
  menuItem?: {
    itemTitle: string;
  };
  batchSize: number;
  timerStart?: string;
  timerEnd?: string;
}

function RestaurantKitchenContent() {
  const params = useParams();
  const { user } = useAuth();
  const restaurantId = params.id as string;
  
  const { restaurants, inactiveRestaurants, loading: restaurantsLoading } = useSWRRestaurants({ includeInactive: true });
  const { orders, loading: ordersLoading, error: ordersError } = useSWROrders(restaurantId);
  
  const allRestaurants = [...(restaurants || []), ...(inactiveRestaurants || [])];
  const restaurant = findRestaurantById(allRestaurants, restaurantId);
  const loading = restaurantsLoading || ordersLoading;
  const error = ordersError;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading kitchen dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error || 'Restaurant not found'}</p>
          <Link href="/kitchen">
            <Button>Back to Kitchen Selection</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(order => ['pending', 'cooking'].includes(order.status));
  const completedToday = orders.filter(order => ['ready', 'completed'].includes(order.status));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-orange-500">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{restaurant.name}</h1>
                <p className="text-muted-foreground">{restaurant.address}</p>
                <p className="text-sm text-muted-foreground">📞 {restaurant.phone}</p>
              </div>
              <Badge className="bg-green-500">Kitchen Active</Badge>
            </div>
            
            {/* Edit Button - Only for admin, ops_lead, black_shirt */}
            {user?.role && ['admin', 'ops_lead', 'black_shirt'].includes(user.role) && (
              <Link href={`/kitchen/${restaurantId}/edit`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Restaurant</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{activeOrders.length}</div>
              <p className="text-xs text-muted-foreground">Currently in kitchen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedToday.length}</div>
              <p className="text-xs text-muted-foreground">Orders finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kitchen Status</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12m</div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Back of House (BOH) */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Back of House (BOH)</CardTitle>
                  <p className="text-muted-foreground">Kitchen operations and order management</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Active Orders</p>
                    <p className="text-2xl font-bold text-orange-600">{activeOrders.length}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">In Cooking</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {orders.filter(o => o.status === 'cooking').length}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    href={`/boh?restaurant_id=${restaurantId}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-600 text-white hover:bg-orange-700 h-10 px-4 py-2 w-full"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Active Orders & Timers
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background h-9 px-3 py-2 cursor-not-allowed opacity-50"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History - Coming Soon
                    </div>
                    <div
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background h-9 px-3 py-2 cursor-not-allowed opacity-50"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Settings - Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Table className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Table Management</CardTitle>
                  <p className="text-muted-foreground">Order placement and table operations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Tables Active</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Set(activeOrders.map(o => o.tableSection)).size}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Avg Wait</p>
                    <p className="text-2xl font-bold text-green-600">8m</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    href={`/table/1?restaurant_id=${restaurantId}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full"
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Place New Orders
                  </Link>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Access table interface to create orders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {activeOrders.length > 0 && (
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Kitchen Activity</h3>
            <div className="space-y-3">
              {activeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <Utensils className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Table {order.tableSection} - {order.menuItem?.itemTitle || 'Unknown Item'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Batch size: {order.batchSize} | Status: {order.status}
                      </p>
                    </div>
                  </div>
                  <Badge variant={order.status === 'cooking' ? 'default' : 'secondary'}>
                    {order.status === 'cooking' ? 'Cooking' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RestaurantKitchen() {
  return (
    <ProtectedRoute>
      <RestaurantKitchenContent />
    </ProtectedRoute>
  );
}
