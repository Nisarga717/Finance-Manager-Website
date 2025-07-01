// src/context/authContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface AuthContextType {
  user: any
  register: (formData: any) => Promise<boolean>
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const register = async (formData: any) => {
    const { email, password, fullName, currency, country } = formData

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !signUpData.user) {
      console.error('SignUp error:', signUpError)
      return false
    }

    // Insert into custom `users` table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: signUpData.user.id,
        email,
        full_name: fullName,
        password, // optional — you can remove this for security reasons
        currency,
        country,
      },
    ])

    if (insertError) {
      console.error('Insert error:', insertError)
      return false
    }

    setUser(signUpData.user)
    return true
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login error:', error)
      return false
    }
    setUser(data.user)
    return true
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)!
