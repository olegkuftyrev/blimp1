'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-foreground">
            Test Page
          </h1>
          <p className="text-lg text-muted-foreground">
            This is an empty test page for experimenting with new features.
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Test Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  Button 1
                </Button>
                <Button className="w-full" size="lg">
                  Button 2
                </Button>
                <Button className="w-full" size="lg">
                  Button 3
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
