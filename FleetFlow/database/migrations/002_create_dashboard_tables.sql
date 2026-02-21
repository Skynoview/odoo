-- Add Vehicles and Trips tables to the schema

USE fleetflow_db;

-- ── Table: vehicles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    make            VARCHAR(50)     NOT NULL,
    model           VARCHAR(50)     NOT NULL,
    license_plate   VARCHAR(20)     NOT NULL,
    status          ENUM('active', 'maintenance', 'out_of_service') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_vehicles          PRIMARY KEY (id),
    CONSTRAINT uq_vehicles_plate    UNIQUE (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Table: trips ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    vehicle_id      INT UNSIGNED    DEFAULT NULL,
    status          ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    destination     VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_trips             PRIMARY KEY (id),
    CONSTRAINT fk_trips_vehicle     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed Data ──────────────────────────────────────────────────────────────
-- Insert some vehicles
INSERT INTO vehicles (make, model, license_plate, status) VALUES
('Freightliner', 'Cascadia', 'FL-001', 'active'),
('Kenworth', 'T680', 'KW-202', 'active'),
('Volvo', 'VNL 860', 'VV-303', 'maintenance'),
('Peterbilt', '579', 'PB-404', 'active'),
('International', 'LT Series', 'IN-505', 'out_of_service');

-- Insert some trips
INSERT INTO trips (vehicle_id, status, destination) VALUES
(1, 'in_progress', 'Chicago, IL'),
(2, 'in_progress', 'Dallas, TX'),
(NULL, 'pending', 'Miami, FL'),
(4, 'completed', 'Seattle, WA'),
(NULL, 'pending', 'New York, NY');
