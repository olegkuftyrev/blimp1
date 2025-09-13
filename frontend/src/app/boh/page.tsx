'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import { Box, Heading, HStack, Status, Badge, Table, Button, Text, VStack } from "@chakra-ui/react";

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
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setNow] = useState<number>(Date.now());
  const { joinKitchen, leaveKitchen, isConnected } = useWebSocket();

  useEffect(() => {
    fetchOrders();
    
    // Join kitchen room when component mounts
    if (isConnected) {
      joinKitchen();
    }
    
    // Cleanup: leave kitchen room when component unmounts
    return () => {
      leaveKitchen();
    };
  }, [restaurantId, isConnected, joinKitchen, leaveKitchen]);

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

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders?restaurant_id=${restaurantId}`);
      const data = await response.json();
      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const cookingTimeMinutes = getCookingTime(order);
      
      const response = await fetch(`${apiUrl}/api/kitchen/orders/${orderId}/start-timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cookingTime: cookingTimeMinutes
        }),
      });
      if (!response.ok) {
        alert('Failed to start timer');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Error starting timer');
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/kitchen/orders/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        alert('Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <Text fontSize="2xl" color="gray.600">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" p={8} className="min-h-screen bg-gray-50 p-8">
      <Box maxW="6xl" mx="auto" className="max-w-6xl mx-auto">
        <HStack justify="space-between" mb={8} className="flex justify-between items-center mb-8">
          <VStack align="start" gap={2}>
            <Heading as="h1" size="3xl" color="gray.800" className="text-4xl font-bold text-gray-800">
              BOH Management
            </Heading>
            <Text fontSize="lg" color="gray.600" className="text-lg text-gray-600">
              Restaurant ID: {restaurantId} | Current Time: {new Date().toLocaleTimeString()}
            </Text>
          </VStack>
          <HStack gap={2} className="flex items-center space-x-2">
            <Status.Root colorPalette={isConnected ? "green" : "red"}>
              <Status.Indicator />
            </Status.Root>
            <Text fontSize="sm" color="gray.600" className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </HStack>
        </HStack>

        {orders.length === 0 ? (
          <Box bg="white" borderRadius="lg" shadow="lg" p={8} textAlign="center" className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Text color="gray.600" fontSize="lg" className="text-gray-600 text-lg">No orders in queue</Text>
          </Box>
        ) : (
          <Box bg="white" borderRadius="lg" shadow="lg" overflow="hidden" className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Table.Root size="sm" striped>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Dish</Table.ColumnHeader>
                  <Table.ColumnHeader>Table</Table.ColumnHeader>
                  <Table.ColumnHeader>Batch Size</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Timer</Table.ColumnHeader>
                  <Table.ColumnHeader>Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.map((order) => (
                  <Table.Row key={order.id} _hover={{ bg: "gray.50" }}>
                    <Table.Cell>
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {order?.menuItem?.itemTitle ?? '—'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.900">Table {order.tableSection}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.900">{order.batchSize}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorScheme={
                          order.status === 'pending' ? 'yellow' :
                          order.status === 'cooking' ? 'blue' :
                          order.status === 'timer_expired' ? 'red' :
                          order.status === 'ready' ? 'green' : 'gray'
                        }
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {order.status === 'cooking' ? (
                        (() => {
                          const remaining = getRemainingTime(order);
                          return remaining !== null ? (
                            <Text color="blue.600" fontWeight="medium">⏰ {formatTime(remaining)}</Text>
                          ) : (
                            <Text color="blue.600" fontWeight="medium">Running...</Text>
                          );
                        })()
                      ) : order.status === 'pending' ? (
                        <Text color="yellow.600" fontWeight="medium">Pending</Text>
                      ) : order.status === 'timer_expired' ? (
                        <Text color="red.600" fontWeight="medium">Expired!</Text>
                      ) : order.status === 'ready' ? (
                        <Text color="green.600" fontWeight="medium">Ready!</Text>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        {order.status === 'pending' && (
                          <Button
                            onClick={() => startTimer(order.id)}
                            colorScheme="blue"
                            variant="solid"
                            size="sm"
                            fontWeight="medium"
                          >
                            Start Timer
                          </Button>
                        )}
                        {order.status === 'cooking' && (
                          <Button
                            onClick={() => completeOrder(order.id)}
                            colorScheme="green"
                            variant="solid"
                            size="sm"
                            fontWeight="medium"
                          >
                            Complete
                          </Button>
                        )}
                        {(order.status === 'timer_expired' || order.status === 'ready') && (
                          <Button
                            onClick={() => deleteOrder(order.id)}
                            colorScheme="red"
                            variant="solid"
                            size="sm"
                            fontWeight="medium"
                          >
                            Delete
                          </Button>
                        )}
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function BOHPage() {
  return (
    <Suspense fallback={
      <Box 
        minH="100vh" 
        bg="gray.50" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <Text fontSize="2xl" color="gray.600">Loading...</Text>
      </Box>
    }>
      <BOHPageContent />
    </Suspense>
  );
}