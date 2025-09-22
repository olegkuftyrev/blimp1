import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import apiClient from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContextSWR';

// Types
interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface Order {
  id: number;
  tableSection: number;
  status: string;
  menuItem?: {
    itemTitle: string;
  };
  batchSize: number;
  timerStart?: string;
  timerEnd?: string;
}

// Fetcher functions for SWR
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

// Mutation functions
const updateRestaurantMutation = async (url: string, { arg }: { arg: Partial<Restaurant> }) => {
  const response = await apiClient.put(url, arg);
  return response.data;
};

const createOrderMutation = async (url: string, { arg }: { arg: { restaurantId: number; tableSection: number; menuItemId: number; batchSize: number } }) => {
  const response = await apiClient.post(url, arg);
  return response.data;
};

// Hook for managing restaurants
export function useSWRRestaurants() {
  const { user } = useAuth();
  
  const { 
    data: restaurantsData, 
    error, 
    isLoading: loading,
    mutate
  } = useSWR(
    user ? 'restaurants' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute - restaurants don't change often
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR Restaurants:', { 
            success: true, 
            count: data?.data?.length || 0 
          });
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Restaurants Error:', error.message);
        }
      }
    }
  );

  return {
    restaurants: restaurantsData?.data || [],
    loading,
    error,
    mutate
  };
}

// Hook for managing orders for a specific restaurant
export function useSWROrders(restaurantId: string | number | null) {
  const { user } = useAuth();
  
  const { 
    data: ordersData, 
    error, 
    isLoading: loading,
    mutate
  } = useSWR(
    user && restaurantId ? `orders?restaurant_id=${restaurantId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 1000, // 1 second - orders change frequently
      refreshInterval: 2000, // Auto-refresh every 2 seconds for kitchen
      onSuccess: (data) => {
        console.log('✅ SWR Orders updated:', { 
          success: true, 
          restaurantId,
          count: data?.data?.length || 0 
        });
      },
      onError: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Orders Error:', error.message);
        }
      }
    }
  );

  return {
    orders: ordersData?.data || [],
    loading,
    error,
    mutate
  };
}

// Hook for updating restaurant
export function useSWRUpdateRestaurant(restaurantId: string | number | null) {
  const { 
    trigger: updateRestaurant, 
    isMutating: isUpdating,
    error: updateError
  } = useSWRMutation(
    restaurantId ? `restaurants/${restaurantId}` : null,
    updateRestaurantMutation,
    {
      onSuccess: (data) => {
        console.log('✅ Restaurant updated successfully:', data);
        // Refresh restaurants list after successful update
        // This will be handled by SWR's automatic revalidation
      },
      onError: (error) => {
        console.error('❌ Error updating restaurant:', error);
      }
    }
  );

  return {
    updateRestaurant,
    isUpdating,
    updateError
  };
}

// Hook for creating orders
export function useSWRCreateOrder() {
  const { 
    trigger: createOrder, 
    isMutating: isCreating,
    error: createError
  } = useSWRMutation(
    'orders',
    createOrderMutation,
    {
      onSuccess: (data) => {
        console.log('✅ Order created successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Error creating order:', error);
      }
    }
  );

  return {
    createOrder,
    isCreating,
    createError
  };
}

// Utility function to find restaurant by ID
export const findRestaurantById = (restaurants: Restaurant[], id: string | number): Restaurant | null => {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  return restaurants.find(r => r.id === numId) || null;
};
