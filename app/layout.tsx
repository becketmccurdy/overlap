import '../styles/globals.css'
import React from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import TopNav from '../components/TopNav'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../components/ErrorBoundary'

export const metadata = {
  title: 'Overlap - Social Availability',
  description: 'Find overlapping free times with friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <TopNav />
              <main className="container mx-auto px-4 py-6">{children}</main>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}