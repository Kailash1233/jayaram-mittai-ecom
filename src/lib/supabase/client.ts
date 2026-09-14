import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== "your_supabase_project_url" &&
    supabaseAnonKey !== "your_supabase_anon_key" &&
    supabaseUrl.startsWith("https://")
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return dummy client with safe defaults if placeholders not filled yet
    return createBrowserClient<Database>(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    );
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

export const supabase = createClient();
