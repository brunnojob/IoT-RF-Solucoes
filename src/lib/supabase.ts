import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngzkahxyraioonptmawd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_D6MsiNnKgrENOOB6sc5Xig_Lk7lD0yu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}
