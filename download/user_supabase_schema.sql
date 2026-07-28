-- ============================================================================
-- Aura Library — Production-ready Supabase schema (v3, hardened)
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables needed for the Aura Library with:
--   - UNIQUE constraint on slug (lookup consistency)
--   - Foreign key from design_md to templates
--   - Trigger to auto-update updated_at
--   - RLS policies for public read + authenticated admin write
--   - Indexes on columns commonly used in WHERE/ORDER BY
-- ============================================================================

-- === Helper function: auto-update updated_at on row update ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. Templates table
-- ============================================================================
CREATE TABLE IF NOT EXISTS templates (
    id BIGINT PRIMARY KEY,
    slug TEXT,
    title TEXT,
    description TEXT,
    code TEXT,
    tags JSONB DEFAULT '[]',
    image_url TEXT,
    views BIGINT DEFAULT 0,
    forks BIGINT DEFAULT 0,
    premium BOOLEAN DEFAULT FALSE,
    private BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    username TEXT,
    category TEXT,
    long_description TEXT,
    language TEXT,
    share_source_code BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add UNIQUE constraint on slug (only if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'templates_slug_unique'
    ) THEN
        ALTER TABLE templates ADD CONSTRAINT templates_slug_unique UNIQUE (slug);
    END IF;
END$$;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS templates_updated_at ON templates;
CREATE TRIGGER templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 2. Components table
-- ============================================================================
CREATE TABLE IF NOT EXISTS components (
    id BIGINT PRIMARY KEY,
    slug TEXT,
    title TEXT,
    description TEXT,
    code TEXT,
    tags JSONB DEFAULT '[]',
    image_url TEXT,
    views BIGINT DEFAULT 0,
    forks BIGINT DEFAULT 0,
    premium BOOLEAN DEFAULT FALSE,
    private BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    background TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'components_slug_unique'
    ) THEN
        ALTER TABLE components ADD CONSTRAINT components_slug_unique UNIQUE (slug);
    END IF;
END$$;

DROP TRIGGER IF EXISTS components_updated_at ON components;
CREATE TRIGGER components_updated_at
    BEFORE UPDATE ON components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 3. Assets table
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT PRIMARY KEY,
    slug TEXT,
    title TEXT,
    description TEXT,
    keywords JSONB DEFAULT '[]',
    resolution TEXT,
    colors JSONB DEFAULT '[]',
    image_320w TEXT,
    image_800w TEXT,
    image_1600w TEXT,
    image_3840w TEXT,
    image_original TEXT,
    media_type TEXT DEFAULT 'image',
    views BIGINT DEFAULT 0,
    forks BIGINT DEFAULT 0,
    premium BOOLEAN DEFAULT FALSE,
    private BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'assets_slug_unique'
    ) THEN
        ALTER TABLE assets ADD CONSTRAINT assets_slug_unique UNIQUE (slug);
    END IF;
END$$;

DROP TRIGGER IF EXISTS assets_updated_at ON assets;
CREATE TRIGGER assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. Skills table (UUID primary key)
-- ============================================================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY,
    slug TEXT,
    title TEXT,
    description TEXT,
    content TEXT,
    tags JSONB DEFAULT '[]',
    views BIGINT DEFAULT 0,
    forks BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'skills_slug_unique'
    ) THEN
        ALTER TABLE skills ADD CONSTRAINT skills_slug_unique UNIQUE (slug);
    END IF;
END$$;

