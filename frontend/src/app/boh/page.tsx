'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useSound } from '@/hooks/useSound';
import { useSWROrders } from '@/hooks/useSWRKitchen';
import { apiFetch } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function BOHPageContent() {

  interface Order {
    id: number;
    tableSection: number;
    menuItemId: number;
    batchSize: number;
    batchNumber: number;
    status: string;
    timerStart?: string;
    timerEnd?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    menuItem: {
      id: number;
      itemTitle: string;
      batchBreakfast: number;
      batchLunch: number;
      batchDowntime: number;
      batchDinner: number;
      cookingTimeBatch1: number;
      cookingTimeBatch2: number;
      cookingTimeBatch3: number;
      status: string;
    };
  }

  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant_id') || '1';
  
  const { orders, loading, error, mutate: mutateOrders } = useSWROrders(restaurantId);
  const [, setNow] = useState<number>(Date.now());
  const previousOrderStatusesRef = useRef<Map<number, string>>(new Map());
  const { joinKitchen, leaveKitchen, isConnected } = useWebSocket();
  const { startTimerBeepLoop, stopTimerBeepLoop, isTimerBeepLooping } = useSound();


  useEffect(() => {
    // Join kitchen room when component mounts
    if (isConnected) {
      joinKitchen();
    }
    
    // Cleanup: leave kitchen room when component unmounts
    return () => {
      leaveKitchen();
    };
  }, [isConnected, joinKitchen, leaveKitchen]);

  // Polling: refresh orders every 2 seconds for testing
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Refreshing orders...');
      mutateOrders();
    }, 2000);
    return () => clearInterval(interval);
  }, [mutateOrders]);

  // Live tick to update remaining time while any order is cooking
  useEffect(() => {
    const hasCooking = orders.some((o) => o.status === 'cooking' && o.timerEnd);
    if (!hasCooking) return;

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [orders]);

  // Check for timer expired status changes and play sound
  useEffect(() => {
    console.log('🔍 Orders updated:', orders.length, 'orders');
    
    const hasExpiredOrders = orders.some(order => order.status === 'timer_expired');
    
    orders.forEach((order) => {
      console.log(`🔍 Order ${order.id}: status=${order.status}`);
      const previousStatus = previousOrderStatusesRef.current.get(order.id);
      console.log(`🔍 Order ${order.id}: previous=${previousStatus}, current=${order.status}`);
      
      // If status changed to timer_expired, start sound loop
      if (previousStatus && previousStatus !== 'timer_expired' && order.status === 'timer_expired') {
        console.log('🔊 Timer expired detected for order:', order.id);
        console.log('🔊 Starting continuous sound loop');
        startTimerBeepLoop();
      }
      
      // Update the status in the ref
      previousOrderStatusesRef.current.set(order.id, order.status);
    });
    
    // Stop sound loop if no expired orders
    if (!hasExpiredOrders && isTimerBeepLooping()) {
      console.log('🔊 No expired orders, stopping sound loop');
      stopTimerBeepLoop();
    }
  }, [orders, startTimerBeepLoop, stopTimerBeepLoop, isTimerBeepLooping]);

  // Removed fetchOrders - now handled by SWR

  // WebSocket event handlers removed - now using direct status checking for sound


  const getCookingTime = (order: Order) => {
    const menuItem = order.menuItem;
    const batchNumber = order.batchNumber;
    if (!menuItem) return 0;
    if (batchNumber === 1) return menuItem.cookingTimeBatch1;
    if (batchNumber === 2) return menuItem.cookingTimeBatch2;
    if (batchNumber === 3) return menuItem.cookingTimeBatch3;
    return menuItem.cookingTimeBatch1;
  };

  const getRemainingTime = (order: Order) => {
    if (order.status !== 'cooking' || !order.timerEnd) return null;
    const now = new Date().getTime();
    const endTime = new Date(order.timerEnd).getTime();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    return remaining;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTimer = async (orderId: number) => {
    try {
      console.log('⏰ Starting timer for order:', orderId);
      
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('❌ Order not found:', orderId);
        alert('Order not found');
        return;
      }

      const cookingTimeMinutes = getCookingTime(order);
      console.log('📊 Timer details:', { orderId, order: order.menuItem?.itemTitle, cookingTimeMinutes });
      
      const response = await apiFetch(`/orders/${orderId}/start-timer`, {
        method: 'POST',
        body: JSON.stringify({
          cookingTime: cookingTimeMinutes
        }),
      });
      
      console.log('✅ Timer started successfully:', response);
      
      // Refresh orders to show updated status
      mutateOrders();
    } catch (error) {
      console.error('❌ Error starting timer:', error);
      alert('Error starting timer: ' + error.message);
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      console.log('✅ Completing order:', orderId);
      await apiFetch(`/orders/${orderId}/complete`, {
        method: 'POST',
      });
      
      // Auto-delete the order after completion
      console.log('🗑️ Auto-deleting completed order:', orderId);
      await apiFetch(`/orders/${orderId}`, { method: 'DELETE' });
      
      mutateOrders(); // Refresh orders after completion and deletion
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      console.log('🗑️ Deleting order:', orderId);
      await apiFetch(`/orders/${orderId}`, { method: 'DELETE' });
      
      // Stop sound loop after deletion
      console.log('🔊 Stopping sound loop after order deletion');
      stopTimerBeepLoop();
      
      mutateOrders(); // Refresh orders after deletion
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const addTimeToOrder = async (orderId: number, additionalSeconds: number = 20) => {
    try {
      console.log('⏰ Adding time to order:', orderId, 'additional seconds:', additionalSeconds);
      await apiFetch(`/orders/${orderId}/add-time`, {
        method: 'POST',
        body: JSON.stringify({ additionalSeconds }),
      });
      
      // Stop sound loop after adding time
      console.log('🔊 Stopping sound loop after adding time');
      stopTimerBeepLoop();
      
      mutateOrders(); // Refresh orders after adding time
    } catch (error) {
      console.error('Error adding time to order:', error);
      alert('Error adding time to order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              BOH Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Restaurant ID: {restaurantId} | Current Time: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">No orders in queue</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dish</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Batch Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="text-sm font-medium">
                        {order?.menuItem?.itemTitle ?? '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">Table {order.tableSection}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{order.batchSize}</p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'cooking' ? 'default' :
                          order.status === 'timer_expired' ? 'destructive' :
                          order.status === 'ready' ? 'secondary' : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.status === 'cooking' ? (
                        (() => {
                          const remaining = getRemainingTime(order);
                          return remaining !== null ? (
                            <p className="text-blue-600 font-medium">⏰ {formatTime(remaining)}</p>
                          ) : (
                            <p className="text-blue-600 font-medium">Running...</p>
                          );
                        })()
                      ) : order.status === 'pending' ? (
                        <p className="text-yellow-600 font-medium">Pending</p>
                      ) : order.status === 'timer_expired' ? (
                        <p className="text-red-600 font-medium">Expired!</p>
                      ) : order.status === 'ready' ? (
                        <p className="text-green-600 font-medium">Ready!</p>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <Button
                            onClick={() => startTimer(order.id)}
                            variant="default"
                            size="sm"
                          >
                            Start Timer
                          </Button>
                        )}
                        {order.status === 'cooking' && (
                          <Button
                            onClick={() => completeOrder(order.id)}
                            variant="default"
                            size="sm"
                          >
                            Complete
                          </Button>
                        )}
                        {order.status === 'timer_expired' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => addTimeToOrder(order.id, 20)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <Clock className="h-3 w-3" />
                              <span>+20s</span>
                            </Button>
                            <Button
                              onClick={() => deleteOrder(order.id)}
                              variant="destructive"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function BOHPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-2xl text-muted-foreground">Loading...</p>
        </div>
      }>
        <BOHPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}