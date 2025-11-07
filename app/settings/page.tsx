'use client'
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/signin')
    } catch (err) {
      toast.error('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Account Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {user?.email || 'Not available'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {profile?.username || 'Not set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {profile?.display_name || 'Not set'}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/settings/profile"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <p className="text-sm text-gray-600 mb-3">
              Change your password to keep your account secure
            </p>
            <Link
              href="/forgot-password"
              className="inline-block px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {profile?.college_id ? 'Set' : 'Not set'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Update your college in the onboarding page
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-6 rounded-lg shadow border-2 border-red-200">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Sign out of your account on this device
            </p>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
