import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://xxdzddbaqyvcdjopxmjy.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZHpkZGJhcXl2Y2Rqb3B4bWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTg2MDUsImV4cCI6MjA5MTI5NDYwNX0.wtdns5FUILFwJvQkhlVEQ6hRiD6dP4QjXHBJ7xyT_0c'
);
