'use client'
import React, { useState } from 'react'
import { useSchedule } from '../hooks/useSchedule'
import { format } from 'date-fns'

export default function AddBlockForm({ onAdded }: { onAdded?: () => void }) {
  const { addBlock } = useSchedule()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'class' | 'work' | 'personal' | 'unavailable'>('class')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:50')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1,3,5]) // MWF
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState('')
  const [color, setColor] = useState('#7c3aed')
  const [loading, setLoading] = useState(false)

  function toggleDay(d: number) {
    setDaysOfWeek((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await addBlock({
        title,
        type,
        start_time: startTime,
        end_time: endTime,
        days_of_week: daysOfWeek,
        start_date: startDate,
        end_date: endDate || null,
        color,
      })
      setTitle('')
      onAdded?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 mt-3">
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border px-3 py-2 rounded" />
      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="border px-2 py-1 rounded">
          <option value="class">Class</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border px-2 py-1 rounded" />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border px-2 py-1 rounded" />
      </div>
      <div className="flex gap-2 text-sm">
        {[0,1,2,3,4,5,6].map((d) => (
          <button type="button" key={d} onClick={() => toggleDay(d)} className={`px-2 py-1 border rounded ${daysOfWeek.includes(d) ? 'bg-indigo-50' : ''}`}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 rounded" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-3 py-2 bg-indigo-600 text-white rounded">
          {loading ? 'Adding...' : 'Add block'}
        </button>
      </div>
    </form>
  )
}