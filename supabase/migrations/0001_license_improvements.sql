-- ============================================================================
-- Migration 0001: License system improvements
-- ============================================================================
-- This migration:
--   1. Sets default max_devices = 10 for all new licenses
--   2. Updates existing licenses to max_devices = 10 (except admin/test licenses)
--   3. Inserts 5 admin licenses (ALX-ADMIN-001-LIFETIME-01 through -05)
--   4. Inserts/updates test license ALX-TEST-TEST-TEST-TEST
-- ============================================================================

-- ============================================================================
-- 1. Set default max_devices = 10 on the table
-- ============================================================================
ALTER TABLE public.licenses
  ALTER COLUMN max_devices SET DEFAULT 10;

-- ============================================================================
-- 2. Update existing regular buyer licenses to max_devices = 10
--    (Keep admin/test licenses at their high limit)
-- ============================================================================
UPDATE public.licenses
SET max_devices = 10,
    updated_at = now()
WHERE license_key NOT LIKE 'ALX-ADMIN-%'
  AND license_key NOT LIKE 'ALX-TEST-%'
  AND max_devices < 10;

-- ============================================================================
-- 3. Insert 5 admin licenses (idempotent — uses ON CONFLICT)
-- ============================================================================
INSERT INTO public.licenses (
  license_key,
  email,
  status,
  price,
  currency,
  max_devices,
  midtrans_order_id,
  device_ids,
  active_devices
) VALUES
  ('ALX-ADMIN-001-LIFETIME-01', 'admin01@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-001', '{}', 0),
  ('ALX-ADMIN-002-LIFETIME-02', 'admin02@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-002', '{}', 0),
  ('ALX-ADMIN-003-LIFETIME-03', 'admin03@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-003', '{}', 0),
  ('ALX-ADMIN-004-LIFETIME-04', 'admin04@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-004', '{}', 0),
  ('ALX-ADMIN-005-LIFETIME-05', 'admin05@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-005', '{}', 0)
ON CONFLICT (license_key) DO UPDATE
SET max_devices = 999,
    status = 'active',
    updated_at = now();

-- ============================================================================
-- 4. Insert/Update test license (for development + QA)
-- ============================================================================
INSERT INTO public.licenses (
  license_key,
  email,
  status,
  price,
  currency,
  max_devices,
  midtrans_order_id,
  device_ids,
  active_devices
) VALUES
  ('ALX-TEST-TEST-TEST-TEST', 'test@alextrix.dev', 'active', 0, 'IDR', 999, 'TEST-LICENSE', '{}', 0)
ON CONFLICT (license_key) DO UPDATE
SET max_devices = 999,
    status = 'active',
    updated_at = now();

-- ============================================================================
-- Verification queries (run manually to confirm)
-- ============================================================================
-- SELECT license_key, email, status, max_devices FROM licenses
-- WHERE license_key LIKE 'ALX-ADMIN-%' OR license_key LIKE 'ALX-TEST-%'
-- ORDER BY license_key;
