'use client';

import Link from "next/link";

export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getApiUrl, apiFetch } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Order {
  id: number;
  tableSection: number;
  menuItemId: number;
  batchSize: number;
  status: string;
  timerStart?: string;
  timerEnd?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



function HomeContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);

  const handleNavigation = (path: string) => {
    if (selectedRestaurant) {
      // Add restaurant ID as query parameter
      const url = new URL(path, window.location.origin);
      url.searchParams.set('restaurant_id', selectedRestaurant.id.toString());
      router.push(url.pathname + url.search);
    } else {
      router.push(path);
    }
  };

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await apiFetch<{data: Restaurant[]}>('simple-auth/restaurants');
        setRestaurants(data.data || []);
        setRestaurantsLoading(false);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurantsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch orders from API (only when restaurant is selected)
  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchOrders = async () => {
      try {
        const data = await apiFetch<{data: Order[]}>(`simple-auth/orders?restaurant_id=${selectedRestaurant.id}`);
        setOrders(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Refresh orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [selectedRestaurant]);

  // Count total active orders
  const getTotalActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'cooking', 'timer_expired', 'ready'].includes(order.status)
    ).length;
  };

  if (restaurantsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading restaurants...</p>
      </div>
    );
  }

  // Show restaurant selection if no restaurant is selected
  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8"></div>
          <div className="space-y-8 mb-12">
            <h1 className="text-3xl font-bold text-center text-foreground">
              Blimp Smart Table
            </h1>
            <p className="text-center text-muted-foreground text-xl">
              Select a restaurant to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card 
                key={restaurant.id}
                className="cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <CardHeader>
                  <CardTitle className="text-primary">
                    {restaurant.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {restaurant.address}
                  </p>
                  <p className="text-muted-foreground/70 text-sm">
                    {restaurant.phone}
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8"></div>
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Blimp Smart Table
          </h1>
          
          {/* Selected Restaurant Info */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-primary">
                {selectedRestaurant.name}
              </h2>
              <p className="text-muted-foreground text-sm text-center">
                {selectedRestaurant.address}
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedRestaurant(null)}
                >
                  Change Restaurant
                </Button>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your section to manage orders and operations
          </p>
          
          {/* System Status */}
          <div className="flex gap-4 justify-center">
            <p className="text-muted-foreground text-sm">
              System Status:
            </p>
            <div className="flex gap-2 items-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Online</Badge>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table Section */}
          <Card 
            className="cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
            onClick={() => handleNavigation("/table/1")}
          >
            <CardContent className="text-center p-8">
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Table Section
              </h3>
              <p className="text-muted-foreground mb-4">
                Manage all orders and menu items
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {loading ? "..." : `${getTotalActiveOrders()} Active Orders`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* BOH Page */}
          <Card 
            className="cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
            onClick={() => handleNavigation("/boh")}
          >
            <CardContent className="text-center p-8">
              <h3 className="text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">
                BOH Management
              </h3>
              <p className="text-muted-foreground mb-4">
                Back of house operations
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {loading ? "..." : `${getTotalActiveOrders()} Total Active Orders`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
