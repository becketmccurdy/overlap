import React, { useState, useEffect } from 'react'
import { useSchedule } from '../hooks/useSchedule'
import { format } from 'date-fns'

type Block = {
  id: string
  title: string
  type: 'class' | 'work' | 'personal' | 'unavailable'
  start_time: string
  end_time: string
  days_of_week: number[]
  start_date: string
  end_date: string | null
  color: string
}

export default function AddBlockForm({
  onAdded,
  editingBlock,
  onCancelEdit,
}: {
  onAdded?: () => void
  editingBlock?: Block | null
  onCancelEdit?: () => void
}) {
  const { addBlock, updateBlock } = useSchedule()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'class' | 'work' | 'personal' | 'unavailable'>('class')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:50')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 3, 5]) // MWF
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>('')
  const [color, setColor] = useState('#7c3aed')
  const [loading, setLoading] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (editingBlock) {
      setTitle(editingBlock.title)
      setType(editingBlock.type)
      setStartTime(editingBlock.start_time.slice(0, 5))
      setEndTime(editingBlock.end_time.slice(0, 5))
      setDaysOfWeek(editingBlock.days_of_week)
      setStartDate(editingBlock.start_date)
      setEndDate(editingBlock.end_date || '')
      setColor(editingBlock.color)
    }
  }, [editingBlock])

  function toggleDay(d: number) {
    setDaysOfWeek((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title,
        type,
        start_time: startTime,
        end_time: endTime,
        days_of_week: daysOfWeek,
        start_date: startDate,
        end_date: endDate || null,
        color,
      }

      if (editingBlock) {
        await updateBlock(editingBlock.id, payload)
        onCancelEdit?.()
      } else {
        await addBlock(payload)
        // Reset form after adding
        setTitle('')
        setType('class')
        setStartTime('10:00')
        setEndTime('10:50')
        setDaysOfWeek([1, 3, 5])
        setStartDate(format(new Date(), 'yyyy-MM-dd'))
        setEndDate('')
        setColor('#7c3aed')
      }
      onAdded?.()
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    onCancelEdit?.()
    // Reset form
    setTitle('')
    setType('class')
    setStartTime('10:00')
    setEndTime('10:50')
    setDaysOfWeek([1, 3, 5])
    setStartDate(format(new Date(), 'yyyy-MM-dd'))
    setEndDate('')
    setColor('#7c3aed')
  }

  return (
    <form onSubmit={submit} className="space-y-3 mt-3">
      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />

      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="border px-2 py-1 rounded"
        >
          <option value="class">Class</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <input
          type="time"
          value={startTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="flex gap-2 text-sm flex-wrap">
        {[0, 1, 2, 3, 4, 5, 6].map((d) => {
          const active = daysOfWeek.includes(d)
          return (
            <button
              type="button"
              key={d}
              onClick={() => toggleDay(d)}
              className={`px-2 py-1 rounded border ${
                active ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-white'
              }`}
              aria-pressed={active}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={startDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="color"
          value={color}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
          className="w-10 h-10 p-0 rounded border"
          aria-label="Color"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading
            ? editingBlock
              ? 'Updating...'
              : 'Adding...'
            : editingBlock
            ? 'Update block'
            : 'Add block'}
        </button>
        {editingBlock && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}