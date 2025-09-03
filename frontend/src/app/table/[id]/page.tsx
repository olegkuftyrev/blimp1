'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchMenuItems();
    // Poll every 5 seconds
    const interval = setInterval(fetchMenuItems, 5000);
    return () => clearInterval(interval);
  }, []);

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
        alert('Order created successfully!');
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
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
          Table Section {tableId}
        </h1>
        
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
