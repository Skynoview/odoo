/**
 * FleetFlow — Health API service
 *
 * Thin wrapper around apiClient for the /health endpoints.
 * Each module (vehicles, drivers, trips, …) will get its own service file here.
 */

import apiClient from './apiClient';

export const healthApi = {
    /** Check that the API server is alive */
    ping: () => apiClient.get('/health'),

    /** Check that the database is reachable */
    checkDb: () => apiClient.get('/health/db'),
};
