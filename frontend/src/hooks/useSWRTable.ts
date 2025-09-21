import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import apiClient from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContextSWR';

// Types for Table component
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

// Fetcher functions for SWR
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

// Mutation functions
const createOrderMutation = async (url: string, { arg }: { 
  arg: { 
    restaurantId: number; 
    tableSection: number; 
    menuItemId: number; 
    batchSize: number; 
  } 
}) => {
  const response = await apiClient.post(url, arg);
  return response.data;
};

// Hook for managing menu items for a specific restaurant
export function useSWRMenuItems(restaurantId: string | number | null) {
  const { user } = useAuth();
  
  const { 
    data: menuData, 
    error, 
    isLoading: loading,
    mutate
  } = useSWR(
    user && restaurantId ? `//menu-items?restaurant_id=${restaurantId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - menu items don't change often
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR Menu Items:', { 
            success: true, 
            restaurantId,
            count: data?.data?.length || 0 
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Menu Items Error:', error.message);
        }
      }
    }
  );

  return {
    menuItems: menuData?.data || [],
    loading,
    error,
    mutate
  };
}

// Hook for managing orders for a specific table/restaurant
export function useSWRTableOrders(restaurantId: string | number | null, tableId?: string | number) {
  const { user } = useAuth();
  
  const { 
    data: ordersData, 
    error, 
    isLoading: loading,
    mutate
  } = useSWR(
    user && restaurantId ? `//orders?restaurant_id=${restaurantId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 3000, // 3 seconds - orders change very frequently for tables
      refreshInterval: 5000, // Auto-refresh every 5 seconds for table view
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          const allOrders = data?.data || [];
          const filteredCount = tableId 
            ? allOrders.filter((order: Order) => order.tableSection === parseInt(tableId.toString())).length
            : allOrders.length;
            
          console.log('✅ SWR Table Orders:', { 
            success: true, 
            restaurantId,
            tableId,
            allOrdersCount: allOrders.length,
            filteredOrdersCount: filteredCount,
            tableSection: tableId ? parseInt(tableId.toString()) : 'all'
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Table Orders Error:', error.message);
        }
      }
    }
  );

  // Filter orders by table section if tableId is provided
  const filteredOrders = tableId 
    ? (ordersData?.data || []).filter((order: Order) => order.tableSection === parseInt(tableId.toString()))
    : ordersData?.data || [];

  return {
    orders: filteredOrders,
    allOrders: ordersData?.data || [],
    loading,
    error,
    mutate
  };
}

// Hook for creating orders from table
export function useSWRTableCreateOrder(onOrderCreated?: () => void) {
  const { 
    trigger: createOrder, 
    isMutating: isCreating,
    error: createError
  } = useSWRMutation(
    '//orders',
    createOrderMutation,
    {
      onSuccess: (data) => {
        console.log('✅ Table Order created successfully:', data);
        // Call callback to refresh orders
        if (onOrderCreated) {
          onOrderCreated();
        }
      },
      onError: (error) => {
        console.error('❌ Error creating table order:', error);
      }
    }
  );

  return {
    createOrder,
    isCreating,
    createError
  };
}
