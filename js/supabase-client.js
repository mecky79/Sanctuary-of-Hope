// Supabase project credentials.
// Replace these two values with your own project's URL and public anon key
// (Supabase dashboard -> Project Settings -> API). The anon key is safe to
// expose in client-side code as long as Row Level Security policies
// (see sql/schema.sql) are in place.

const SUPABASE_URL = "https://jmwwnroepasyltjkmduo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd3ducm9lcGFzeWx0amttZHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjY3MDIsImV4cCI6MjEwNDYwMjcwMn0.c6DVBBJAQ0zx3QjfibqmV7tRXOfdMwlwQ9ymUXRoIhc";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
