'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSWRRecipeBookItems } from '@/hooks/useSWRMenuItems';

const categoryColors = {
  'appetizers': 'bg-rose-500',
  'beef': 'bg-emerald-600',
  'chicken': 'bg-amber-500',
  'seafood': 'bg-blue-500',
  'sides': 'bg-purple-500',
  'beverages': 'bg-cyan-500',
  'lto': 'bg-orange-500',
  'support-materials': 'bg-gray-500',
};

export default function CategoryRecipesPage() {
  const params = useParams();
  const category = (params?.category as string) || '';
  const { menuItems: recipeItems, isLoading } = useSWRRecipeBookItems();

  // Filter for the specific category
  const categoryItems = recipeItems.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Loading {category} Recipes...</h1>
              <p className="text-muted-foreground">Fetching recipes from backend...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (categoryItems.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{category.charAt(0).toUpperCase() + category.slice(1)} Recipes</h1>
              <p className="text-muted-foreground">No recipes found for this category in the backend.</p>
            </div>
            <Link 
              href="/recipe-book"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
            >
              Back to Recipe Book
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {category.charAt(0).toUpperCase() + category.slice(1)} Recipes
            </h1>
            <p className="text-muted-foreground">
              Choose a recipe to view details. ({categoryItems.length} recipe{categoryItems.length !== 1 ? 's' : ''} available)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categoryItems.map((item) => {
              // Extract code from item title (e.g., "C1 Orange Chicken" -> "C1")
              const code = item.itemTitle.split(' ')[0];
              const title = item.itemTitle.replace(code + ' ', '');
              const slug = code.toLowerCase();
              
              return (
                <Card key={item.id} className="transition-all hover:shadow-lg ring-1 ring-border h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg">{code} - {title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {item.steamTable ? 'Kitchen + Recipe Book' : 'Recipe Book Only'}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Link 
                      href={`/recipe-book/${category}/${slug}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                      Open Recipe
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
