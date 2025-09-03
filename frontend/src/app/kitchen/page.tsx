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

  useEffect(() => {
    fetchOrders();
    // Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
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

  const startTimer = async (orderId: number) => {
    try {
      const response = await fetch(`http://localhost:3333/api/kitchen/orders/${orderId}/start-timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Timer started!');
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
                      <p className="text-blue-600 font-medium">Timer is running...</p>
                    </div>
                  )}
                  
                  {order.status === 'timer_expired' && (
                    <button
                      onClick={() => completeOrder(order.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Mark as Done
                    </button>
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
