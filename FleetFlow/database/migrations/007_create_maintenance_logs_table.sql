-- Migration 007
-- Creates maintenance_logs table

USE fleetflow_db;

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    vehicle_id          INT UNSIGNED    NOT NULL,
    service_type        VARCHAR(100)    NOT NULL,
    description         TEXT            DEFAULT NULL,
    cost                DECIMAL(12,2)   DEFAULT 0,
    service_date        DATETIME        NOT NULL,
    status              ENUM('Scheduled', 'In Progress', 'Completed') NOT NULL DEFAULT 'Scheduled',
    next_service_due    DATETIME        DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_maintenance       PRIMARY KEY (id),
    CONSTRAINT fk_maintenance_veh   FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
