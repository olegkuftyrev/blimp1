'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';

interface Order {
  id: number;
  tableSection: number;
  menuItemId: number;
  batchSize: number;
  status: string;
  timerStart: string | null;
  timerEnd: string | null;
  completedAt: string | null;
  menuItem: {
    id: number;
    itemTitle: string;
    cookingTimeBatch1: number;
    cookingTimeBatch2: number;
    cookingTimeBatch3: number;
  };
}

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState<{[key: number]: {remaining: number, interval: NodeJS.Timeout}}>({});
  
  const { isConnected, joinKitchen, leaveKitchen } = useWebSocket();

  useEffect(() => {
    fetchOrders();
    // Clear all timers on unmount
    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer.interval));
    };
  }, []);

  // WebSocket connection management
  useEffect(() => {
    if (isConnected) {
      joinKitchen();
    }
    
    return () => {
      leaveKitchen();
    };
  }, [isConnected, joinKitchen, leaveKitchen]);

  // WebSocket event handlers
  useOrderEvents(
    // onOrderCreated
    (event) => {
      console.log('New order created:', event.order);
      fetchOrders(); // Refresh orders list
    },
    // onOrderUpdated
    (event) => {
      console.log('Order updated:', event.order);
      fetchOrders(); // Refresh orders list
    },
    // onOrderCompleted
    (event) => {
      console.log('Order completed:', event.order);
      fetchOrders(); // Refresh orders list
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
      fetchOrders(); // Refresh orders list
    },
    // onTimerExpired
    (event) => {
      console.log('Timer expired for order:', event.order.id);
      fetchOrders(); // Refresh orders list
    }
  );

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders`);
      const data = await response.json();
      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getCookingTime = (order: Order) => {
    // Determine which batch this order belongs to based on batch size
    const menuItem = order.menuItem;
    if (order.batchSize === menuItem.cookingTimeBatch1) return menuItem.cookingTimeBatch1;
    if (order.batchSize === menuItem.cookingTimeBatch2) return menuItem.cookingTimeBatch2;
    if (order.batchSize === menuItem.cookingTimeBatch3) return menuItem.cookingTimeBatch3;
    // Default to batch 1 if no match
    return menuItem.cookingTimeBatch1;
  };

  const startTimer = async (orderId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/kitchen/orders/${orderId}/start-timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const cookingTimeMinutes = getCookingTime(order);
          const remainingSeconds = cookingTimeMinutes * 60;
          
          // Clear existing timer if any
          if (timers[orderId]) {
            clearInterval(timers[orderId].interval);
          }
          
          // Start new timer
          const interval = setInterval(() => {
            setTimers(prev => {
              const current = prev[orderId];
              if (!current) return prev;
              
              const newRemaining = current.remaining - 1;
              if (newRemaining <= 0) {
                clearInterval(interval);
                // Timer expired - update order status
                fetchOrders();
                const newTimers = { ...prev };
                delete newTimers[orderId];
                return newTimers;
              }
              
              return {
                ...prev,
                [orderId]: { ...current, remaining: newRemaining }
              };
            });
          }, 1000);
          
          setTimers(prev => ({
            ...prev,
            [orderId]: { remaining: remainingSeconds, interval }
          }));
        }
        
        fetchOrders(); // Refresh orders
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
        fetchOrders(); // Refresh orders
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
        // Clear timer if it exists
        if (timers[orderId]) {
          clearInterval(timers[orderId].interval);
          setTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[orderId];
            return newTimers;
          });
        }
        fetchOrders(); // Refresh orders
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
                      {order.status === 'cooking' && timers[order.id] ? (
                        <div className="text-blue-600 font-medium">
                          ⏰ {formatTime(timers[order.id].remaining)}
                        </div>
                      ) : order.status === 'cooking' ? (
                        <div className="text-blue-600 font-medium">Running...</div>
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
          <a 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg text-lg font-medium transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
