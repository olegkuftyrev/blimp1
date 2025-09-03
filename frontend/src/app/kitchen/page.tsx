'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchOrders();
    // Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => {
      clearInterval(interval);
      // Clear all timers on unmount
      Object.values(timers).forEach(timer => clearInterval(timer.interval));
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/orders');
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
      const response = await fetch(`http://localhost:3333/api/kitchen/orders/${orderId}/start-timer`, {
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
      const response = await fetch(`http://localhost:3333/api/kitchen/orders/${orderId}/complete`, {
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
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3333/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Order deleted!');
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
      } else {
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
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
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Kitchen Tablet
        </h1>
        
        {orders.length === 0 ? (
          <div className="text-center text-2xl text-gray-600">
            No orders yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {order.menuItem.itemTitle}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p><strong>Table Section:</strong> {order.tableSection}</p>
                  <p><strong>Batch Size:</strong> {order.batchSize}</p>
                  <p><strong>Order ID:</strong> {order.id}</p>
                </div>
                
                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => startTimer(order.id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Start Timer
                    </button>
                  )}
                  
                  {order.status === 'cooking' && (
                    <div className="text-center">
                      {timers[order.id] ? (
                        <div>
                          <p className="text-blue-600 font-medium text-lg">
                            ⏰ {formatTime(timers[order.id].remaining)}
                          </p>
                          <p className="text-sm text-gray-600">Time remaining</p>
                        </div>
                      ) : (
                        <p className="text-blue-600 font-medium">Timer is running...</p>
                      )}
                    </div>
                  )}
                  
                  {order.status === 'timer_expired' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Mark as Done
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Complete & Delete
                      </button>
                    </div>
                  )}
                  
                  {order.status === 'ready' && (
                    <div className="text-center">
                      <p className="text-green-600 font-medium">Ready for pickup!</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
