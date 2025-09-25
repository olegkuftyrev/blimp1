'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSWRRecipeBookItems } from '@/hooks/useSWRMenuItems';
import { c2MushroomChicken } from '@/data/recipes/chicken/c2';

export default function RecipeDetailPage() {
  const params = useParams();
  const category = (params?.category as string) || '';
  const slug = (params?.slug as string) || '';
  const { menuItems: recipeItems, isLoading } = useSWRRecipeBookItems();
  
  // Filter for the specific category
  const categoryItems = recipeItems.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
  
  // Find recipe by extracting code from item title
  const recipe = categoryItems.find(item => {
    const code = item.itemTitle.split(' ')[0].toLowerCase();
    return code === slug;
  });
  
  // Only show detailed recipe data for C2 Mushroom Chicken (as example)
  const detail = slug === 'c2' && category.toLowerCase() === 'chicken' ? c2MushroomChicken : null;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Loading Recipe...</h1>
              <p className="text-muted-foreground">Fetching recipe details from backend...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!recipe) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Recipe Not Found</h1>
              <p className="text-muted-foreground">The requested recipe could not be found in the backend.</p>
              <Link 
                href={`/recipe-book/${category}`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 mt-4"
              >
                Back to {category.charAt(0).toUpperCase() + category.slice(1)} Recipes
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract code and title from itemTitle
  const code = recipe.itemTitle.split(' ')[0];
  const title = recipe.itemTitle.replace(code + ' ', '');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{code} - {title}</h1>
              <p className="text-muted-foreground">
                {recipe.steamTable ? 'Kitchen + Recipe Book' : 'Recipe Book Only'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" disabled title="Coming soon">
                Download PDF
              </Button>
            </div>
          </div>

          {detail ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {detail.quickRead && (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>{detail.quickRead.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      {detail.quickRead.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    {detail.quickRead.checks && detail.quickRead.checks.length > 0 && (
                      <div className="mt-4">
                        <div className="font-semibold mb-1">Critical checks (don't skip)</div>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {detail.quickRead.checks.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Batch Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Batch</div>
                      <div className="font-medium">{detail.batchLabel}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Approx Servings</div>
                      <div className="font-medium">{detail.servingsApprox}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Approx Cooked Weight</div>
                      <div className="font-medium">{detail.cookedWeightApprox}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max Hold</div>
                      <div className="font-medium">{detail.maxHold}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-muted-foreground">Source</div>
                      <div className="font-medium">{detail.source}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>What you'll need</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {detail.equipment.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Ingredients (Batch #1)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detail.ingredients.map(group => (
                      <div key={group.group}>
                        <div className="font-semibold mb-1">{group.group}</div>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {group.items.map((it, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{it.name}</span>: {it.amount}{it.notes ? ` — ${it.notes}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Step-by-step</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detail.steps.map((s, i) => (
                      <div key={i}>
                        <div className="font-semibold mb-1">{s.title}</div>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {s.bullets.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Timing snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {detail.timings.map((t, i) => (
                      <li key={i} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t.label}</span>
                        <span className="font-medium">{t.value}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quality control</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {detail.qualityControl.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Scaling cues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {detail.scaling.map((s, i) => (
                      <div key={i}>
                        <div className="font-semibold">{s.label}</div>
                        <ul className="list-disc pl-5">
                          {s.details.map((d, j) => (
                            <li key={j}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recipe Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This recipe is available in the backend but detailed cooking instructions are not yet implemented.
                </p>
                <div className="space-y-2 text-sm">
                  <div><strong>Item:</strong> {recipe.itemTitle}</div>
                  <div><strong>Category:</strong> {recipe.category}</div>
                  <div><strong>Type:</strong> {recipe.steamTable ? 'Kitchen + Recipe Book' : 'Recipe Book Only'}</div>
                  <div><strong>Status:</strong> {recipe.status}</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/recipe-book/${category}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                  >
                    Back to {category.charAt(0).toUpperCase() + category.slice(1)} Recipes
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
