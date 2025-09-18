'use client';

import { useState } from 'react';
import Link from "next/link";
import { ArrowLeft, DollarSign, MapPin, Building, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProtectedRoute from '@/components/ProtectedRoute';
import payStructure from '@/data/payStructure';

interface PayData {
  [role: string]: number;
}

interface Region {
  name: string;
  stores: number[];
  pay: PayData;
}

function PayStructureContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Filter regions based on search term
  const filteredRegions = payStructure.regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.stores.some(store => store.toString().includes(searchTerm))
  );

  // Get unique roles for the table header
  const roles = payStructure.roles;

  // Calculate average pay for each role across all regions
  const getAveragePay = (role: string) => {
    const pays = payStructure.regions.map(region => region.pay[role]);
    const sum = pays.reduce((acc, pay) => acc + pay, 0);
    return (sum / pays.length).toFixed(2);
  };

  // Get min/max pay for each role
  const getPayRange = (role: string) => {
    const pays = payStructure.regions.map(region => region.pay[role]);
    const min = Math.min(...pays);
    const max = Math.max(...pays);
    return { min, max };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Pay Structure Management
            </h1>
            <p className="text-muted-foreground text-lg">
              View hourly pay rates across all regions and roles
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payStructure.regions.length}</div>
              <p className="text-xs text-muted-foreground">
                Active pay regions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payStructure.regions.reduce((acc, region) => acc + region.stores.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Stores covered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Types</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                Different positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pay Range</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Math.min(...payStructure.regions.flatMap(r => Object.values(r.pay)))} - 
                ${Math.max(...payStructure.regions.flatMap(r => Object.values(r.pay)))}
              </div>
              <p className="text-xs text-muted-foreground">
                Hourly rate range
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regions or store numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pay Structure Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Regional Pay Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Region</TableHead>
                    <TableHead className="w-[100px]">Stores</TableHead>
                    {roles.map(role => (
                      <TableHead key={role} className="text-center min-w-[120px]">
                        {role}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegions.map((region, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{region.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.stores.length} locations
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {region.stores.length}
                        </Badge>
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={role} className="text-center">
                          <div className="font-mono font-semibold text-green-600">
                            ${region.pay[role].toFixed(2)}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Role Pay Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => {
                const range = getPayRange(role);
                const average = getAveragePay(role);
                return (
                  <Card key={role} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{role}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Average:</span>
                          <span className="font-mono font-semibold">${average}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Range:</span>
                          <span className="font-mono text-sm">
                            ${range.min.toFixed(2)} - ${range.max.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Store Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Store Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRegions.map((region, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{region.name}</h4>
                  <div className="flex flex-wrap gap-1">
                    {region.stores.map(store => (
                      <Badge key={store} variant="secondary" className="text-xs">
                        #{store}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {region.stores.length} stores
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PayStructure() {
  return (
    <ProtectedRoute>
      <PayStructureContent />
    </ProtectedRoute>
  );
}
