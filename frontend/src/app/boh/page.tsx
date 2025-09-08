'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import { Box, Heading, HStack, Status, Badge, Table, Button,  Text, VStack } from "@chakra-ui/react";

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

export default function BOHPage() {
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
  }, [isConnected, joinKitchen, leaveKitchen]);

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
      const response = await fetch(`${apiUrl}/api/orders`);
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

  const handleOrderCreated = (event: OrderEventT) => {
    console.log('📢 Order created event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev.map((o) => (o.id === order.id ? order : o));
      return [...prev, order];
    });
  };

  const handleOrderUpdated = (event: OrderEventT) => {
    console.log('📢 Order updated event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
  };

  const handleOrderCompleted = (event: OrderEventT) => {
    console.log('📢 Order completed event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
  };

  const handleOrderDeleted = (event: OrderEventT) => {
    console.log('🗑️ Order deleted event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
  };

  const handleAllOrdersDeleted = () => {
    console.log('🗑️ All orders deleted event received');
    setOrders([]);
  };

  const handleTimerStarted = (event: TimerEventT) => {
    console.log('⏰ Timer started event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
  };

  const handleTimerExpired = (event: TimerEventT) => {
    console.log('⏰ Timer expired event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
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
    menuItem?: Order['menuItem'];
    menu_item?: Order['menuItem'];
  };

  const normalizeOrder = (o: BackendOrder | TimerEventT['order']) => {
    const menuItem = o.menuItem || o.menu_item || undefined;
    return {
      id: o.id,
      tableSection: o.tableSection ?? o.table_section,
      menuItemId: o.menuItemId ?? o.menu_item_id ?? (menuItem ? menuItem.id : undefined),
      batchSize: o.batchSize ?? o.batch_size,
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

  const startTimer = async (orderId: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const cookingTime = getCookingTime(order);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/kitchen/orders/${orderId}/start-timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookingTime }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to start timer: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Error starting timer');
    }
  };

  const extendTimer = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/kitchen/orders/${orderId}/extend-timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to extend timer: ${error.message || 'Unknown error'}`);
      } else {
        console.log('⏰ Timer extended by 10 seconds');
      }
    } catch (error) {
      console.error('Error extending timer:', error);
      alert('Error extending timer');
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to complete order: ${error.message || 'Unknown error'}`);
      } else {
        console.log('✅ Order completed and deleted successfully');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const handleAction = (orderId: number, action: string) => {
    if (action === 'start timer') {
      startTimer(orderId);
    } else if (action === 'extend timer') {
      extendTimer(orderId);
    } else if (action === 'complete') {
      completeOrder(orderId);
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
          <Heading as="h1" size="3xl" color="gray.800" className="text-4xl font-bold text-gray-800">
            Back of House (BOH)
          </Heading>
          <HStack gap={2} className="flex items-center space-x-2">
            <Status.Root colorPalette={isConnected ? "green" : "red"}>
              <Status.Indicator />
            </Status.Root>
            <Text fontSize="sm" color="gray.600" className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </HStack>
        </HStack>
        
        <Box bg="white" borderRadius="lg" shadow="lg" overflow="hidden" className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Table.Root size="sm" striped>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Item</Table.ColumnHeader>
                <Table.ColumnHeader>Table</Table.ColumnHeader>
                <Table.ColumnHeader>Batch Size</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Time Remaining</Table.ColumnHeader>
                <Table.ColumnHeader>Action</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orders.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py={8}>
                    <Text color="gray.500">No orders available</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                orders.map((order) => {
                  const remaining = getRemainingTime(order);
                  return (
                    <Table.Row key={order.id} _hover={{ bg: "gray.50" }}>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                          {order.menuItem?.itemTitle || 'Unknown Item'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="gray.900">
                          Table {order.tableSection}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="gray.900">
                          {order.batchSize}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorScheme={
                            order.status === 'pending' ? 'yellow' :
                            order.status === 'cooking' ? 'blue' :
                            order.status === 'timer_expired' ? 'red' : 'gray'
                          }
                          size="sm"
                        >
                          {order.status === 'timer_expired' ? 'Saucing!' : order.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="gray.900" fontFamily="mono">
                          {remaining !== null ? formatTime(remaining) : '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
                          {order.status === 'pending' ? (
                             <Badge 
                                    variant="solid"  
                                     size="lg"
                                    onClick={() => handleAction(order.id, 'start timer')} 
                                    colorPalette="green"
                              >
                              Start Timer
                            </Badge>
                          ) : order.status === 'timer_expired' ? (
                            <>
                              <Badge
                                size="sm"
                                colorScheme="orange"
                                onClick={() => handleAction(order.id, 'extend timer')}
                              >
                                +10s
                              </Badge>
                              <Badge
                                 variant="solid"  
                                  size="lg"
                                 colorScheme="green"
                                onClick={() => handleAction(order.id, 'complete')}
                              >
                                Complete
                              </Badge>
                            </>
                          ) : order.status === 'cooking' ? (
                            <Badge
                            variant="solid"  
                              size="lg"
                              colorScheme="green"
                              onClick={() => handleAction(order.id, 'complete')}
                            >
                              Complete
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.400">No action</Text>
                          )}
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Box>
  );
}
