-- Refactor vehicles table to match new requirements
-- WARNING: This drops the existing vehicles table!

USE fleetflow_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS vehicles;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE vehicles (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name                VARCHAR(100)    NOT NULL,
    model               VARCHAR(100)    NOT NULL,
    license_plate       VARCHAR(20)     NOT NULL,
    max_load_capacity   DECIMAL(10,2)   NOT NULL DEFAULT 0,
    odometer            INT UNSIGNED    NOT NULL DEFAULT 0,
    status              ENUM('Idle', 'On Trip', 'In Shop', 'Out of Service') NOT NULL DEFAULT 'Idle',
    vehicle_type        ENUM('Truck', 'Van', 'Bike') NOT NULL DEFAULT 'Truck',
    region              VARCHAR(50)     NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_vehicles          PRIMARY KEY (id),
    CONSTRAINT uq_vehicles_plate    UNIQUE (license_plate),
    
    INDEX idx_vehicles_status (status),
    INDEX idx_vehicles_region (region),
    INDEX idx_vehicles_type (vehicle_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-seed data for the new structure
INSERT INTO vehicles (name, model, license_plate, max_load_capacity, odometer, status, vehicle_type, region) VALUES
('Titan Prime', 'Freightliner Cascadia', 'FL-001', 25000.00, 12500, 'On Trip', 'Truck', 'North'),
('Swift Box', 'Ford Transit', 'FT-202', 3500.00, 4500, 'Idle', 'Van', 'South'),
('Heavy Hauler', 'Kenworth T680', 'KW-303', 30000.00, 89200, 'In Shop', 'Truck', 'East'),
('Metro Bike', 'Electric Cargo', 'EB-404', 150.00, 1200, 'Idle', 'Bike', 'West'),
('Long Haul', 'Volvo VNL', 'VV-505', 28000.00, 156000, 'Out of Service', 'Truck', 'North');
