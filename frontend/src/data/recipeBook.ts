export interface RecipeItem {
  id: number;
  code: string; // e.g., C1, CB1
  slug: string; // e.g., c1, cb1
  title: string; // e.g., Orange Chicken
  category: string;
  steamTable: boolean;
}

export interface MenuItem {
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
  category: string;
  steamTable: boolean;
  restaurantId: number;
  createdAt: string;
  updatedAt: string;
}

// All data now comes from backend API - no static data


