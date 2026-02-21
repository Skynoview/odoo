-- Migration 009
-- Alter drivers schema and add driver_incidents

USE fleetflow_db;

-- Rename license_num and add columns to drivers
ALTER TABLE drivers 
    CHANGE COLUMN license_num license_number VARCHAR(50) NOT NULL,
    ADD COLUMN license_expiry DATE,
    ADD COLUMN safety_score INT NOT NULL DEFAULT 100,
    ADD COLUMN region VARCHAR(100),
    MODIFY COLUMN status ENUM('On Duty', 'Off Duty', 'Suspended') NOT NULL DEFAULT 'On Duty';

-- Add index on license_expiry    
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);

-- Create table for driver incidents
CREATE TABLE IF NOT EXISTS driver_incidents (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    driver_id       INT UNSIGNED    NOT NULL,
    description     TEXT            NOT NULL,
    incident_date   DATETIME        NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_driver_incidents PRIMARY KEY (id),
    CONSTRAINT fk_incident_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update previously inserted drivers to have a valid future expiry to avoid complete breakage.
UPDATE drivers SET license_expiry = DATE_ADD(CURRENT_DATE, INTERVAL 1 YEAR) WHERE license_expiry IS NULL;
