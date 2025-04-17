import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// This function creates a Supabase client with the user's session
export function createServerClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: string; secure?: boolean }) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: { path: string; domain?: string }) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}
