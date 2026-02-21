-- Migration 008
-- Creates fuel_logs table

USE fleetflow_db;

CREATE TABLE IF NOT EXISTS fuel_logs (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    vehicle_id      INT UNSIGNED    NOT NULL,
    liters          DECIMAL(10,2)   NOT NULL,
    cost            DECIMAL(12,2)   NOT NULL,
    fuel_date       DATETIME        NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_fuel_logs       PRIMARY KEY (id),
    CONSTRAINT fk_fuel_logs_veh   FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_fuel_logs_vehicle_id ON fuel_logs(vehicle_id);
