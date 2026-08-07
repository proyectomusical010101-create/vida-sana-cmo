import { createClient } from '@supabase/supabase-js';

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Eliminar cualquier espacio en blanco interno accidental (ej: 'https:// fmnf...')
rawUrl = rawUrl.replace(/\s+/g, '');
rawKey = rawKey.replace(/\s+/g, '');

// Sanitizar comillas accidentales puestas en Vercel
rawUrl = rawUrl.replace(/^["']|["']$/g, '');
rawKey = rawKey.replace(/^["']|["']$/g, '');

// Si falta el protocolo https://, agregarlo automáticamente
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

// Remover slash final si existe
if (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}

export const supabase = (rawUrl && rawKey)
  ? createClient(rawUrl, rawKey)
  : null;
