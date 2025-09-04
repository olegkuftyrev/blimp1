'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useOrderEvents, useTimerEvents } from '@/hooks/useWebSocketEvents';
import Link from 'next/link'

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

export default function TableSection() {
  const params = useParams();
  const tableId = params.id as string;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setSentOrders] = useState<Record<string, boolean>>({});

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
  }, [tableId, isConnected, joinTable, leaveTable]);

  // Fallback polling: refresh orders every 2 seconds only if WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        fetchOrders();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`/api/menu-items`);
      const data = await response.json();

      // Filter menu items based on table ID
      let filteredItems = data.data;
      if (tableId === '1') {
        // Table 1 should only show: C3, F4, B3, M1, R1 (and V1 if you intended it)
        filteredItems = data.data.filter(
          (item: MenuItem) =>
            item.itemTitle.includes('C3 Kung Pao Chicken') ||
            item.itemTitle.includes('F4 Honey Walnut Shrimp') ||
            item.itemTitle.includes('B3 Black Pepper Sirloin Steak') ||
            item.itemTitle.includes('M1 Chow Mein') || // 🛠️ “Chow” not “Show”
            item.itemTitle.includes('V1 Super Greens') ||
            item.itemTitle.includes('R1 Fried Rice') ||
            item.itemTitle.includes('test')
        );
      } else if (tableId === '2') {
        // Table 2 should only show: CB1, C1, C2, B5, B1, CB3
        filteredItems = data.data.filter(
          (item: MenuItem) =>
            item.itemTitle.includes('CB1 String Bean Chicken Breast') ||
            item.itemTitle.includes('C1 Orange Chicken') ||
            item.itemTitle.includes('C2 Mushroom Chicken') ||
            item.itemTitle.includes('B5 Beijing Beef') ||
            item.itemTitle.includes('B1 Broccoli Beef') ||
            item.itemTitle.includes('CB3 Honey Sesame Chicken Breast')
        );
      } else if (tableId === '3') {
        // Table 3 should only show: E2, E3, E1, C4
        filteredItems = data.data.filter(
          (item: MenuItem) =>
            item.itemTitle.includes('E2 Chicken Egg Roll') ||
            item.itemTitle.includes('E3 Cream Cheese Rangoons') ||
            item.itemTitle.includes('E1 Veggie Spring Rolls') ||
            item.itemTitle.includes('C4 Grilled Teriyaki Chicken')
        );
      }

      setMenuItems(filteredItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders`);
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
  type TimerEventT = { order: BackendOrder };

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

  const normalizeOrder = (o: BackendOrder) => {
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
      const response = await fetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableSection: parseInt(tableId),
          menuItemId: menuItemId,
          batchSize: batchSize,
          batchNumber: batchNumber,
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
      const response = await fetch(`/api/orders/${orderId}`, {
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
        const resp = await fetch(`/api/orders`);
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
      const response = await fetch(`/api/orders`, {
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
            <h1 className="text-4xl font-bold text-gray-800">Table Section {tableId}</h1>
            <div className="mt-2 text-lg text-gray-600">Current Time: {new Date().toLocaleTimeString()}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-12 flex items-center justify-center mb-1">
                <h3 className="text-xl font-semibold text-center text-gray-800 leading-tight">{item.itemTitle}</h3>
              </div>

              <div className="space-y-2">
                {[1, 2, 3].map((batchNumber) => {
                  const order = orders.find((o) => o.menuItemId === item.id && o.batchNumber === batchNumber);
                  const isSent = Boolean(order);

                  return (
                    <div key={batchNumber} className="flex space-x-2">
                      <button
                        onClick={() => createOrder(item.id, batchNumber)}
                        disabled={isSent}
                        className={`flex-1 py-2 px-3 rounded-md text-base font-medium transition-colors ${
                          isSent
                            ? (() => {
                                if (order) {
                                  if (order.status === 'cooking') return 'bg-blue-500 text-white cursor-not-allowed';
                                  if (order.status === 'pending') return 'bg-yellow-500 text-white cursor-not-allowed';
                                  if (order.status === 'timer_expired') return 'bg-red-500 text-white cursor-not-allowed';
                                  if (order.status === 'ready') return 'bg-green-500 text-white cursor-not-allowed';
                                }
                                return 'bg-yellow-500 text-white cursor-not-allowed';
                              })()
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
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
                      </button>

                      {order && (
                        <button
                          onClick={() => deleteOrder(order.id, item.id, order.batchNumber || 1)}
                          className="py-2 px-2 rounded-md font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dish</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Batch Size</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders
                    .filter((o) => o.tableSection === parseInt(tableId))
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {order?.menuItem?.itemTitle ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.batchSize}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                              order.status === 'pending'
                                ? 'bg-yellow-500'
                                : order.status === 'cooking'
                                ? 'bg-blue-500'
                                : order.status === 'timer_expired'
                                ? 'bg-red-500'
                                : order.status === 'ready'
                                ? 'bg-green-500'
                                : 'bg-gray-500'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.status === 'cooking' ? (
                            (() => {
                              const remaining = getRemainingTime(order);
                              return remaining !== null ? (
                                <div className="text-blue-600 font-medium">⏰ {formatTime(remaining)}</div>
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
                            {order.status === 'timer_expired' && (
                              <button
                                onClick={() => deleteOrder(order.id, order.menuItem.id, order.batchNumber || 1)}
                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
