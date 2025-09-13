'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import { Box, Heading, HStack, Status, Badge, Table, Button, Text, VStack } from "@chakra-ui/react";
import Link from 'next/link';

interface Order {
  id: number;
  tableSection: number;
  menuItemId: number;
  batchSize: number;
  batchNumber?: number;
  status: string;
  timerStart?: string | null;
  timerEnd?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  menuItem: {
    id: number;
    itemTitle: string;
    cookingTimeBatch1: number;
    cookingTimeBatch2: number;
    cookingTimeBatch3: number;
  };
}

function KitchenContent() {
  
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant_id') || '1';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setNow] = useState<number>(Date.now());
  
  const { isConnected, joinKitchen, leaveKitchen } = useWebSocket();

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  // WebSocket connection management
  useEffect(() => {
    if (isConnected) {
      joinKitchen();
    }
    
    return () => {
      leaveKitchen();
    };
  }, [isConnected, joinKitchen, leaveKitchen]);

  // Live tick to update remaining time while any order is cooking
  useEffect(() => {
    const hasCooking = orders.some((o) => o.status === 'cooking' && o.timerEnd);
    if (!hasCooking) return;

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [orders]);

  // WebSocket event handlers
  useOrderEvents(
    // onOrderCreated
    (event) => {
      console.log('New order created:', event.order);
      const newOrder: Order = {
        id: event.order.id,
        tableSection: event.order.tableSection,
        menuItemId: event.order.menuItemId,
        batchSize: event.order.batchSize,
        batchNumber: (event.order as any).batchNumber || 1,
        status: event.order.status,
        timerStart: event.order.timerStart || null,
        timerEnd: event.order.timerEnd || null,
        completedAt: event.order.completedAt || null,
        createdAt: event.order.createdAt,
        updatedAt: event.order.updatedAt,
        menuItem: {
          id: event.order.menuItem.id,
          itemTitle: event.order.menuItem.itemTitle,
          cookingTimeBatch1: event.order.menuItem.cookingTimeBatch1,
          cookingTimeBatch2: event.order.menuItem.cookingTimeBatch2,
          cookingTimeBatch3: event.order.menuItem.cookingTimeBatch3,
        }
      };
      setOrders(prev => [...prev, newOrder]);
    },
    // onOrderUpdated
    (event) => {
      console.log('Order updated:', event.order);
      const updatedOrder: Order = {
        id: event.order.id,
        tableSection: event.order.tableSection,
        menuItemId: event.order.menuItemId,
        batchSize: event.order.batchSize,
        batchNumber: (event.order as any).batchNumber || 1,
        status: event.order.status,
        timerStart: event.order.timerStart || null,
        timerEnd: event.order.timerEnd || null,
        completedAt: event.order.completedAt || null,
        createdAt: event.order.createdAt,
        updatedAt: event.order.updatedAt,
        menuItem: {
          id: event.order.menuItem.id,
          itemTitle: event.order.menuItem.itemTitle,
          cookingTimeBatch1: event.order.menuItem.cookingTimeBatch1,
          cookingTimeBatch2: event.order.menuItem.cookingTimeBatch2,
          cookingTimeBatch3: event.order.menuItem.cookingTimeBatch3,
        }
      };
      setOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    },
    // onOrderCompleted
    (event) => {
      console.log('Order completed:', event.order);
      const completedOrder: Order = {
        id: event.order.id,
        tableSection: event.order.tableSection,
        menuItemId: event.order.menuItemId,
        batchSize: event.order.batchSize,
        batchNumber: (event.order as any).batchNumber || 1,
        status: event.order.status,
        timerStart: event.order.timerStart || null,
        timerEnd: event.order.timerEnd || null,
        completedAt: event.order.completedAt || null,
        createdAt: event.order.createdAt,
        updatedAt: event.order.updatedAt,
        menuItem: {
          id: event.order.menuItem.id,
          itemTitle: event.order.menuItem.itemTitle,
          cookingTimeBatch1: event.order.menuItem.cookingTimeBatch1,
          cookingTimeBatch2: event.order.menuItem.cookingTimeBatch2,
          cookingTimeBatch3: event.order.menuItem.cookingTimeBatch3,
        }
      };
      setOrders(prev => prev.map(order => order.id === completedOrder.id ? completedOrder : order));
    },
    // onAllOrdersDeleted
    (event) => {
      console.log('All orders deleted');
      setOrders([]);
    }
  );

  useTimerEvents(
    // onTimerStarted
    (event) => {
      console.log('Timer started for order:', event.order.id);
      const updatedOrder: Order = {
        id: event.order.id,
        tableSection: event.order.tableSection,
        menuItemId: event.order.menuItemId,
        batchSize: event.order.batchSize,
        batchNumber: 1, // Timer events don't include batchNumber, default to 1
        status: event.order.status,
        timerStart: event.order.timerStart || null,
        timerEnd: event.order.timerEnd || null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        menuItem: {
          id: event.order.menuItem.id,
          itemTitle: event.order.menuItem.itemTitle,
          cookingTimeBatch1: 0,
          cookingTimeBatch2: 0,
          cookingTimeBatch3: 0,
        }
      };
      setOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    },
    // onTimerExpired
    (event) => {
      console.log('Timer expired for order:', event.order.id);
      setOrders(prev => prev.map(order => 
        order.id === event.order.id 
          ? { ...order, status: 'timer_expired' }
          : order
      ));
    }
  );

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders?restaurant_id=${restaurantId}`);
      const data = await response.json();
      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getCookingTime = (order: Order) => {
    // Determine which batch this order belongs to based on batch number
    const menuItem = order.menuItem;
    const batchNumber = order.batchNumber || 1;
    if (batchNumber === 1) return menuItem.cookingTimeBatch1;
    if (batchNumber === 2) return menuItem.cookingTimeBatch2;
    if (batchNumber === 3) return menuItem.cookingTimeBatch3;
    // Default to batch 1 if no match
    return menuItem.cookingTimeBatch1;
  };

  const getRemainingTime = (order: Order) => {
    if (order.status !== 'cooking' || !order.timerEnd) return null;
    
    const now = new Date().getTime();
    const endTime = new Date(order.timerEnd).getTime();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    
    return remaining;
  };

  const startTimer = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
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
        })
      });
      
      if (response.ok) {
        // Timer will be updated via WebSocket events
        console.log('Timer started successfully');
      } else {
        alert('Failed to start timer');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Error starting timer');
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/kitchen/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Order completed!');
        // Order will be updated via WebSocket events
      } else {
        alert('Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Order will be updated via WebSocket events
        console.log('Order deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'cooking': return 'bg-blue-500';
      case 'timer_expired': return 'bg-red-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'cooking': return 'Cooking';
      case 'timer_expired': return 'Timer Expired';
      case 'ready': return 'Ready';
      default: return status;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Kitchen Tablet
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center text-2xl text-gray-600">
            No orders yet
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dish</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Batch Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {order.menuItem.itemTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.batchSize}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.status === 'cooking' ? (
                        (() => {
                          const remaining = getRemainingTime(order);
                          return remaining !== null ? (
                            <div className="text-blue-600 font-medium">
                              ⏰ {formatTime(remaining)}
                            </div>
                          ) : (
                            <div className="text-blue-600 font-medium">Running...</div>
                          );
                        })()
                      ) : order.status === 'pending' ? (
                        <span className="text-yellow-600 font-medium">Pending</span>
                      ) : order.status === 'timer_expired' ? (
                        <span className="text-red-600 font-medium">Expired!</span>
                      ) : order.status === 'ready' ? (
                        <span className="text-green-600 font-medium">Ready!</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => startTimer(order.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                          >
                            Start Timer
                          </button>
                        )}
                        
                        {order.status === 'timer_expired' && (
                          <button
                            onClick={() => completeOrder(order.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                          >
                            Done
                          </button>
                        )}
                        
                        {/* Delete button always available */}
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg text-lg font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Kitchen() {
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
      <KitchenContent />
    </Suspense>
  );
}
