import { supabase } from './supabaseClient'

export async function registerUser({ fullName, email, password, currency, country }: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        currency,
        country,
      },
    },
  })
  return { data, error }
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function logoutUser() {
  return await supabase.auth.signOut()
}
