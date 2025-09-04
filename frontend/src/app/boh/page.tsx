'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';

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

  // Fallback polling: refresh orders every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
  const handleOrderCreated = (event: any) => {
    console.log('📢 Order created event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev.map((o) => (o.id === order.id ? order : o));
      return [...prev, order];
    });
    fetchOrders();
  };

  const handleOrderUpdated = (event: any) => {
    console.log('📢 Order updated event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    fetchOrders();
  };

  const handleOrderCompleted = (event: any) => {
    console.log('📢 Order completed event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    fetchOrders();
  };

  const handleOrderDeleted = (event: any) => {
    console.log('🗑️ Order deleted event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    fetchOrders();
  };

  const handleAllOrdersDeleted = (_event: any) => {
    console.log('🗑️ All orders deleted event received');
    setOrders([]);
  };

  const handleTimerStarted = (event: any) => {
    console.log('⏰ Timer started event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    fetchOrders();
  };

  const handleTimerExpired = (event: any) => {
    console.log('⏰ Timer expired event received:', event);
    const order = normalizeOrder(event.order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
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

  const normalizeOrder = (o: any) => {
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
      menuItem,
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Back of House (BOH)
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Table</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Batch Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time Remaining</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders available
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const remaining = getRemainingTime(order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {order.menuItem?.itemTitle || 'Unknown Item'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Table {order.tableSection}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.batchSize}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                          order.status === 'pending' ? 'bg-yellow-500' :
                          order.status === 'cooking' ? 'bg-blue-500' :
                          order.status === 'timer_expired' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {remaining !== null ? formatTime(remaining) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {order.status === 'pending' ? (
                            <button
                              onClick={() => handleAction(order.id, 'start timer')}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                            >
                              Start Timer
                            </button>
                          ) : order.status === 'timer_expired' ? (
                            <>
                              <button
                                onClick={() => handleAction(order.id, 'extend timer')}
                                className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                              >
                                +10s
                              </button>
                              <button
                                onClick={() => handleAction(order.id, 'complete')}
                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                              >
                                Complete
                              </button>
                            </>
                          ) : order.status === 'cooking' ? (
                            <button
                              onClick={() => handleAction(order.id, 'complete')}
                              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                            >
                              Complete
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">No action</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
