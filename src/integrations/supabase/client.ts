// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://crmiqahevqctffgfxzlh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybWlxYWhldnFjdGZmZ2Z4emxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Nzc4MzMsImV4cCI6MjA2NDM1MzgzM30.jDZLmitWu04xBviDZu0WcWw68wQ0VdhAasuh9SpzWRI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);