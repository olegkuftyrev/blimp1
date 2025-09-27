import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ReactNode, useState } from "react"

interface ConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  onCancel?: () => void
  trigger?: ReactNode
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  trigger,
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={loading}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {loading ? "Loading..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Simple confirmation dialog with trigger
export function ConfirmDialogWithTrigger({
  trigger,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
}: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) {
  const [open, setOpen] = useState(false)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      onConfirm={onConfirm}
      onCancel={onCancel}
      trigger={trigger}
      loading={loading}
    />
  )
}

// Convenience hook for programmatic confirmation
export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>>()

  const showConfirm = (config: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(config)
    setOpen(true)
  }

  const ConfirmDialogComponent = () => {
    if (!config) return null

    return (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        {...config}
      />
    )
  }

  return {
    showConfirm,
    ConfirmDialogComponent,
  }
}
