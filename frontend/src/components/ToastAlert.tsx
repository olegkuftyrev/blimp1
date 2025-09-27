import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ToastAlertProps {
  id?: string
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info"
  duration?: number // Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
  onClose?: () => void
  closable?: boolean
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
    iconClassName: "text-green-600 dark:text-green-400"
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    iconClassName: "text-red-600 dark:text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
    iconClassName: "text-yellow-600 dark:text-yellow-400"
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
    iconClassName: "text-blue-600 dark:text-blue-400"
  }
}

export function ToastAlert({
  id,
  title,
  description,
  variant = "info",
  duration = 5000,
  onClose,
  closable = true
}: ToastAlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = variantConfig[variant]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <Alert className={`${config.className} relative pr-12`} role="alert">
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <AlertTitle className="font-medium">{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-1">
          {description}
        </AlertDescription>
      )}
      {closable && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 h-6 w-6 p-0 hover:bg-transparent"
          onClick={handleClose}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  )
}

// Hook for managing multiple toast alerts
export function useToastAlerts() {
  const [alerts, setAlerts] = useState<ToastAlertProps[]>([])

  const addAlert = (alert: Omit<ToastAlertProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newAlert = { ...alert, id }
    
    setAlerts(prev => [...prev, newAlert])
    
    return id
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const clearAll = () => {
    setAlerts([])
  }

  const ToastContainer = () => {
    if (alerts.length === 0) return null

    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {alerts.map((alert) => (
          <ToastAlert
            key={alert.id}
            {...alert}
            onClose={() => removeAlert(alert.id!)}
          />
        ))}
      </div>
    )
  }

  return {
    addAlert,
    removeAlert,
    clearAll,
    ToastContainer
  }
}

// Convenience functions for common alert types
export const toast = {
  success: (title: string, description?: string) => ({
    title,
    description,
    variant: "success" as const,
    duration: 4000
  }),
  error: (title: string, description?: string) => ({
    title,
    description,
    variant: "error" as const,
    duration: 6000
  }),
  warning: (title: string, description?: string) => ({
    title,
    description,
    variant: "warning" as const,
    duration: 5000
  }),
  info: (title: string, description?: string) => ({
    title,
    description,
    variant: "info" as const,
    duration: 4000
  })
}
