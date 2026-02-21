import apiClient from './apiClient';

export const driverApi = {
    /**
     * GET /api/drivers
     * Retrieves all drivers.
     */
    getDrivers: () => {
        return apiClient.get('/drivers');
    },

    /**
     * GET /api/drivers/performance/:id
     * Gets performance data for a driver
     */
    getDriverPerformance: (id) => {
        return apiClient.get(`/drivers/performance/${id}`);
    },

    /**
     * PUT /api/drivers/:id/status
     * Changes a driver's active status.
     */
    updateDriverStatus: (id, status) => {
        return apiClient.put(`/drivers/${id}/status`, { status });
    }
};
