// Centralized Supabase config - uses user's Supabase if env vars set, falls back to aura.build
const AURA_SUPA_URL = "https://hoirqrkdgbmvpwutwuwj.supabase.co";
const AURA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c";

// User's Supabase (set via Vercel env vars)
export const SUPA_URL = process.env.USER_SUPABASE_URL || AURA_SUPA_URL;
export const SUPA_ANON = process.env.USER_SUPABASE_ANON_KEY || AURA_ANON;

// Table name mapping (user's Supabase uses different table names)
export const TABLE_MAP: Record<string, string> = {
  template: "templates",    // user's Supabase
  component: "components",  // same in both
  asset: "assets",          // same in both
  skill: "skills",          // same in both
  // Fallback to aura.build table names
  template_aura: "shared_code",
  component_aura: "components",
  asset_aura: "assets",
  skill_aura: "skills",
};

export const IS_USER_SUPABASE = !!process.env.USER_SUPABASE_URL;

export function getTable(type: string): string {
  if (IS_USER_SUPABASE) {
    return TABLE_MAP[type] || type;
  }
  // Fallback to aura.build table names
  if (type === "template") return "shared_code";
  return type + "s"; // template → templates (already handled), but for safety
}

export const SELECT_MAP: Record<string, string> = {
  template: IS_USER_SUPABASE
    ? "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,created_at"
    : "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,username,created_at",
  component: "id,slug,title,description,code,tags,image_url,views,forks,premium,private,featured,background,created_at",
  asset: IS_USER_SUPABASE
    ? "id,slug,title,description,keywords,resolution,colors,image_1600w,image_800w,image_320w,views,media_type,created_at"
    : "id,slug,title,description,keywords,resolution,colors,image_1600w,image_800w,image_320w,views,media_type,created_at",
  skill: "id,title,description,content,tags,views,forks,created_at",
};

// For DESIGN.md generation - still uses aura.build Edge Function
export const AURA_EDGE_URL = `${AURA_SUPA_URL}/functions/v1/generate-template-artifact`;
export const AURA_AUTH_URL = `${AURA_SUPA_URL}/auth/v1/token`;
