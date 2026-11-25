// Client-side fetch that attaches the logged-in user's Supabase token to API calls.
import { supabase } from './supabase'

export async function authFetch(url, options = {}) {
  let token = ''
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    token = data?.session?.access_token || ''
  }
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
}
