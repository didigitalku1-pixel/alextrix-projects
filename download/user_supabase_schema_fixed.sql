-- Fixed schema with DROP POLICY IF EXISTS to avoid conflicts

-- 1. Templates table
CREATE TABLE IF NOT EXISTS templates (
    id BIGINT PRIMARY KEY,
    slug TEXT, title TEXT, description TEXT, code TEXT,
    tags JSONB DEFAULT '[]', image_url TEXT,
    views BIGINT DEFAULT 0, forks BIGINT DEFAULT 0,
    premium BOOLEAN DEFAULT FALSE, private BOOLEAN DEFAULT FALSE, featured BOOLEAN DEFAULT FALSE,
    username TEXT, category TEXT, long_description TEXT, language TEXT,
    share_source_code BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
);

-- 2. Components table
CREATE TABLE IF NOT EXISTS components (
    id BIGINT PRIMARY KEY,
    slug TEXT, title TEXT, description TEXT, code TEXT,
    tags JSONB DEFAULT '[]', image_url TEXT,
    views BIGINT DEFAULT 0, forks BIGINT DEFAULT 0,
    premium BOOLEAN DEFAULT FALSE, private BOOLEAN DEFAULT FALSE, featured BOOLEAN DEFAULT FALSE,
    background TEXT, created_by TEXT,
    created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
);

-- 3. Assets table
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT PRIMARY KEY,
    slug TEXT, title TEXT, description TEXT,
    keywords JSONB DEFAULT '[]', resolution TEXT, colors JSONB DEFAULT '[]',
    image_320w TEXT, image_800w TEXT, image_1600w TEXT, image_3840w TEXT, image_original TEXT,
    media_type TEXT DEFAULT 'image',
    views BIGINT DEFAULT 0, premium BOOLEAN DEFAULT FALSE, featured BOOLEAN DEFAULT FALSE,
    created_by TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
);

-- 4. Skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY,
    title TEXT, description TEXT, content TEXT,
    tags JSONB DEFAULT '[]',
    views BIGINT DEFAULT 0, forks BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ
);

-- 5. Design MD table
CREATE TABLE IF NOT EXISTS design_md (
    id SERIAL PRIMARY KEY,
    template_id BIGINT, artifact_type TEXT, content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_md ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (avoid error)
DROP POLICY IF EXISTS "public_read_templates" ON templates;
DROP POLICY IF EXISTS "public_read_components" ON components;
DROP POLICY IF EXISTS "public_read_assets" ON assets;
DROP POLICY IF EXISTS "public_read_skills" ON skills;
DROP POLICY IF EXISTS "public_read_design_md" ON design_md;

-- Create policies
CREATE POLICY "public_read_templates" ON templates FOR SELECT USING (true);
CREATE POLICY "public_read_components" ON components FOR SELECT USING (true);
CREATE POLICY "public_read_assets" ON assets FOR SELECT USING (true);
CREATE POLICY "public_read_skills" ON skills FOR SELECT USING (true);
CREATE POLICY "public_read_design_md" ON design_md FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_views ON templates(views DESC);
CREATE INDEX IF NOT EXISTS idx_templates_premium ON templates(premium);
CREATE INDEX IF NOT EXISTS idx_components_views ON components(views DESC);
CREATE INDEX IF NOT EXISTS idx_assets_views ON assets(views DESC);

SELECT 'Schema created successfully!' as result;
