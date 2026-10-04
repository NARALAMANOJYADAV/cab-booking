import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Supabase] Initialized Supabase backend client successfully.');
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Running in local fallback mode.');
}

/**
 * Returns true if Supabase credentials are configured in .env
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

/**
 * Get the Supabase client instance (with service role / elevated permissions for backend operations)
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file.'
    );
  }
  return supabase;
};

/**
 * Helper: Upload a document (Driver KYC, dispute screenshot) to Supabase Storage
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`[Supabase Storage] Error uploading to ${bucketName}/${filePath}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export { supabase };
