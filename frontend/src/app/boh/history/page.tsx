'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderHistory {
  id: number;
  tableSection: number;
  menuItemId: number;
  batchSize: number;
  batchNumber: number;
  status: 'ready' | 'completed' | 'deleted' | 'cancelled';
  timerStart?: string;
  timerEnd?: string;
  completedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  duration: number; // in minutes
  menuItem?: {
    id: number;
    itemTitle: string;
  };
}

function BohHistoryPageContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant_id') || '1';
  
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'deleted'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{data: OrderHistory[]}>(`simple-auth/orders-history?restaurant_id=${restaurantId}`);
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load order history when component mounts or restaurant changes
  useEffect(() => {
    fetchOrderHistory();
  }, [restaurantId]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'completed') return ['ready', 'completed'].includes(order.status);
    if (filter === 'deleted') return ['deleted', 'cancelled'].includes(order.status);
    return order.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'deleted':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'completed':
        return 'Completed';
      case 'deleted':
        return 'Deleted';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'In Progress';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-foreground">Order History</h1>
          </div>
          <p className="text-muted-foreground">View all completed and deleted orders</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Order Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
              >
                <option value="all">All Orders</option>
                <option value="completed">Completed</option>
                <option value="deleted">Deleted/Cancelled</option>
              </select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Time Period
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {orders.filter(o => ['ready', 'completed'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Deleted</p>
                <p className="text-2xl font-bold text-foreground">
                  {orders.filter(o => ['deleted', 'cancelled'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Average Time</p>
                <p className="text-2xl font-bold text-foreground">
                  {orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.duration, 0) / orders.length) : 0} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-card rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Orders ({filteredOrders.length})
            </h2>
          </div>

          <div className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium text-foreground">
                            Table #{order.tableSection}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ['ready', 'completed'].includes(order.status)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {order.menuItem?.itemTitle || 'Unknown Item'} - Batch Size: {order.batchSize}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>Time: {formatDate(order.completedAt || order.deletedAt || order.createdAt)}</span>
                          <span>Duration: {order.duration} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        Batch #{order.batchNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BohHistoryPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-2xl text-muted-foreground">Loading history...</p>
        </div>
      }>
        <BohHistoryPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
