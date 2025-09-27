'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Save, Edit3, X, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import * as Switch from "@radix-ui/react-switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from '@/contexts/AuthContextSWR';
import { useCompetencies, useDevelopmentPlan, useSaveDevelopmentPlan, useDeleteDevelopmentPlanMeasurement, IDPUtils } from '@/hooks/useSWRIDP';
import { apiFetch } from '@/lib/api';
import { useConfirmDialog } from '@/components/ConfirmDialog';

interface DevelopmentPlanMeasurement {
  id: string | number;
  text: string;
  actionSteps: string;
  responsibleResources: string;
  startDate: string;
  completionDate: string;
}

interface DevelopmentPlanItem {
  id?: number;
  competencyId: number;
  competencyName: string;
  currentScore?: string;
  measurements: DevelopmentPlanMeasurement[];
}

interface EditableDevelopmentPlanTableProps {
  competencyScores: any[];
  answers: { [questionId: number]: 'yes' | 'no' };
  className?: string;
}

export function EditableDevelopmentPlanTable({ 
  competencyScores, 
  answers, 
  className = '' 
}: EditableDevelopmentPlanTableProps) {
  const { user } = useAuth();
  const { competencies } = useCompetencies(user?.role);
  const { planItems: swrPlanItems, isLoading, mutate } = useDevelopmentPlan();
  const { savePlan, isSaving } = useSaveDevelopmentPlan();
  const { deleteMeasurement, isDeleting } = useDeleteDevelopmentPlanMeasurement();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  const [planItems, setPlanItems] = useState<DevelopmentPlanItem[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<number>(0);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string>('');
  const [showCompetencySelection, setShowCompetencySelection] = useState(true);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingMeasurementIndex, setEditingMeasurementIndex] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Sync SWR data with local state
  useEffect(() => {
    setPlanItems(swrPlanItems);
  }, [swrPlanItems]);

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setSwitchEnabled(checked);
  };

  // Handle edit dialog
  const openEditDialog = (itemIndex: number, measurementIndex: number) => {
    setEditingItemIndex(itemIndex);
    setEditingMeasurementIndex(measurementIndex);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingItemIndex(null);
    setEditingMeasurementIndex(null);
    setShowDeleteConfirmation(false);
  };

  const saveFromDialog = async () => {
    if (editingItemIndex !== null) {
      try {
        await saveItem(editingItemIndex);
        closeEditDialog();
      } catch (error) {
        console.error('Error saving from dialog:', error);
        // Don't close dialog on error, let user try again
      }
    }
  };

  const handleDeleteMeasurementFromDialog = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteMeasurement = async () => {
    if (editingItemIndex !== null && editingMeasurementIndex !== null) {
      await deleteMeasurementFromServer(editingItemIndex, editingMeasurementIndex);
      closeEditDialog();
    }
  };

  const cancelDeleteMeasurement = () => {
    setShowDeleteConfirmation(false);
  };



  const getCurrentScore = (competencyId: number) => {
    const competency = competencyScores.find(comp => comp.id === competencyId);
    if (!competency) return '0/5';
    return `${competency.score}/${competency.questions?.length || 0}`;
  };


  const addNewItem = () => {
    setShowAddDialog(true);
    setSelectedCompetencyId(0);
    setSelectedMeasurementId('');
    setShowCompetencySelection(true);
  };

  const confirmAddItem = async () => {
    if (!selectedCompetencyId || selectedCompetencyId === 0 || !selectedMeasurementId) {
      alert('Please select a competency and a measurement');
      return;
    }

    const competency = competencies.find(comp => comp.id === selectedCompetencyId);
    if (!competency) return;

    try {
      // Get the selected measurement index
      const measurementIndex = parseInt(selectedMeasurementId.replace('measurement-', ''));
      const action = competency.actions?.[measurementIndex];
      
      if (!action) {
        alert('Selected measurement not found');
        return;
      }

      // Create single measurement
      const selectedMeasurement = {
        id: `new-${Date.now()}`,
        text: action.measurement || 'Define specific success criteria for this competency',
        actionSteps: action.action || 'Create actionable steps to improve this competency',
        responsibleResources: [...(action.responsible || []), ...(action.resources || [])].join(', ') || 'Identify responsible parties and required resources',
        startDate: action.startDate || '7d',
        completionDate: action.endDate || '28d'
      };

      // Save to database immediately
      await savePlan({
        competencyId: selectedCompetencyId,
        measurements: [selectedMeasurement]
      });
      
      // Refresh SWR data
      await mutate();
      
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error saving development plan item:', error);
      alert('Failed to save development plan item');
    }
  };

  const selectMeasurement = (actionIndex: number) => {
    const measurementId = `measurement-${actionIndex}`;
    setSelectedMeasurementId(measurementId);
  };

  const handleCompetencySelect = (competencyId: number) => {
    setSelectedCompetencyId(competencyId);
    setShowCompetencySelection(false);
    setSelectedMeasurementId(''); // Reset measurement selection
  };

  const handleBackToCompetencySelection = () => {
    setShowCompetencySelection(true);
    setSelectedMeasurementId('');
  };

  const updateItem = (index: number, field: keyof DevelopmentPlanItem, value: string) => {
    const updatedItems = [...planItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Update competency name when competency is selected
    if (field === 'competencyId') {
      const competency = competencies.find(comp => comp.id === parseInt(value));
      if (competency) {
        updatedItems[index].competencyName = competency.label;
        updatedItems[index].currentScore = getCurrentScore(competency.id);
        
        // Only pre-fill if there are no existing measurements
        if (updatedItems[index].measurements.length === 0) {
          const actions = competency.actions || [];
          if (actions.length > 0) {
            // Get questions answered "No" for this competency
            const noAnswerQuestions = competency.questions?.filter((q: any) => answers[q.id] === 'no') || [];
            
            // Get corresponding actions for "No" answers only
            const relevantActions = noAnswerQuestions.map((question: any) => {
              const questionIndex = competency.questions?.findIndex((q: any) => q.id === question.id) || 0;
              return actions[questionIndex];
            }).filter(Boolean);

            const measurements: DevelopmentPlanMeasurement[] = relevantActions.map((action: any, actionIndex: number) => ({
              id: `measurement-${competency.id}-${actionIndex}`,
              text: action.measurement || 'Define specific success criteria for this competency',
              actionSteps: action.action || 'Create actionable steps to improve this competency',
              responsibleResources: [...(action.responsible || []), ...(action.resources || [])].join(', ') || 'Identify responsible parties and required resources',
              startDate: action.startDate || '7d',
              completionDate: action.endDate || '28d'
            }));
            
            updatedItems[index].measurements = measurements;
          }
        }
      }
    }
    
    setPlanItems(updatedItems);
  };

  const updateMeasurement = (itemIndex: number, measurementIndex: number, field: keyof DevelopmentPlanMeasurement, value: string) => {
    const updatedItems = [...planItems];
    updatedItems[itemIndex].measurements[measurementIndex] = {
      ...updatedItems[itemIndex].measurements[measurementIndex],
      [field]: value
    };
    setPlanItems(updatedItems);
  };

  const addMeasurement = (itemIndex: number) => {
    const updatedItems = [...planItems];
    const newMeasurement: DevelopmentPlanMeasurement = {
      id: `new-${Date.now()}`,
      text: 'Define specific success criteria for this competency',
      actionSteps: 'Create actionable steps to improve this competency',
      responsibleResources: 'Identify responsible parties and required resources',
      startDate: '7d',
      completionDate: '28d'
    };
    updatedItems[itemIndex].measurements.push(newMeasurement);
    setPlanItems(updatedItems);
  };

  const removeMeasurement = (itemIndex: number, measurementIndex: number) => {
    const updatedItems = [...planItems];
    updatedItems[itemIndex].measurements.splice(measurementIndex, 1);
    setPlanItems(updatedItems);
  };

  const deleteMeasurementFromServer = async (itemIndex: number, measurementIndex: number) => {
    const item = planItems[itemIndex];
    const measurement = item.measurements[measurementIndex];
    
    try {
      // Delete measurement using SWR mutation with mutate function
      await deleteMeasurement({ 
        measurementId: measurement.id,
        mutate: mutate
      });
      
      // Update local state
      removeMeasurement(itemIndex, measurementIndex);
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Failed to delete measurement');
    }
  };

  const saveItem = async (index: number) => {
    const item = planItems[index];
    if (!item.competencyId || item.competencyId === 0 || item.measurements.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(index);
      
      // Save all measurements for this competency
      await savePlan({
        competencyId: item.competencyId,
        measurements: item.measurements,
        updateMode: true // Indicate this is an update, not a new creation
      });
      
      await mutate(); // Refresh SWR data
    } catch (error) {
      console.error('Error saving development plan item:', error);
      alert('Failed to save development plan item');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteItem = (index: number) => {
    const item = planItems[index];
    
    showConfirm({
      title: 'Delete Development Plan Item',
      description: `Are you sure you want to delete the development plan for "${item.competencyName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        // Since we're using SWR, we need to delete all measurements for this competency
        // and then refresh the data
        try {
          // Delete all measurements for this competency
          const deletePromises = item.measurements.map(measurement => 
            apiFetch(`idp/development-plan/${measurement.id}`, {
              method: 'DELETE'
            })
          );
          
          await Promise.all(deletePromises);
          
          // Refresh SWR data
          await mutate();
        } catch (error) {
          console.error('Error deleting development plan item:', error);
          // Error will be handled by the UI state, no need for alert
        }
      },
    });
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.endsWith('d')) {
      const days = parseInt(dateStr.replace('d', ''));
      return days === 1 ? '1 Day' : `${days} Days`;
    }
    return dateStr;
  };


  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Individual Development Plan
            </CardTitle>
            <CardDescription>
              Edit your development objectives based on assessment results
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
            <Label htmlFor="auto-mode" className="text-sm text-muted-foreground">
                Cards
              </Label>
         
              <button
                type="button"
                onClick={() => handleSwitchChange(!switchEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  switchEnabled ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    switchEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <Label htmlFor="auto-mode" className="text-sm text-muted-foreground">
                Table
              </Label>
            </div>
            <Button onClick={addNewItem} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {switchEnabled ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competency</TableHead>
                  <TableHead>Measurement</TableHead>
                  <TableHead>Actionable Steps</TableHead>
                  <TableHead>Responsible/Resources</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planItems.map((item, itemIndex) => (
                  item.measurements.map((measurement, measurementIndex) => (
                    <TableRow key={`${itemIndex}-${measurementIndex}`}>
                      <TableCell className="font-medium">
                        {measurementIndex === 0 ? item.competencyName || 'Select Competency' : ''}
                      </TableCell>
                      <TableCell>{measurement.text}</TableCell>
                      <TableCell>{measurement.actionSteps}</TableCell>
                      <TableCell>{measurement.responsibleResources}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {measurement.startDate && formatDate(measurement.startDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {measurement.completionDate && formatDate(measurement.completionDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(itemIndex, measurementIndex)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
                {planItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No development plan items yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <p>Loading development plan...</p>
          </div>
        ) : planItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No development plan items yet.</p>
            <p className="text-sm">Add items to create your development plan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {planItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.currentScore || getCurrentScore(item.competencyId)}</Badge>
                    <span className="font-medium">{item.competencyName || 'Select Competency'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteItem(index)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {item.measurements.map((measurement, measurementIndex) => (
                    <div key={measurement.id} className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Measurement {measurementIndex + 1}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(index, measurementIndex)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Measurement:</span>
                          <p className="mt-1">{measurement.text}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Action Steps:</span>
                          <p className="mt-1">{measurement.actionSteps}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Responsible/Resources:</span>
                          <p className="mt-1">{measurement.responsibleResources}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Timeline:</span>
                          <p className="mt-1">
                            {measurement.startDate && formatDate(measurement.startDate)} - {measurement.completionDate && formatDate(measurement.completionDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Development Plan Item</DialogTitle>
            <DialogDescription>
              Select a competency and choose which measurements you want to include in your development plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Competency Selection */}
            {showCompetencySelection && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</div>
                  <label className="text-sm font-medium">Select Competency</label>
                </div>
                <div className="space-y-2">
                  {competencies
                    .filter(comp => comp.questions?.some((q: any) => answers[q.id] === 'no'))
                    .map((comp) => (
                      <div 
                        key={comp.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCompetencySelect(comp.id)}
                      >
                        <div className="font-medium">{comp.label}</div>
                        <div className="text-sm text-muted-foreground">
                          Current Score: {getCurrentScore(comp.id)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Step 2: Measurement Selection */}
            {!showCompetencySelection && selectedCompetencyId > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleBackToCompetencySelection}
                    className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center hover:bg-muted/80"
                  >
                    ←
                  </button>
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</div>
                  <label className="text-sm font-medium">Select Measurement</label>
                </div>
                
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium">
                    {competencies.find(comp => comp.id === selectedCompetencyId)?.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current Score: {getCurrentScore(selectedCompetencyId)}
                  </div>
                </div>

                <div className="space-y-3">
                  {competencies
                    .find(comp => comp.id === selectedCompetencyId)
                    ?.actions?.map((action: any, index: number) => (
                      <div 
                        key={index} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMeasurementId === `measurement-${index}` 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => selectMeasurement(index)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                            selectedMeasurementId === `measurement-${index}` 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground'
                          }`}>
                            {selectedMeasurementId === `measurement-${index}` && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="font-medium text-sm">
                              {action.measurement}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <strong>Action:</strong> {action.action}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span><strong>Start:</strong> {action.startDate || '7d'}</span>
                              <span><strong>End:</strong> {action.endDate || '28d'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAddItem}
              disabled={!selectedCompetencyId || selectedCompetencyId === 0 || !selectedMeasurementId || isSaving}
            >
              {isSaving ? 'Adding...' : 'Add to Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Measurement Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {showDeleteConfirmation ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete Measurement</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this measurement? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Measurement for: {editingItemIndex !== null && planItems[editingItemIndex]?.competencyName}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Measurement:</span>
                    <p className="mt-1">
                      {editingItemIndex !== null && editingMeasurementIndex !== null && 
                       planItems[editingItemIndex]?.measurements[editingMeasurementIndex]?.text}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Edit Measurement</DialogTitle>
                <DialogDescription>
                  Edit this specific measurement for your development plan.
                </DialogDescription>
              </DialogHeader>

              {editingItemIndex !== null && editingMeasurementIndex !== null && planItems[editingItemIndex] && planItems[editingItemIndex].measurements[editingMeasurementIndex] && (
                <div className="space-y-6">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Measurement for: {planItems[editingItemIndex].competencyName}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Measurement</label>
                        <Textarea
                          value={planItems[editingItemIndex].measurements[editingMeasurementIndex].text}
                          onChange={(e) => updateMeasurement(editingItemIndex, editingMeasurementIndex, 'text', e.target.value)}
                          placeholder="How will you measure success?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Action Steps</label>
                        <Textarea
                          value={planItems[editingItemIndex].measurements[editingMeasurementIndex].actionSteps}
                          onChange={(e) => updateMeasurement(editingItemIndex, editingMeasurementIndex, 'actionSteps', e.target.value)}
                          placeholder="What specific actions will you take?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Responsible/Resources</label>
                        <Input
                          value={planItems[editingItemIndex].measurements[editingMeasurementIndex].responsibleResources}
                          onChange={(e) => updateMeasurement(editingItemIndex, editingMeasurementIndex, 'responsibleResources', e.target.value)}
                          placeholder="Who is responsible? What resources are needed?"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Start Date</label>
                          <Input
                            value={planItems[editingItemIndex].measurements[editingMeasurementIndex].startDate}
                            onChange={(e) => updateMeasurement(editingItemIndex, editingMeasurementIndex, 'startDate', e.target.value)}
                            placeholder="e.g., 7d, 1w, 2024-01-15"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Completion Date</label>
                          <Input
                            value={planItems[editingItemIndex].measurements[editingMeasurementIndex].completionDate}
                            onChange={(e) => updateMeasurement(editingItemIndex, editingMeasurementIndex, 'completionDate', e.target.value)}
                            placeholder="e.g., 28d, 1m, 2024-02-15"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            {showDeleteConfirmation ? (
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={cancelDeleteMeasurement}>
                  Cancel
                </Button>
                     <Button
                       variant="destructive"
                       onClick={confirmDeleteMeasurement}
                       disabled={isDeleting}
                       className="flex items-center gap-2"
                     >
                       {isDeleting ? (
                         <>
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                           Deleting...
                         </>
                       ) : (
                         <>
                           <Trash2 className="h-4 w-4" />
                           Delete Measurement
                         </>
                       )}
                     </Button>
              </div>
            ) : (
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline"
                  onClick={handleDeleteMeasurementFromDialog}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeEditDialog}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveFromDialog}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Dialog Component */}
      <ConfirmDialogComponent />
    </Card>
  );
}
