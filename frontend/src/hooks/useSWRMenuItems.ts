import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import { MenuItem } from '@/data/recipeBook';

interface MenuItemsResponse {
  data: MenuItem[];
}

interface CategoriesResponse {
  data: string[];
}

export function useSWRMenuItems(restaurantId?: number, category?: string, steamTable?: boolean) {
  const params = new URLSearchParams();
  if (restaurantId) params.append('restaurant_id', restaurantId.toString());
  if (category) params.append('category', category);
  if (steamTable !== undefined) params.append('steam_table', steamTable.toString());

  const { data, error, isLoading, mutate } = useSWR<MenuItemsResponse>(
    `/menu-items?${params.toString()}`,
    (url) => apiFetch(url)
  );

  return {
    menuItems: data?.data || [],
    error,
    isLoading,
    mutate
  };
}

export function useSWRCategories() {
  const { data, error, isLoading, mutate } = useSWR<CategoriesResponse>(
    '/menu-items/categories',
    (url) => apiFetch(url)
  );

  return {
    categories: data?.data || [],
    error,
    isLoading,
    mutate
  };
}

export function useSWRRecipeBookItems(restaurantId?: number, category?: string) {
  // Get all items for recipe book (both steam table and recipe-only items)
  return useSWRMenuItems(restaurantId, category, undefined);
}

export function useSWRSteamTableItems(restaurantId?: number, category?: string) {
  // Get all items that ARE steam table items (kitchen operations)
  return useSWRMenuItems(restaurantId, category, true);
}
