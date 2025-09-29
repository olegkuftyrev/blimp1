'use client';

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from 'react';

interface PageHeaderProps {
  storeName: string;
  period: string;
  year: number;
  userRole?: string;
  onDeleteReport?: () => void;
  isDeleting?: boolean;
}

export function PageHeader({ 
  storeName, 
  period, 
  year, 
  userRole, 
  onDeleteReport, 
  isDeleting = false 
}: PageHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteReport = () => {
    if (onDeleteReport) {
      onDeleteReport();
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{storeName}</h1>
            <p className="text-muted-foreground">
              P&L Report - {period} {year}
            </p>
          </div>
        </div>
          
        {/* Delete Report Button - Only show for non-associate users */}
        {userRole !== 'associate' && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete P&L Report</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this P&L report for {storeName} - {period} {year}?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteReport}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Report'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
