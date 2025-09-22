'use client';

import { useAuth } from '@/contexts/AuthContextSWR';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MapPin, Phone, Users, Shield } from "lucide-react";
import { useSWRRestaurants } from '@/hooks/useSWRKitchen';
import { useSWRTeamMembers } from '@/hooks/useSWRTeamMembers';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants, loading, error } = useSWRRestaurants();
  const { teamMembers, loading: teamLoading } = useSWRTeamMembers();

  // Function to get team members for a specific restaurant
  const getTeamMembersForRestaurant = (restaurantId: number) => {
    if (!teamMembers) return { blackShirts: [], opsLeads: [] };
    
    const restaurantMembers = teamMembers.filter((member: any) => 
      member.restaurants?.some((restaurant: any) => restaurant.id === restaurantId)
    );
    
    return {
      blackShirts: restaurantMembers.filter((member: any) => member.role === 'black_shirt'),
      opsLeads: restaurantMembers.filter((member: any) => member.role === 'ops_lead')
    };
  };

  // Function to format job title
  const formatJobTitle = (jobTitle: string) => {
    if (jobTitle === 'SM/GM/TL') {
      return 'PIC';
    }
    return jobTitle;
  };

  useEffect(() => {
    if (user && user.role === 'associate') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'associate') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">Access denied. You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Failed to load restaurants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analytics & Reports
        </h1>
        <p className="text-muted-foreground">
          Select a restaurant to view financial reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => {
          const { blackShirts, opsLeads } = getTeamMembersForRestaurant(restaurant.id);
          
          return (
            <Link key={restaurant.id} href={`/analytics/${restaurant.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      {restaurant.name}
                    </CardTitle>
                    <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                    {restaurant.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{restaurant.phone}</span>
                      </div>
                    )}
                    
                    {/* Team Members Section */}
                    <div className="pt-2 border-t">
                      <div className="space-y-2">
                        {/* Ops Leads */}
                        {opsLeads.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Ops Leads</span>
                            </div>
                            <div className="pl-6 space-y-1">
                              {opsLeads.map((member: any) => (
                                <div key={member.id} className="text-xs text-muted-foreground">
                                  {formatJobTitle(member.job_title || member.jobTitle)} - {member.fullName || member.email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Black Shirts */}
                        {blackShirts.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">Black Shirts</span>
                            </div>
                            <div className="pl-6 space-y-1">
                              {blackShirts.map((member: any) => (
                                <div key={member.id} className="text-xs text-muted-foreground">
                                  {formatJobTitle(member.job_title || member.jobTitle)} - {member.fullName || member.email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* No team members */}
                        {blackShirts.length === 0 && opsLeads.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No management assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
