'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

type Profile = {
  id: string
  username: string
  display_name?: string
  college_id?: string | null
}

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // onAuthStateChange returns { data: { subscription } } in Supabase v2
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          setProfile(data || null)
        } catch (e) {
          console.error('fetch profile error', e)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    // Also hydrate initial session
    supabase.auth.getSession().then(async (res) => {
      const session = res.data.session
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          setProfile(data || null)
        } catch (e) {
          console.error('fetch profile error', e)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    }).catch((e) => {
      console.error('getSession error', e)
      setLoading(false)
    })

    // cleanup subscription
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  async function signUp({ email, password, username }: { email: string; password: string; username: string }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    if (data?.user?.id) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        display_name: username,
      })
    }
    return { data, error }
  }

  async function signIn({ email, password }: { email: string; password: string }) {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return
    await supabase.from('profiles').update(updates).eq('id', user.id)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)