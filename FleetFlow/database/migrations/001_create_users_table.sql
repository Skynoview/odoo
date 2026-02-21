-- ============================================================
-- Migration: 001_create_users_table.sql
-- Description: Authentication users table
-- Created: 2026-02-21
-- ============================================================

USE fleetflow_db;

-- ── Users Table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (

  -- Primary Key
  id            INT UNSIGNED        NOT NULL AUTO_INCREMENT,

  -- Identity
  name          VARCHAR(120)        NOT NULL,
  email         VARCHAR(255)        NOT NULL,

  -- Auth
  password      VARCHAR(255)        NOT NULL,          -- stores bcrypt hash

  -- Role-based access control
  role          ENUM(
                  'FleetManager',
                  'Dispatcher',
                  'SafetyOfficer',
                  'FinancialAnalyst'
                )                   NOT NULL DEFAULT 'Dispatcher',

  -- Soft-delete / account state
  is_active     TINYINT(1)          NOT NULL DEFAULT 1,

  -- Auditing
  created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,

  -- ── Constraints ──────────────────────────────────────────────────────────
  CONSTRAINT pk_users               PRIMARY KEY (id),
  CONSTRAINT uq_users_email         UNIQUE      (email)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Authentication & authorisation users';

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fast role-based lookups (e.g. "find all FleetManagers")
CREATE INDEX idx_users_role
  ON users (role);

-- Fast active-user filtering
CREATE INDEX idx_users_is_active
  ON users (is_active);

-- Composite: most common query pattern — active users by role
CREATE INDEX idx_users_role_active
  ON users (role, is_active);

-- Created-at for chronological ordering/reporting
CREATE INDEX idx_users_created_at
  ON users (created_at);

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT
  COLUMN_NAME        AS `Column`,
  COLUMN_TYPE        AS `Type`,
  IS_NULLABLE        AS `Nullable`,
  COLUMN_DEFAULT     AS `Default`,
  COLUMN_KEY         AS `Key`,
  EXTRA              AS `Extra`
FROM
  INFORMATION_SCHEMA.COLUMNS
WHERE
  TABLE_SCHEMA = 'fleetflow_db'
  AND TABLE_NAME  = 'users'
ORDER BY
  ORDINAL_POSITION;
