import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngzkahxyraioonptmawd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nemthaHh5cmFpb29ucHRtYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTMyODcsImV4cCI6MjA5MjM4OTI4N30.eBuPX6LLXKvXd3AfbRExAohL2lOwWVZBOJWJHCyxAuo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}
