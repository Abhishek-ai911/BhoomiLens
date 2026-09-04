-- ============================================================================
-- Migration: Add synthetic demo Aadhaar column to persons table
-- Adheres strictly to the approved 9-table schema without creating extra tables.
-- ============================================================================

ALTER TABLE persons ADD COLUMN IF NOT EXISTS masked_aadhaar text NULL;
