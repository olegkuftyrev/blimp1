'use client';

import { Target, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface IndividualDevelopmentPlanCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  // Switch functionality
  showSwitch?: boolean;
  switchEnabled?: boolean;
  onSwitchChange?: (enabled: boolean) => void;
  switchLabels?: {
    left: string;
    right: string;
  };
  // Action button
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
}

export function IndividualDevelopmentPlanCard({ 
  title = "Individual Development Plan",
  description = "Edit your development objectives based on assessment results",
  children,
  content,
  className = "",
  // Switch functionality
  showSwitch = false,
  switchEnabled = false,
  onSwitchChange,
  switchLabels = { left: "Cards", right: "Table" },
  // Action button
  showAddButton = false,
  addButtonText = "Add Item",
  onAddClick
}: IndividualDevelopmentPlanCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            {/* Switch Controls */}
            {showSwitch && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="view-mode" className="text-sm text-muted-foreground">
                  {switchLabels.left}
                </Label>
                <button
                  type="button"
                  onClick={() => onSwitchChange?.(!switchEnabled)}
                  className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                    switchEnabled ? 'data-[state=checked]:bg-primary bg-primary' : 'data-[state=unchecked]:bg-input bg-input'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      switchEnabled ? 'data-[state=checked]:translate-x-5 translate-x-5' : 'data-[state=unchecked]:translate-x-0 translate-x-0'
                    }`}
                  />
                </button>
                <Label htmlFor="view-mode" className="text-sm text-muted-foreground">
                  {switchLabels.right}
                </Label>
              </div>
            )}
            
            {/* Add Button */}
            {showAddButton && (
              <Button onClick={onAddClick} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {addButtonText}
              </Button>
            )}
            
            {/* Custom children */}
            {children}
          </div>
        </div>
      </CardHeader>
      {content && <CardContent>{content}</CardContent>}
    </Card>
  );
}
