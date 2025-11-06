'use client'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <img src="/logo.svg" alt="Overlap" className="mx-auto w-24 h-24" />
      <h1 className="text-4xl font-bold mt-6">Overlap</h1>
      <p className="mt-4 text-gray-600">
        The social calendar for young adults — quickly find when your friends are free.
      </p>
      <div className="mt-8 space-x-4">
        <Link href="/(auth)/signup" className="px-4 py-2 bg-indigo-600 text-white rounded">
          Get started
        </Link>
        <Link href="/(auth)/signin" className="px-4 py-2 border rounded">
          Sign in
        </Link>
      </div>
    </div>
  )
}