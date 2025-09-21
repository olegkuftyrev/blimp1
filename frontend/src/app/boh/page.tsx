'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import { useSound } from '@/hooks/useSound';
import { useSWROrders } from '@/hooks/useSWRKitchen';
import { apiFetch } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { joinKitchen, leaveKitchen, isConnected } = useWebSocket();
  const { playTimerBeepSequence, playTimerBeep } = useSound();

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

  // Fallback polling: refresh orders every 2 seconds only if WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        mutateOrders();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Live tick to update remaining time while any order is cooking
  useEffect(() => {
    const hasCooking = orders.some((o) => o.status === 'cooking' && o.timerEnd);
    if (!hasCooking) return;

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [orders]);

  // Removed fetchOrders - now handled by SWR

  // WebSocket event handlers
  type OrderEventT = { order: BackendOrder };
  type TimerEventT = { 
    order: {
      id: number;
      tableSection?: number; table_section?: number;
      menuItemId?: number; menu_item_id?: number;
      batchSize?: number; batch_size?: number;
      batchNumber?: number; batch_number?: number;
      status: string;
      timerStart?: string; timer_start?: string;
      timerEnd?: string; timer_end?: string;
      completedAt?: string; completed_at?: string;
      createdAt?: string; created_at?: string;
      updatedAt?: string; updated_at?: string;
      menuItem?: {
        id: number;
        itemTitle: string;
      };
      menu_item?: {
        id: number;
        itemTitle: string;
      };
    }
  };

  type BackendOrder = {
    id: number;
    tableSection?: number; table_section?: number;
    menuItemId?: number; menu_item_id?: number;
    batchSize?: number; batch_size?: number;
    batchNumber?: number; batch_number?: number;
    status: string;
    timerStart?: string; timer_start?: string;
    timerEnd?: string; timer_end?: string;
    completedAt?: string; completed_at?: string;
    createdAt?: string; created_at?: string;
    updatedAt?: string; updated_at?: string;
    menuItem?: Order['menuItem']; menu_item?: Order['menuItem'];
  };

  const handleOrderCreated = (event: OrderEventT) => {
    console.log('📢 Order created event received:', event);
    const ord = normalizeOrder(event.order);
    setOrders((prev) => {
      if (prev.some((o) => o.id === ord.id)) return prev.map((o) => (o.id === ord.id ? ord : o));
      return [...prev, ord];
    });
    fetchOrders();
  };

  const handleOrderUpdated = (event: OrderEventT) => {
    console.log('📢 Order updated event received:', event);
    const ord = normalizeOrder(event.order);
    setOrders((prev) => prev.map((order) => (order.id === ord.id ? ord : order)));
    fetchOrders();
  };

  const handleOrderCompleted = (event: OrderEventT) => {
    console.log('📢 Order completed event received:', event);
    const ord = normalizeOrder(event.order);
    setOrders((prev) => prev.map((order) => (order.id === ord.id ? ord : order)));
    fetchOrders();
  };

  const handleOrderDeleted = (event: OrderEventT) => {
    console.log('🗑️ Order deleted event received:', event);
    const ord = normalizeOrder(event.order);
    setOrders((prev) => prev.filter((order) => order.id !== ord.id));
    fetchOrders();
  };

  const handleAllOrdersDeleted = () => {
    console.log('🗑️ All orders deleted event received');
    setOrders([]);
  };

  const handleTimerStarted = (event: TimerEventT) => {
    console.log('⏰ Timer started event received:', event);
    const ord = normalizeOrder(event.order);
    fetchOrders();
  };

  const handleTimerExpired = (event: TimerEventT) => {
    console.log('⏰ Timer expired event received:', event);
    console.log('🔊 About to play timer sound...');
    
    // Play timer completion sound
    try {
      playTimerBeepSequence();
      console.log('🔊 Timer sound triggered successfully');
    } catch (error) {
      console.error('🔊 Error playing timer sound:', error);
    }
    
    const ord = normalizeOrder(event.order);
    fetchOrders();
  };

  // Subscribe to WebSocket events
  useOrderEvents(
    handleOrderCreated,
    handleOrderUpdated,
    handleOrderCompleted,
    handleOrderDeleted,
    handleAllOrdersDeleted
  );
  useTimerEvents(handleTimerStarted, handleTimerExpired);

  const normalizeOrder = (o: BackendOrder | TimerEventT['order']) => {
    const menuItem = o.menuItem || o.menu_item || {
      id: 0,
      itemTitle: 'Unknown Item',
      batchBreakfast: 0,
      batchLunch: 0,
      batchDowntime: 0,
      batchDinner: 0,
      cookingTimeBatch1: 0,
      cookingTimeBatch2: 0,
      cookingTimeBatch3: 0,
      status: 'active'
    };
    return {
      id: o.id,
      tableSection: o.tableSection ?? o.table_section!,
      menuItemId: o.menuItemId ?? o.menu_item_id ?? menuItem.id,
      batchSize: o.batchSize ?? o.batch_size!,
      batchNumber: o.batchNumber ?? o.batch_number ?? 1,
      status: o.status,
      timerStart: o.timerStart ?? o.timer_start,
      timerEnd: o.timerEnd ?? o.timer_end,
      completedAt: o.completedAt ?? o.completed_at,
      createdAt: o.createdAt ?? o.created_at!,
      updatedAt: o.updatedAt ?? o.updated_at!,
      menuItem: menuItem,
    } as Order;
  };

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
      
      const response = await apiFetch(`simple-auth/orders/${orderId}/start-timer`, {
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
      await apiFetch(`simple-auth/orders/${orderId}/complete`, {
        method: 'POST',
      });
      mutateOrders(); // Refresh orders after completion
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      console.log('🗑️ Deleting order:', orderId);
      await apiFetch(`simple-auth/orders/${orderId}`, { method: 'DELETE' });
      mutateOrders(); // Refresh orders after deletion
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
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
            <Button
              onClick={() => playTimerBeepSequence()}
              variant="outline"
              size="sm"
            >
              🔊 Test Sound
            </Button>
            <Button
              onClick={() => {
                console.log('🧪 Testing timer expiration handler...');
                handleTimerExpired({
                  order: {
                    id: 999,
                    tableSection: 1,
                    menuItemId: 1,
                    batchSize: 1,
                    status: 'timer_expired',
                    timerStart: new Date().toISOString(),
                    timerEnd: new Date().toISOString(),
                    menuItem: {
                      id: 1,
                      itemTitle: 'Test Item'
                    }
                  }
                });
              }}
              variant="outline"
              size="sm"
            >
              🧪 Test Timer Handler
            </Button>
            <Button
              onClick={async () => {
                try {
                  console.log('🧪 Testing backend timer expiration...');
                  const response = await fetch(getApiUrl('kitchen/test-timer-expiration'), {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  const data = await response.json();
                  console.log('Backend response:', data);
                } catch (error) {
                  console.error('Error testing backend timer expiration:', error);
                }
              }}
              variant="outline"
              size="sm"
            >
              🧪 Test Backend Timer
            </Button>
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
                        {(order.status === 'timer_expired' || order.status === 'ready') && (
                          <Button
                            onClick={() => deleteOrder(order.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
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