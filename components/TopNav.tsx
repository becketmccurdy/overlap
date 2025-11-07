'use client'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function TopNav() {
  const { user, signOut, profile } = useAuth()

  // Inline fallback styles ensure layout works even before Tailwind is loaded.
  return (
    <nav
      style={{
        borderBottom: '1px solid #e6e6e6',
        background: '#fff',
      }}
      aria-label="Main navigation"
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Overlap" style={{ width: 40, height: 40 }} />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Overlap</span>
          </Link>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#475569', textDecoration: 'none', fontSize: 14 }}>
              Dashboard
            </Link>
            <Link href="/friends" style={{ color: '#475569', textDecoration: 'none', fontSize: 14 }}>
              Friends
            </Link>
            {user && (
              <Link href="/settings" style={{ color: '#475569', textDecoration: 'none', fontSize: 14 }}>
                Settings
              </Link>
            )}
          </div>
        </div>

        <div>
          {user ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 14, color: '#0f172a' }}>
                {profile?.display_name || profile?.username || 'You'}
              </div>
              <button
                onClick={signOut}
                style={{
                  fontSize: 13,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                href="/(auth)/signin"
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  color: '#0f172a',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/(auth)/signup"
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: '#4f46e5',
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}