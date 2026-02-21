-- ============================================================
-- FleetFlow — MySQL Database Initialisation Script
-- ============================================================
-- Run this once to create the database and a dedicated user.
-- ============================================================

-- 1. Create database
CREATE DATABASE IF NOT EXISTS fleetflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. (Optional) Create a dedicated app user instead of using root
--    Replace 'your_password' with a strong password.
-- CREATE USER IF NOT EXISTS 'fleetflow_app'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON fleetflow_db.* TO 'fleetflow_app'@'localhost';
-- FLUSH PRIVILEGES;

USE fleetflow_db;

-- ============================================================
-- Table: users
-- Purpose: Authentication & role-based authorisation
-- ============================================================
CREATE TABLE IF NOT EXISTS users (

  -- Primary Key
  id            INT UNSIGNED        NOT NULL AUTO_INCREMENT,

  -- Identity
  name          VARCHAR(120)        NOT NULL,
  email         VARCHAR(255)        NOT NULL,

  -- Auth (stores bcrypt hash — never plain text)
  password      VARCHAR(255)        NOT NULL,

  -- Role-based access control
  role          ENUM(
                  'FleetManager',
                  'Dispatcher',
                  'SafetyOfficer',
                  'FinancialAnalyst'
                )                   NOT NULL DEFAULT 'Dispatcher',

  -- Account state (soft-delete friendly)
  is_active     TINYINT(1)          NOT NULL DEFAULT 1,

  -- Auditing timestamps
  created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,

  -- ── Constraints ────────────────────────────────────────────────────────
  CONSTRAINT pk_users               PRIMARY KEY (id),
  CONSTRAINT uq_users_email         UNIQUE      (email),

  -- Email format sanity check (MySQL 8.0.16+)
  CONSTRAINT chk_users_email_format CHECK (email LIKE '%_@_%._%'),

  -- Name must not be blank
  CONSTRAINT chk_users_name_nonempty CHECK (CHAR_LENGTH(TRIM(name)) > 0)

) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Authentication & authorisation users';

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Fast single-role lookups (e.g. "get all FleetManagers")
CREATE INDEX IF NOT EXISTS idx_users_role
  ON users (role);

-- Fast active-user filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active
  ON users (is_active);

-- Composite: most common query — active users by role
CREATE INDEX IF NOT EXISTS idx_users_role_active
  ON users (role, is_active);

-- Chronological ordering / reporting
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at);

-- Future modules (vehicles, drivers…) will be added here
-- ── End of schema ─────────────────────────────────────────────────────────────

SELECT 'FleetFlow database schema applied successfully ✅' AS message;

