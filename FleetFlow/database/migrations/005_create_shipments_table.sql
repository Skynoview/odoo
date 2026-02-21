-- Migration 005
-- Creates drivers and shipments tables

USE fleetflow_db;

-- ── Table: drivers ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drivers (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    license_num VARCHAR(50)     NOT NULL,
    status      ENUM('Active', 'Off Duty', 'On Leave') NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_drivers       PRIMARY KEY (id),
    CONSTRAINT uq_drivers_lic   UNIQUE (license_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Table: shipments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    origin          VARCHAR(255)    NOT NULL,
    destination     VARCHAR(255)    NOT NULL,
    cargo_weight    DECIMAL(10,2)   NOT NULL,
    vehicle_id      INT UNSIGNED    DEFAULT NULL,
    driver_id       INT UNSIGNED    DEFAULT NULL,
    status          ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Draft',
    revenue         DECIMAL(12,2)   DEFAULT NULL,
    start_date      DATETIME        DEFAULT NULL,
    end_date        DATETIME        DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_shipments         PRIMARY KEY (id),
    CONSTRAINT fk_shipments_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    CONSTRAINT fk_shipments_driver  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
