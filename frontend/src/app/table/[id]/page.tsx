'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents } from '@/hooks/useWebSocketEvents';

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
    };
  }, [tableId, isConnected, joinTable, leaveTable]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/menu-items');
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
      const response = await fetch('http://localhost:3333/api/orders');
      const data = await response.json();
      setOrders(data.data);
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
    }
  };

  const handleOrderCompleted = (event: any) => {
    console.log('📢 Order completed event received:', event);
    if (event.order.tableSection === parseInt(tableId)) {
      setOrders(prev => prev.map(order => 
        order.id === event.order.id ? event.order : order
      ));
    }
  };

  const handleAllOrdersDeleted = (event: any) => {
    console.log('🗑️ All orders deleted event received:', event);
    setOrders([]);
  };

  // Subscribe to WebSocket events
  useOrderEvents(handleOrderCreated, handleOrderUpdated, handleOrderCompleted, handleAllOrdersDeleted);

  const createOrder = async (menuItemId: number, batchSize: number) => {
    try {
      const response = await fetch('http://localhost:3333/api/orders', {
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
        // Order will be added via WebSocket event
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const deleteAllOrders = async () => {
    if (!confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/api/orders', {
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
          <h1 className="text-4xl font-bold text-gray-800">
            Table Section {tableId}
          </h1>
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
                <button
                  onClick={() => createOrder(item.id, item.batchBreakfast)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors"
                >
                  Breakfast ({item.batchBreakfast})
                </button>
                
                <button
                  onClick={() => createOrder(item.id, item.batchLunch)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors"
                >
                  Lunch ({item.batchLunch})
                </button>
                
                <button
                  onClick={() => createOrder(item.id, item.batchDowntime)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors"
                >
                  Downtime ({item.batchDowntime})
                </button>
                
                <button
                  onClick={() => createOrder(item.id, item.batchDinner)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors"
                >
                  Dinner ({item.batchDinner})
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>Cooking Times:</p>
                <p>Batch 1: {item.cookingTimeBatch1}min</p>
                <p>Batch 2: {item.cookingTimeBatch2}min</p>
                <p>Batch 3: {item.cookingTimeBatch3}min</p>
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