DROP TRIGGER IF EXISTS skills_updated_at ON skills;
CREATE TRIGGER skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. Design MD artifacts table (with FK to templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS design_md (
    id SERIAL PRIMARY KEY,
    template_id BIGINT,
    artifact_type TEXT CHECK (artifact_type IN ('design_md', 'recreation_prompt')),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing FK if exists, then add (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'design_md_template_fk'
    ) THEN
        ALTER TABLE design_md
            ADD CONSTRAINT design_md_template_fk
            FOREIGN KEY (template_id) REFERENCES templates(id)
            ON DELETE CASCADE;
    END IF;
END$$;

DROP TRIGGER IF EXISTS design_md_updated_at ON design_md;
CREATE TRIGGER design_md_updated_at
    BEFORE UPDATE ON design_md
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 6. Design Systems table
-- ============================================================================
CREATE TABLE IF NOT EXISTS design_systems (
    id BIGINT PRIMARY KEY,
    slug TEXT,
    title TEXT,
    description TEXT,
    content TEXT,
    preview_html TEXT,
    thumbnail_url TEXT,
    source_name TEXT,
    tags JSONB DEFAULT '[]',
    views BIGINT DEFAULT 0,
    forks BIGINT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'design_systems_slug_unique'
    ) THEN
        ALTER TABLE design_systems ADD CONSTRAINT design_systems_slug_unique UNIQUE (slug);
    END IF;
END$$;

DROP TRIGGER IF EXISTS design_systems_updated_at ON design_systems;
CREATE TRIGGER design_systems_updated_at
    BEFORE UPDATE ON design_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 7. Enable Row Level Security on all tables
-- ============================================================================
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_md ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_systems ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS Policies: public SELECT, authenticated admin INSERT/UPDATE/DELETE
-- ============================================================================
-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "public_read_templates" ON templates;
DROP POLICY IF EXISTS "public_read_components" ON components;
DROP POLICY IF EXISTS "public_read_assets" ON assets;
DROP POLICY IF EXISTS "public_read_skills" ON skills;
DROP POLICY IF EXISTS "public_read_design_md" ON design_md;
DROP POLICY IF EXISTS "public_read_design_systems" ON design_systems;

DROP POLICY IF EXISTS "admin_write_templates" ON templates;
DROP POLICY IF EXISTS "admin_write_components" ON components;
DROP POLICY IF EXISTS "admin_write_assets" ON assets;
DROP POLICY IF EXISTS "admin_write_skills" ON skills;
DROP POLICY IF EXISTS "admin_write_design_md" ON design_md;
DROP POLICY IF EXISTS "admin_write_design_systems" ON design_systems;

-- Public SELECT (anon + authenticated can read)
CREATE POLICY "public_read_templates" ON templates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_components" ON components FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_assets" ON assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_skills" ON skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_design_md" ON design_md FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_design_systems" ON design_systems FOR SELECT TO anon, authenticated USING (true);

-- Admin write (only users with user_role = 'admin' in JWT app_metadata)
-- To make a user admin: update auth.users set raw_app_meta_data = '{"user_role":"admin"}' where email = 'admin@yourdomain.com';
CREATE POLICY "admin_write_templates" ON templates
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "admin_write_components" ON components
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "admin_write_assets" ON assets
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "admin_write_skills" ON skills
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "admin_write_design_md" ON design_md
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "admin_write_design_systems" ON design_systems
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

-- ============================================================================
-- 9. Indexes for performance
-- ============================================================================
-- Slug indexes (for fast lookups)
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_components_slug ON components(slug);
CREATE INDEX IF NOT EXISTS idx_assets_slug ON assets(slug);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);
CREATE INDEX IF NOT EXISTS idx_design_systems_slug ON design_systems(slug);

-- Views (for ORDER BY views DESC)
CREATE INDEX IF NOT EXISTS idx_templates_views ON templates(views DESC);
CREATE INDEX IF NOT EXISTS idx_components_views ON components(views DESC);
CREATE INDEX IF NOT EXISTS idx_assets_views ON assets(views DESC);
CREATE INDEX IF NOT EXISTS idx_skills_views ON skills(views DESC);

-- Created_at (for ORDER BY recent)
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_components_created_at ON components(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

-- Boolean filters
CREATE INDEX IF NOT EXISTS idx_templates_premium ON templates(premium) WHERE premium = true;
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_components_premium ON components(premium) WHERE premium = true;
CREATE INDEX IF NOT EXISTS idx_components_featured ON components(featured) WHERE featured = true;

-- GIN indexes on JSONB columns (for tags=cs.{} filter)
CREATE INDEX IF NOT EXISTS idx_templates_tags_gin ON templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_components_tags_gin ON components USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_tags_gin ON skills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_design_systems_tags_gin ON design_systems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_assets_keywords_gin ON assets USING GIN(keywords);

-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_design_md_template ON design_md(template_id);
CREATE INDEX IF NOT EXISTS idx_design_md_artifact ON design_md(artifact_type);

SELECT 'Schema v3 created successfully!' as result;
