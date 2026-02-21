-- Migration to add filters (type, region) to vehicles and trips

USE fleetflow_db;

-- 1. Alter vehicles table
ALTER TABLE vehicles 
ADD COLUMN type VARCHAR(50) DEFAULT 'Semi' AFTER model,
ADD COLUMN region VARCHAR(50) DEFAULT 'North' AFTER type;

-- 2. Alter trips table
ALTER TABLE trips
ADD COLUMN region VARCHAR(50) DEFAULT 'North' AFTER destination;

-- 3. Update existing data to be more diverse for testing filters
UPDATE vehicles SET type = 'Box Truck', region = 'East' WHERE id = 3;
UPDATE vehicles SET type = 'Van', region = 'West' WHERE id = 5;
UPDATE vehicles SET type = 'Semi', region = 'South' WHERE id = 2;

UPDATE trips SET region = 'East' WHERE id = 3;
UPDATE trips SET region = 'West' WHERE id = 5;
UPDATE trips SET region = 'South' WHERE id = 2;
