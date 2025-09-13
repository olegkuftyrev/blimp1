'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import Link from 'next/link';
import { Box, Heading, HStack, Status, Badge, Table, Button, Text, VStack, SimpleGrid, Card } from "@chakra-ui/react";

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/menu-items?restaurant_id=${restaurantId}`);
      const data = await response.json();

      // Show all menu items for the selected restaurant
      setMenuItems(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders?restaurant_id=${restaurantId}`);
      const data = await response.json();
      setOrders(data.data);
      // Timer management is handled by backend
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableSection: parseInt(tableId),
          menuItemId: menuItemId,
          batchSize: batchSize,
          batchNumber: batchNumber,
          restaurantId: parseInt(restaurantId),
        }),
      });
      if (!response.ok) alert('Failed to create order');
      // UI updates via WebSocket
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const deleteOrder = async (orderId: number, menuItemId: number, batchNumber: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const key = `${menuItemId}-${batchNumber}`;
        setSentOrders((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });

        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        console.log('🗑️ Order deleted successfully');
      }
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
              Table Section
            </Heading>
            <Text fontSize="lg" color="gray.600" className="text-lg text-gray-600">
              Current Time: {new Date().toLocaleTimeString()}
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

        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 4 }} 
          gap={4}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {menuItems.map((item) => (
            <Card.Root key={item.id} bg="white" borderRadius="lg" shadow="lg" p={6} className="bg-white rounded-lg shadow-lg p-6">
              <Card.Body>
                <Box h={12} display="flex" alignItems="center" justifyContent="center" mb={1} className="h-12 flex items-center justify-center mb-1">
                  <Heading as="h3" size="lg" textAlign="center" color="gray.800" className="text-xl font-semibold text-center text-gray-800 leading-tight">
                    {item.itemTitle}
                  </Heading>
                </Box>

                <VStack gap={2} className="space-y-2">
                  {[1, 2, 3].map((batchNumber) => {
                    const order = orders.find((o) => o.menuItemId === item.id && o.batchNumber === batchNumber);
                    const isSent = Boolean(order);

                    return (
                      <HStack key={batchNumber} gap={2} className="flex space-x-2">
                        <Button
                          flex={1}
                          onClick={() => createOrder(item.id, batchNumber)}
                          disabled={isSent}
                          colorScheme={
                            isSent
                              ? (() => {
                                  if (order) {
                                    if (order.status === 'cooking') return 'blue';
                                    if (order.status === 'pending') return 'yellow';
                                    if (order.status === 'timer_expired') return 'red';
                                    if (order.status === 'ready') return 'green';
                                  }
                                  return 'yellow';
                                })()
                              : 'gray'
                          }
                          variant="solid"
                          size="md"
                          fontWeight="medium"
                          _disabled={{ cursor: 'not-allowed' }}
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
                            colorScheme="red"
                            variant="solid"
                            size="md"
                            fontWeight="medium"
                            title="Delete order"
                          >
                            🗑️
                          </Button>
                        )}
                      </HStack>
                    );
                  })}
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* Orders Section */}
        <Box mt={12} className="mt-12">
          <HStack justify="space-between" mb={6} className="flex justify-between items-center mb-6">
            <Heading as="h2" size="2xl" color="gray.800" className="text-2xl font-bold text-gray-800">
              Current Orders
            </Heading>
            {orders.length > 0 && (
              <Button
                onClick={deleteAllOrders}
                colorScheme="red"
                variant="solid"
                size="sm"
                fontWeight="medium"
              >
                🗑️ Delete All Orders
              </Button>
            )}
          </HStack>
          {orders.length === 0 ? (
            <Box bg="white" borderRadius="lg" shadow="lg" p={8} textAlign="center" className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Text color="gray.600" fontSize="lg" className="text-gray-600 text-lg">No orders yet</Text>
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
                            {order.status === 'timer_expired' && (
                              <Button
                                onClick={() => deleteOrder(order.id, order.menuItem?.id || 0, order.batchNumber || 1)}
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

        <Box mt={8} textAlign="center" className="mt-8 text-center">
          <Link href="/">
            <Button
              colorScheme="gray"
              variant="solid"
              size="lg"
              fontWeight="medium"
            >
              Back to Home
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default function TableSection() {
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
      <TableSectionContent />
    </Suspense>
  );
}
