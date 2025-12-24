
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION:
 * Project URL: https://vqdqqordjsfvthwditrfw.supabase.co
 */
const supabaseUrl: string = 'https://vqdqqordjsfvthwditrfw.supabase.co'; 
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZHFvcmRqc2Z2dGh3ZGl0cmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTk5NTAsImV4cCI6MjA4MTczNTk1MH0.ujKbnLUSGXdnfnGlT6xmX6lZlx8QMyQb76SmFwKzTNA'; 

// Improved helper to determine if Supabase is ready
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.includes('supabase.co') &&
  supabaseKey.length > 20
);

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Operation Error:', error.message || error);
  return error;
};
