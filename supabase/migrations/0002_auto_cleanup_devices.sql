-- ============================================================================
-- Migration 0002: Auto-cleanup of idle devices (older than 30 days)
-- ============================================================================
-- This migration creates a database function that auto-deactivates devices
-- which have not been seen for >30 days. It also schedules it via pg_cron
-- (Supabase's built-in job scheduler, free, runs daily at 03:00 UTC).
--
-- IMPORTANT: pg_cron must be enabled on your Supabase project.
-- Dashboard → Database → Extensions → enable "pg_cron"
--
-- The API endpoint /api/cron/cleanup-devices is the backup trigger
-- (in case pg_cron is not available). Both can run safely in parallel —
-- the cleanup is idempotent.
-- ============================================================================

-- ============================================================================
-- 1. Create the cleanup function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_idle_devices(
  idle_days INTEGER DEFAULT 30,
  batch_size INTEGER DEFAULT 500
)
RETURNS TABLE(
  cleaned_count INTEGER,
  licenses_updated INTEGER,
  cutoff_timestamp TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ := now() - (idle_days || ' days')::INTERVAL;
  v_cleaned INTEGER := 0;
  v_licenses_updated INTEGER := 0;
  v_device RECORD;
  v_current_device_ids TEXT[];
  v_new_device_ids TEXT[];
  v_new_active_count INTEGER;
BEGIN
  -- Loop through stale devices in batches
  FOR v_device IN
    SELECT ld.id, ld.license_id, ld.device_id
    FROM public.license_devices ld
    WHERE ld.deactivated_at IS NULL
      AND ld.last_seen_at < v_cutoff
    LIMIT batch_size
  LOOP
    -- Mark device as deactivated
    UPDATE public.license_devices
    SET deactivated_at = now()
    WHERE id = v_device.id;

    v_cleaned := v_cleaned + 1;

    -- Sync the licenses table (remove device_id from array, decrement counter)
    SELECT device_ids, active_devices
      INTO v_current_device_ids, v_new_active_count
    FROM public.licenses
    WHERE id = v_device.license_id;

    IF v_current_device_ids IS NOT NULL THEN
      v_new_device_ids := ARRAY(
        SELECT unnest(v_current_device_ids) WHERE unnest != v_device.device_id
      );
      v_new_active_count := GREATEST(0, COALESCE(v_new_active_count, 0) - 1);

      UPDATE public.licenses
      SET device_ids = v_new_device_ids,
          active_devices = v_new_active_count,
          updated_at = now()
      WHERE id = v_device.license_id;

      v_licenses_updated := v_licenses_updated + 1;
    END IF;
  END LOOP;

  RETURN QUERY
    SELECT v_cleaned, v_licenses_updated, v_cutoff;
END;
$$;

-- Grant execute permission to authenticated users (so API can call it via RPC)
GRANT EXECUTE ON FUNCTION public.cleanup_idle_devices(INTEGER, INTEGER) TO authenticated, service_role;

-- ============================================================================
-- 2. Schedule daily cleanup via pg_cron (Supabase extension)
-- ============================================================================
-- Run daily at 03:00 UTC (= 10:00 WIB)
-- To enable pg_cron first: Dashboard → Database → Extensions → enable "pg_cron"
-- Then uncomment the lines below and run them via Supabase SQL Editor.

-- Schedule cleanup job (idempotent — check if exists first)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'alextrix-cleanup-idle-devices'
  ) THEN
    -- Already scheduled — reschedule to ensure latest cron expression
    UPDATE cron.job
    SET schedule = '0 3 * * *'
    WHERE jobname = 'alextrix-cleanup-idle-devices';
  ELSE
    PERFORM cron.schedule(
      'alextrix-cleanup-idle-devices',  -- job name
      '0 3 * * *',                       -- cron: daily at 03:00 UTC
      $$SELECT * FROM public.cleanup_idle_devices(30, 500);$$
    );
  END IF;
END $$;

-- ============================================================================
-- 3. Verify (run manually after migration)
-- ============================================================================
-- SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'alextrix-cleanup-idle-devices';

-- To test the function manually:
-- SELECT * FROM public.cleanup_idle_devices(30, 500);

-- To unschedule (if needed):
-- PERFORM cron.unschedule('alextrix-cleanup-idle-devices');
