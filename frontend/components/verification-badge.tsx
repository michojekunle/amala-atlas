import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  status: "verified" | "pending" | "rejected" | "flagged"
  className?: string
  showIcon?: boolean
}

export function VerificationBadge({ status, className, showIcon = true }: VerificationBadgeProps) {
  const config = {
    verified: {
      icon: CheckCircle,
      text: "Verified",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    pending: {
      icon: Clock,
      text: "Pending",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    rejected: {
      icon: XCircle,
      text: "Rejected",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    flagged: {
      icon: AlertTriangle,
      text: "Flagged",
      variant: "destructive" as const,
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
  }

  const { icon: Icon, text, className: statusClassName } = config[status]

  return (
    <Badge className={cn(statusClassName, className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {text}
    </Badge>
  )
}
