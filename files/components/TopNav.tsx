'use client'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function TopNav() {
  const { user, signOut, profile } = useAuth()
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Overlap" className="w-8 h-8" />
            <span className="font-semibold">Overlap</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600">Dashboard</Link>
          <Link href="/friends" className="text-sm text-gray-600">Friends</Link>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">{profile?.display_name || profile?.username}</div>
              <button onClick={signOut} className="text-sm px-3 py-1 border rounded">Sign out</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/(auth)/signin" className="px-3 py-1 border rounded">Sign in</Link>
              <Link href="/(auth)/signup" className="px-3 py-1 bg-indigo-600 text-white rounded">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}