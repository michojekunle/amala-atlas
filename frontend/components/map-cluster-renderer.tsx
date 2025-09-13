"use client"

interface ClusterRendererProps {
  count: number
  size: "small" | "medium" | "large"
}

export function MapClusterRenderer({ count, size }: ClusterRendererProps) {
  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    medium: "w-10 h-10 text-sm",
    large: "w-12 h-12 text-base",
  }

  return <div className={`map-marker-cluster ${sizeClasses[size]}`}>{count}</div>
}
