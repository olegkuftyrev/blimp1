'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';

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

export default function TableSection() {
  const params = useParams();
  const tableId = params.id as string;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [processingOrders, setProcessingOrders] = useState<{[key: string]: boolean}>({});
  const [sentOrders, setSentOrders] = useState<{[key: string]: boolean}>({});
  const [orderTimers, setOrderTimers] = useState<{[key: number]: {remaining: number, interval: NodeJS.Timeout}}>({});
  const { joinTable, leaveTable, isConnected } = useWebSocket();

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    
    // Join table room when component mounts
    if (isConnected) {
      joinTable(parseInt(tableId));
    }
    
    // Cleanup: leave table room when component unmounts
    return () => {
      leaveTable(parseInt(tableId));
      // Clear all timers on unmount
      Object.values(orderTimers).forEach(timer => clearInterval(timer.interval));
    };
  }, [tableId, isConnected, joinTable, leaveTable]);

  const fetchMenuItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/menu-items`);
      const data = await response.json();
      setMenuItems(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders`);
      const data = await response.json();
      setOrders(data.data);
      
      // Start timers for cooking orders
      data.data.forEach((order: any) => {
        if (order.status === 'cooking' && order.tableSection === parseInt(tableId)) {
          startOrderTimer(order);
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // WebSocket event handlers
  const handleOrderCreated = (event: any) => {
    console.log('📢 Order created event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      setOrders(prev => [...prev, event.order]);
    }
  };

  const handleOrderUpdated = (event: any) => {
    console.log('📢 Order updated event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      setOrders(prev => prev.map(order => 
        order.id === event.order.id ? event.order : order
      ));
      
      // Start timer if order status changed to cooking
      if (event.order.status === 'cooking') {
        startOrderTimer(event.order);
      }
    }
  };

  const handleOrderCompleted = (event: any) => {
    console.log('📢 Order completed event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      setOrders(prev => prev.map(order => 
        order.id === event.order.id ? event.order : order
      ));
      // Clear timer when order is completed
      if (orderTimers[event.order.id]) {
        clearInterval(orderTimers[event.order.id].interval);
        setOrderTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[event.order.id];
          return newTimers;
        });
      }
    }
  };

  const handleOrderDeleted = (event: any) => {
    console.log('🗑️ Order deleted event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      // Remove order from local state
      setOrders(prev => prev.filter(order => order.id !== event.order.id));
      
      // Clear sent state for this order
      const order = event.order;
      const menuItem = menuItems.find(item => item.id === order.menuItemId);
      if (menuItem) {
        const batchNumber = getBatchNumberFromSize(menuItem, order.batchSize);
        const key = `${order.menuItemId}-${batchNumber}`;
        setSentOrders(prev => {
          const newState = { ...prev };
          // Clear precise key
          delete newState[key];
          // Extra safety: clear all batch keys for this menu item to ensure reset
          delete newState[`${order.menuItemId}-1`];
          delete newState[`${order.menuItemId}-2`];
          delete newState[`${order.menuItemId}-3`];
          return newState;
        });
      }
      
      // Clear timer if exists
      if (orderTimers[event.order.id]) {
        clearInterval(orderTimers[event.order.id].interval);
        setOrderTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[event.order.id];
          return newTimers;
        });
      }
    }
  };

  const handleTimerStarted = (event: any) => {
    console.log('⏰ Timer started event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      startOrderTimer(event.order);
    }
  };

  const handleTimerExpired = (event: any) => {
    console.log('⏰ Timer expired event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      // Clear timer when it expires
      if (orderTimers[event.order.id]) {
        clearInterval(orderTimers[event.order.id].interval);
        setOrderTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[event.order.id];
          return newTimers;
        });
      }
    }
  };

  const handleAllOrdersDeleted = (event: any) => {
    console.log('🗑️ All orders deleted event received:', event);
    setOrders([]);
    // Clear all timers
    Object.values(orderTimers).forEach(timer => clearInterval(timer.interval));
    setOrderTimers({});
    // Reset all sent states so all batch buttons return to default
    setSentOrders({});
  };

  // Subscribe to WebSocket events
  useOrderEvents(handleOrderCreated, handleOrderUpdated, handleOrderCompleted, handleOrderDeleted, handleAllOrdersDeleted);
  useTimerEvents(handleTimerStarted, handleTimerExpired);

  const getRecommendedBatch = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Breakfast: 5:00 - 10:00
    if (hour >= 5 && hour < 10) {
      return 1; // Batch 1
    }
    // Lunch: 11:00 - 13:00
    else if (hour >= 11 && hour < 13) {
      return 2; // Batch 2
    }
    // Dinner: 17:00 - 19:00
    else if (hour >= 17 && hour < 19) {
      return 3; // Batch 3
    }
    // Downtime: all other times
    else {
      return 1; // Default to Batch 1
    }
  };

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

  // Derive batchNumber (1|2|3) from an order's batchSize count for a given menu item
  const getBatchNumberFromSize = (menuItem: MenuItem, batchSizeCount: number) => {
    if (batchSizeCount === menuItem.batchBreakfast) return 1;
    if (batchSizeCount === menuItem.batchLunch) return 2;
    if (batchSizeCount === menuItem.batchDinner) return 3;
    // Fallback to 1
    return 1;
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 10) return 'Breakfast';
    if (hour >= 11 && hour < 13) return 'Lunch';
    if (hour >= 17 && hour < 19) return 'Dinner';
    return 'Downtime';
  };

  const getCookingTime = (order: any) => {
    const menuItem = order.menuItem;
    if (order.batchSize === menuItem.cookingTimeBatch1) return menuItem.cookingTimeBatch1;
    if (order.batchSize === menuItem.cookingTimeBatch2) return menuItem.cookingTimeBatch2;
    if (order.batchSize === menuItem.cookingTimeBatch3) return menuItem.cookingTimeBatch3;
    return menuItem.cookingTimeBatch1;
  };

  const startOrderTimer = (order: any) => {
    // Clear existing timer if any
    if (orderTimers[order.id]) {
      clearInterval(orderTimers[order.id].interval);
    }
    
    // Calculate remaining time based on timerEnd
    let remainingSeconds = 0;
    if (order.timerEnd) {
      const endTime = new Date(order.timerEnd).getTime();
      const now = new Date().getTime();
      remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    } else {
      // Fallback to cooking time if no timerEnd
      const cookingTimeMinutes = getCookingTime(order);
      remainingSeconds = cookingTimeMinutes * 60;
    }
    
    if (remainingSeconds <= 0) {
      return; // Timer already expired
    }
    
    // Start new timer
    const interval = setInterval(() => {
      setOrderTimers(prev => {
        const current = prev[order.id];
        if (!current) return prev;
        
        const newRemaining = current.remaining - 1;
        if (newRemaining <= 0) {
          clearInterval(interval);
          const newTimers = { ...prev };
          delete newTimers[order.id];
          return newTimers;
        }
        
        return {
          ...prev,
          [order.id]: { ...current, remaining: newRemaining }
        };
      });
    }, 1000);
    
    setOrderTimers(prev => ({
      ...prev,
      [order.id]: { remaining: remainingSeconds, interval }
    }));
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
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return;
    
    const key = `${menuItemId}-${batchNumber}`;
    const batchSize = getBatchSize(menuItem, batchNumber);
    
    // Set processing state
    setProcessingOrders(prev => ({ ...prev, [key]: true }));
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableSection: parseInt(tableId),
          menuItemId: menuItemId,
          batchSize: batchSize,
        }),
      });
      
      if (response.ok) {
        const newOrder = await response.json();
        console.log('✅ Order created successfully:', newOrder);
        // Set sent state
        setSentOrders(prev => ({ ...prev, [key]: true }));
        // Order will be added via WebSocket event
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    } finally {
      // Remove processing state immediately
      setProcessingOrders(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const deleteOrder = async (orderId: number, menuItemId: number, batchSizeCount: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Clear sent state for this specific order using derived batchNumber key
        const menuItem = menuItems.find((m) => m.id === menuItemId);
        const batchNumber = menuItem ? getBatchNumberFromSize(menuItem, batchSizeCount) : 1;
        const key = `${menuItemId}-${batchNumber}`;
        setSentOrders(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
        
        // Optimistically remove order from local list so the delete icon disappears immediately
        setOrders(prev => prev.filter(o => o.id !== orderId));

        // Clear timer if exists
        if (orderTimers[orderId]) {
          clearInterval(orderTimers[orderId].interval);
          setOrderTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[orderId];
            return newTimers;
          });
        }
        
        console.log('🗑️ Order deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Delete by batch when we might not yet have the order in local state
  const deleteOrderByBatch = async (menuItem: MenuItem, batchNumber: number) => {
    const batchSizeCount = getBatchSize(menuItem, batchNumber);
    const key = `${menuItem.id}-${batchNumber}`;

    // Optimistically clear "Waiting" immediately
    setSentOrders((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // Resolve order id by querying server with retries to handle race with create
    const current = await findOrderFor(menuItem.id, batchSizeCount);
    if (current) {
      await deleteOrder(current.id, menuItem.id, batchSizeCount);
    }
  };

  // Utility: small delay
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Find order by criteria with short retry loop to handle eventual sync
  const findOrderFor = async (menuItemId: number, batchSizeCount: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    const table = parseInt(tableId);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const resp = await fetch(`${apiUrl}/api/orders`);
        const json = await resp.json();
        const list = Array.isArray(json.data) ? json.data : [];
        const found = list.find(
          (o: any) => o.tableSection === table && o.menuItemId === menuItemId && o.batchSize === batchSizeCount
        );
        if (found) return found;
      } catch {}
      await sleep(250);
    }
    return null as any;
  };

  const deleteAllOrders = async () => {
    if (!confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Table Section {tableId}
            </h1>
            <div className="mt-2 text-lg text-gray-600">
              Current Time: {new Date().toLocaleTimeString()}
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {getCurrentPeriod()} Period
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                {item.itemTitle}
              </h3>
              
              <div className="space-y-3">
                {[1, 2, 3].map((batchNumber) => {
                  const isRecommended = getRecommendedBatch() === batchNumber;
                  const key = `${item.id}-${batchNumber}`;
                  const isProcessing = processingOrders[key];
                  const isSent = sentOrders[key];
                  
                  // Find the order for this menu item and batch
                  const order = orders.find(o => 
                    o.menuItemId === item.id && 
                    o.batchSize === getBatchSize(item, batchNumber)
                  );
                  
                  return (
                    <div key={batchNumber} className="flex space-x-2">
                      <button
                        onClick={() => createOrder(item.id, batchNumber)}
                        disabled={isProcessing || isSent}
                        className={`flex-1 py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
                          isProcessing
                            ? 'bg-blue-500 text-white cursor-not-allowed'
                            : isSent
                              ? (() => {
                                  if (order) {
                                    if (order.status === 'cooking') {
                                      return 'bg-blue-500 text-white cursor-not-allowed';
                                    } else if (order.status === 'pending') {
                                      return 'bg-yellow-500 text-white cursor-not-allowed';
                                    } else if (order.status === 'timer_expired') {
                                      return 'bg-red-500 text-white cursor-not-allowed';
                                    } else if (order.status === 'ready') {
                                      return 'bg-green-500 text-white cursor-not-allowed';
                                    }
                                  }
                                  return 'bg-yellow-500 text-white cursor-not-allowed';
                                })()
                              : isRecommended 
                                ? 'bg-green-500 hover:bg-green-600 text-white ring-2 ring-green-300' 
                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {isProcessing 
                          ? '⏳ Sending...' 
                          : isSent
                            ? (() => {
                                if (order) {
                                  if (order.status === 'cooking' && orderTimers[order.id]) {
                                    return `⏰ ${formatTime(orderTimers[order.id].remaining)}`;
                                  } else if (order.status === 'pending') {
                                    return `⏳ Pending`;
                                  } else if (order.status === 'timer_expired') {
                                    return `🔴 Timer Expired`;
                                  } else if (order.status === 'ready') {
                                    return `✅ Ready!`;
                                  }
                                }
                                return `Batch ${batchNumber} - Waiting`;
                              })()
                            : `${isRecommended ? '⭐ ' : ''}Batch ${batchNumber}`
                        }
                      </button>
                      
                      {/* Delete button - show whenever we've sent an order for this batch; enable once order is synced */}
                      {isSent && (
                        <button
                          onClick={() => deleteOrderByBatch(item, batchNumber)}
                          className={`py-3 px-3 rounded-lg font-medium transition-colors bg-red-500 hover:bg-red-600 text-white`}
                          title="Delete order"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              

            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Current Orders</h2>
            {orders.length > 0 && (
              <button
                onClick={deleteAllOrders}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ Delete All Orders
              </button>
            )}
          </div>
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">No orders yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{order.menuItem.itemTitle}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cooking' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'timer_expired' ? 'bg-red-100 text-red-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Batch Size: {order.batchSize}</p>
                  <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                  {order.timerStart && (
                    <p className="text-sm text-gray-600">
                      Started: {new Date(order.timerStart).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
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
