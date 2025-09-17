'use client';

import { useParams, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiFetch } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MenuItem {
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
}

interface Order {
  id: number;
  tableSection: number;
  menuItemId: number | undefined;
  batchSize: number;
  batchNumber: number;
  status: string;
  timerStart?: string;
  timerEnd?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  menuItem?: MenuItem;
}

function TableSectionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tableId = params.id as string;
  const restaurantId = searchParams.get('restaurant_id') || '1';

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setSentOrders] = useState<Record<string, boolean>>({});
  const [, setNow] = useState<number>(Date.now());

  const { joinTable, leaveTable, isConnected } = useWebSocket();

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();

    if (isConnected) {
      joinTable(parseInt(tableId));
    }

    return () => {
      leaveTable(parseInt(tableId));
    };
  }, [tableId, restaurantId, isConnected, joinTable, leaveTable]);

  // Fallback polling: refresh orders every 2 seconds only if WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        fetchOrders();
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

  const fetchMenuItems = async () => {
    try {
      const data = await apiFetch<{data: MenuItem[]}>(`simple-auth/menu-items?restaurant_id=${restaurantId}`);
      // Show all menu items for the selected restaurant
      setMenuItems(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]); // Set empty array on error
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiFetch<{data: Order[]}>(`simple-auth/orders?restaurant_id=${restaurantId}`);
      setOrders(data.data || []);
      // Timer management is handled by backend
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
    }
  };

  // WebSocket event handlers
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
    menuItem?: MenuItem; menu_item?: MenuItem;
  };
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

  const handleOrderCreated = (event: OrderEventT) => {
    console.log('📢 Order created event received:', event);
    const ord = normalizeOrder(event.order);
    if (ord.tableSection === parseInt(tableId)) {
      setOrders((prev) => {
        if (prev.some((o) => o.id === ord.id)) return prev.map((o) => (o.id === ord.id ? ord : o));
        return [...prev, ord];
      });
      fetchOrders();
    }
  };

  const handleOrderUpdated = (event: OrderEventT) => {
    console.log('📢 Order updated event received:', event);
    const ord = normalizeOrder(event.order);
    if (ord.tableSection === parseInt(tableId)) {
      setOrders((prev) => prev.map((order) => (order.id === ord.id ? ord : order)));
      fetchOrders();
    }
  };

  const handleOrderCompleted = (event: OrderEventT) => {
    console.log('📢 Order completed event received:', event);
    const ord = normalizeOrder(event.order);
    if (ord.tableSection === parseInt(tableId)) {
      setOrders((prev) => prev.map((order) => (order.id === ord.id ? ord : order)));
      fetchOrders();
    }
  };

  const handleOrderDeleted = (event: OrderEventT) => {
    console.log('🗑️ Order deleted event received:', event);
    const ord = normalizeOrder(event.order);
    if (ord.tableSection === parseInt(tableId)) {
      setOrders((prev) => prev.filter((order) => order.id !== ord.id));

      // Clear sent state for this order/batches
      const order = ord;
      const batchNumber = order.batchNumber || 1;
      const key = `${order.menuItemId}-${batchNumber}`;
      setSentOrders((prev) => {
        const newState = { ...prev };
        delete newState[key];
        delete newState[`${order.menuItemId}-1`];
        delete newState[`${order.menuItemId}-2`];
        delete newState[`${order.menuItemId}-3`];
        return newState;
      });
    }
    // Final safeguard
    fetchOrders();
  };

  const handleAllOrdersDeleted = () => {
    console.log('🗑️ All orders deleted event received');
    setOrders([]);
    // Timer management handled by backend
  };

  const handleTimerStarted = (event: TimerEventT) => {
    console.log('⏰ Timer started event received:', event);
    const ord = normalizeOrder(event.order);
    if (ord.tableSection === parseInt(tableId)) {
      fetchOrders();
    }
  };

  const handleTimerExpired = (event: TimerEventT) => {
    console.log('⏰ Timer expired event received:', event);
    const ord = normalizeOrder(event.order);
    if (ord.tableSection === parseInt(tableId)) {
      fetchOrders();
    }
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

  const getBatchSize = (menuItem: MenuItem, batchNumber: number) => {
    switch (batchNumber) {
      case 1:
        return menuItem.batchBreakfast;
      case 2:
        return menuItem.batchLunch;
      case 3:
        return menuItem.batchDinner;
      default:
        return menuItem.batchBreakfast;
    }
  };

  const getBatchNumberFromSize = (menuItem: MenuItem, batchSizeCount: number) => {
    if (batchSizeCount === menuItem.batchBreakfast) return 1;
    if (batchSizeCount === menuItem.batchLunch) return 2;
    if (batchSizeCount === menuItem.batchDinner) return 3;
    return 1;
  };

  const normalizeOrder = (o: BackendOrder | TimerEventT['order']) => {
    const menuItem = o.menuItem || o.menu_item || undefined;
    return {
      id: o.id,
      tableSection: o.tableSection ?? o.table_section!,
      menuItemId: o.menuItemId ?? o.menu_item_id ?? (menuItem ? (menuItem as MenuItem).id : undefined),
      batchSize: o.batchSize ?? o.batch_size!,
      batchNumber: o.batchNumber ?? o.batch_number ?? 1,
      status: o.status,
      timerStart: o.timerStart ?? o.timer_start,
      timerEnd: o.timerEnd ?? o.timer_end,
      completedAt: o.completedAt ?? o.completed_at,
      createdAt: o.createdAt ?? o.created_at,
      updatedAt: o.updatedAt ?? o.updated_at,
      menuItem: menuItem || {
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
      },
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

  const getBatchName = (batchNumber: number) => {
    switch (batchNumber) {
      case 1:
        return 'Breakfast';
      case 2:
        return 'Lunch';
      case 3:
        return 'Dinner';
      default:
        return 'Batch';
    }
  };

  const createOrder = async (menuItemId: number, batchNumber: number) => {
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;
    const batchSize = getBatchSize(menuItem, batchNumber);
    try {
      await apiFetch('simple-auth/orders', {
        method: 'POST',
        body: JSON.stringify({
          tableSection: parseInt(tableId),
          menuItemId: menuItemId,
          batchSize: batchSize,
          batchNumber: batchNumber,
          restaurantId: parseInt(restaurantId),
        }),
      });
      // UI updates via WebSocket
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const deleteOrder = async (orderId: number, menuItemId: number, batchNumber: number) => {
    try {
      await apiFetch(`simple-auth/orders/${orderId}`, {
        method: 'DELETE',
      });

      const key = `${menuItemId}-${batchNumber}`;
      setSentOrders((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      console.log('🗑️ Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const deleteOrderByBatch = async (menuItem: MenuItem, batchNumber: number) => {
    const batchSizeCount = getBatchSize(menuItem, batchNumber);
    const key = `${menuItem.id}-${batchNumber}`;

    setSentOrders((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const current = await findOrderFor(menuItem.id, batchSizeCount);
    if (current) {
      await deleteOrder(current.id, menuItem.id, current.batchNumber || 1);
    }
  };

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const findOrderFor = async (menuItemId: number, batchSizeCount: number): Promise<Order | null> => {
    const table = parseInt(tableId);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const resp = await fetch(`${apiUrl}/api/orders?restaurant_id=${restaurantId}`);
        const json = await resp.json();
        const list: BackendOrder[] = Array.isArray(json.data) ? (json.data as BackendOrder[]) : [];
        const normalized: Order[] = list.map(normalizeOrder);
        const found = normalized.find(
          (o) => o.tableSection === table && o.menuItemId === menuItemId && o.batchSize === batchSizeCount
        );
        if (found) return found;
      } catch {}
      await sleep(250);
    }
    return null;
  };

  const deleteAllOrders = async () => {
    if (!confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🗑️ All orders deleted successfully:', result);
        // Orders will be cleared via WebSocket event
      } else {
        alert('Failed to delete all orders');
      }
    } catch (error) {
      console.error('Error deleting all orders:', error);
      alert('Error deleting all orders');
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
              Table Section
            </h1>
            <p className="text-lg text-muted-foreground">
              Current Time: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(menuItems || []).map((item) => (
            <Card key={item.id} className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-center leading-tight">
                  {item.itemTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((batchNumber) => {
                  const order = orders.find((o) => o.menuItemId === item.id && o.batchNumber === batchNumber);
                  const isSent = Boolean(order);

                  return (
                    <div key={batchNumber} className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => createOrder(item.id, batchNumber)}
                        disabled={isSent}
                        variant="outline"
                        size="sm"
                      >
                        {isSent
                          ? (() => {
                              if (order) {
                                if (order.status === 'cooking') {
                                  const remaining = getRemainingTime(order);
                                  if (remaining !== null) return `⏰ ${formatTime(remaining)}`;
                                  return `Timer activated`;
                                }
                                if (order.status === 'pending') return `⏳ Pending`;
                                if (order.status === 'timer_expired') return `🔴 Timer Expired`;
                                if (order.status === 'ready') return `✅ Ready!`;
                              }
                              return `Batch ${batchNumber} - Waiting`;
                            })()
                          : `Batch ${batchNumber}`}
                      </Button>

                      {order && (
                        <Button
                          onClick={() => deleteOrder(order.id, item.id, order.batchNumber || 1)}
                          variant="destructive"
                          size="sm"
                          title="Delete order"
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Current Orders
            </h2>
            {orders.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    🗑️ Delete All Orders
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all orders.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllOrders}>
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          {orders.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">No orders yet</p>
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
                        <Badge variant="secondary">
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
                          {order.status === 'timer_expired' && (
                            <Button
                              onClick={() => deleteOrder(order.id, order.menuItem?.id || 0, order.batchNumber || 1)}
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

        <div className="mt-8 text-center">
          <Link href="/">
            <Button size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TableSection() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-2xl text-muted-foreground">Loading...</p>
        </div>
      }>
        <TableSectionContent />
      </Suspense>
    </ProtectedRoute>
  );
}
