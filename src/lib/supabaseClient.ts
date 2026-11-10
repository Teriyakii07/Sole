import { createClient } from '@supabase/supabase-js';

const env = (import.meta as ImportMeta & {
  env: Record<string, string | undefined>;
}).env;

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);