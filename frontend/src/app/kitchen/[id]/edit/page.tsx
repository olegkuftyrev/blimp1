'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

function EditRestaurantContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user has permission to edit restaurants
  const canEditRestaurant = user?.role && ['admin', 'ops_lead', 'black_shirt'].includes(user.role);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!canEditRestaurant) {
      setError('You do not have permission to edit restaurant information');
    }
  }, [canEditRestaurant]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{data: Restaurant[]}>('simple-auth/restaurants');
      const restaurants = response.data || [];
      const currentRestaurant = restaurants.find(r => r.id === parseInt(restaurantId));
      
      if (currentRestaurant) {
        setRestaurant(currentRestaurant);
        setFormData({
          name: currentRestaurant.name,
          address: currentRestaurant.address,
          phone: currentRestaurant.phone,
          isActive: currentRestaurant.isActive
        });
      } else {
        setError('Restaurant not found or access denied');
      }
    } catch (err: any) {
      console.error('Error fetching restaurant:', err);
      setError('Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!canEditRestaurant) {
      setError('You do not have permission to edit restaurant information');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Restaurant address is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Restaurant phone is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        isActive: formData.isActive
      };

      await apiFetch(`simple-auth/restaurants/${restaurantId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      setSuccess(true);
      
      // Update local restaurant data
      if (restaurant) {
        setRestaurant({
          ...restaurant,
          ...updateData
        });
      }

      // Redirect back to kitchen dashboard after short delay
      setTimeout(() => {
        router.push(`/kitchen/${restaurantId}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error updating restaurant:', err);
      if (err.message?.includes('unique')) {
        setError('Restaurant name must be unique');
      } else {
        setError(err.message || 'Failed to update restaurant');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <Link href={`/kitchen/${restaurantId}`}>
            <Button>Back to Kitchen Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Restaurant</h1>
              <p className="text-muted-foreground">Update restaurant information and settings</p>
            </div>
          </div>
        </div>

        {/* Permission Check */}
        {!canEditRestaurant && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive font-medium mb-2">Access Denied</p>
                <p className="text-muted-foreground">
                  Only administrators, operations leads, and black shirt staff can edit restaurant information.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        <Card className={!canEditRestaurant ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Restaurant Information
              <Badge variant={formData.isActive ? "default" : "secondary"}>
                {formData.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Restaurant updated successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Restaurant Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Restaurant Name</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter restaurant name"
                disabled={!canEditRestaurant}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter restaurant address"
                disabled={!canEditRestaurant}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                disabled={!canEditRestaurant}
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <span>Restaurant Status</span>
              </Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === true}
                    onChange={() => handleInputChange('isActive', true)}
                    disabled={!canEditRestaurant}
                    className="text-green-600"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === false}
                    onChange={() => handleInputChange('isActive', false)}
                    disabled={!canEditRestaurant}
                    className="text-red-600"
                  />
                  <span className="text-sm">Inactive</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Inactive restaurants will not be accessible to regular staff
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={!canEditRestaurant || saving || success}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
              
              <Link href={`/kitchen/${restaurantId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* User Role Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Your Role:</strong> {user?.role || 'Unknown'} | 
            <strong> Edit Permission:</strong> {canEditRestaurant ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EditRestaurant() {
  return (
    <ProtectedRoute>
      <EditRestaurantContent />
    </ProtectedRoute>
  );
}
