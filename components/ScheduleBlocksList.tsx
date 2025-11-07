'use client'
import React, { useState } from 'react'
import { format } from 'date-fns'

type Block = {
  id: string
  title: string
  type: string
  start_time: string
  end_time: string
  days_of_week: number[]
  start_date: string
  end_date: string | null
  color: string
}

export default function ScheduleBlocksList({
  blocks,
  onEdit,
  onDelete,
}: {
  blocks: Block[]
  onEdit: (block: Block) => void
  onDelete: (id: string) => void
}) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  async function handleDelete(block: Block) {
    if (!confirm(`Delete "${block.title}"?`)) return

    setDeleting(block.id)
    try {
      await onDelete(block.id)
    } finally {
      setDeleting(null)
    }
  }

  if (blocks.length === 0) {
    return <div className="text-sm text-gray-500 mt-4">No schedule blocks yet</div>
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium text-sm">Your schedule blocks:</h4>
      {blocks.map((block) => (
        <div
          key={block.id}
          className="p-3 border rounded bg-white hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: block.color }}
                  aria-label="Block color"
                />
                <span className="font-medium text-sm">{block.title}</span>
                <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-100">
                  {block.type}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)} •{' '}
                {block.days_of_week.map((d) => dayNames[d]).join(', ')}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {format(new Date(block.start_date), 'MMM d, yyyy')}
                {block.end_date && ` - ${format(new Date(block.end_date), 'MMM d, yyyy')}`}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(block)}
                className="text-xs text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                disabled={deleting === block.id}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(block)}
                disabled={deleting === block.id}
                className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400"
              >
                {deleting === block.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
