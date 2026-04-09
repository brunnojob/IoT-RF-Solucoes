/**
 * supabase.ts — Cliente Supabase
 * 
 * IMPORTANTE: Substitua as variáveis abaixo pelas suas credenciais do Supabase.
 * Encontre em: https://app.supabase.com → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ COLOQUE AQUI SUA URL E CHAVE ANON DO SUPABASE
const SUPABASE_URL = 'https://saglrwspvaaqjculaplg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZ2xyd3NwdmFhcWpjdWxhcGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDcyMTMsImV4cCI6MjA5MDU4MzIxM30.adXTMTTdFzArpQztW4QJ1UyW4fo4qvZJesGJOx2ymz8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Verifica se o Supabase está configurado com credenciais reais.
 * Retorna false se ainda estiver com os valores placeholder.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !SUPABASE_URL.includes('SEU_PROJETO') &&
    !SUPABASE_ANON_KEY.includes('SUA_CHAVE_ANON')
  );
}
