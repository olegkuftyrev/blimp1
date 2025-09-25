'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useSWRCategories, useSWRRecipeBookItems } from '@/hooks/useSWRMenuItems';

const categoryColors = {
  'Appetizers': 'bg-rose-500',
  'Beef': 'bg-emerald-600',
  'Chicken': 'bg-amber-500',
  'Seafood': 'bg-blue-500',
  'Sides': 'bg-purple-500',
  'Beverages': 'bg-cyan-500',
  'LTO': 'bg-orange-500',
  'Support Materials': 'bg-gray-500',
};

const categoryIcons = {
  'Appetizers': ChefHat,
  'Beef': ChefHat,
  'Chicken': ChefHat,
  'Seafood': ChefHat,
  'Sides': ChefHat,
  'Beverages': ChefHat,
  'LTO': ChefHat,
  'Support Materials': BookOpen,
};

export default function RecipeBookPage() {
  const { categories, isLoading: categoriesLoading } = useSWRCategories();
  const { menuItems: recipeItems, isLoading: itemsLoading } = useSWRRecipeBookItems();

  // Group items by category
  const itemsByCategory = recipeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof recipeItems>);

  if (categoriesLoading || itemsLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Recipe Book</h1>
              <p className="text-muted-foreground">Loading categories and recipes...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Recipe Book</h1>
            <p className="text-muted-foreground">Browse categories and recipes from the backend.</p>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || ChefHat;
                  const colorClass = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500';
                  const itemCount = itemsByCategory[category]?.length || 0;
                  
                  return (
                    <Card key={category} className="transition-all hover:shadow-lg ring-1 ring-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{category}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {itemCount} recipe{itemCount !== 1 ? 's' : ''} available
                        </p>
                        <Link 
                          href={`/recipe-book/${category.toLowerCase()}`} 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                        >
                          Open
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


