import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200'
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} style={style} />
}

export function FriendListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 border rounded shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" height={16} />
              <Skeleton width="60%" height={12} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton width={60} height={16} />
              <Skeleton width={60} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ScheduleBlockSkeleton() {
  return (
    <div className="mt-4 space-y-2">
      <Skeleton width="40%" height={16} className="mb-2" />
      {[1, 2].map((i) => (
        <div key={i} className="p-3 border rounded bg-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={12} height={12} />
                <Skeleton width="50%" height={14} />
              </div>
              <Skeleton width="70%" height={12} />
              <Skeleton width="60%" height={12} />
            </div>
            <div className="flex gap-2">
              <Skeleton width={40} height={16} />
              <Skeleton width={50} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function WeekTimelineSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={20} />
        <div className="flex gap-4">
          <Skeleton width={100} height={32} />
          <Skeleton width={80} height={32} />
        </div>
      </div>
      <div className="border rounded p-4 bg-gray-50">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} height={24} />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={60} />
          ))}
        </div>
      </div>
    </div>
  )
}
