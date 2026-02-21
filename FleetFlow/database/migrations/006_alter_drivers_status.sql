-- Migration 006
-- Alter drivers ENUM status to match new business requirements

USE fleetflow_db;

ALTER TABLE drivers MODIFY COLUMN status ENUM('Available', 'Assigned', 'Off Duty', 'On Leave') NOT NULL DEFAULT 'Available';
