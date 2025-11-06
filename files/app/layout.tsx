import './styles/globals.css'
import React from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import TopNav from '../components/TopNav'

export const metadata = {
  title: 'Overlap - Social Availability',
  description: 'Find overlapping free times with friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <TopNav />
            <main className="container mx-auto px-4 py-6">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}