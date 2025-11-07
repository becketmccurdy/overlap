'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function OnboardingPage() {
  const { profile, updateProfile, user } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState(profile?.username || '')
  const [college, setCollege] = useState(profile?.college_id || '')
  const [loading, setLoading] = useState(false)
  const [colleges, setColleges] = useState<any[]>([])

  useEffect(() => {
    if (!user) router.replace('/(auth)/signin')
  }, [user, router])

  useEffect(() => {
    // Fetch colleges from database
    async function loadColleges() {
      const { data } = await supabase
        .from('colleges')
        .select('id, name, city, state')
        .order('name')
      setColleges(data || [])
    }
    loadColleges()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile({
        username,
        college_id: college || null,
      })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold">Welcome — finish setting up</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block">
          <div className="text-sm text-gray-600">Username</div>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </label>
        <label className="block">
          <div className="text-sm text-gray-600">College (optional)</div>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Select a college --</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.city}, {c.state}
              </option>
            ))}
          </select>
          {colleges.length === 0 && (
            <div className="text-xs text-gray-400 mt-1">Loading colleges...</div>
          )}
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              // preset MWF 10:00–10:50 onboarding helper note
              alert('Preset schedules will be added in-app. For now, add them on dashboard.')
            }}
            className="px-3 py-2 border rounded"
          >
            Add class presets
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}