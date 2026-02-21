import apiClient from './apiClient';

export const maintenanceApi = {
    /**
     * GET /api/maintenance
     * Retrieves all maintenance records.
     */
    getMaintenanceRecords: () => {
        return apiClient.get('/maintenance');
    },

    /**
     * POST /api/maintenance
     * Creates a new maintenance log.
     * @param {Object} data 
     */
    createMaintenanceRecord: (data) => {
        return apiClient.post('/maintenance', data);
    },

    /**
     * PUT /api/maintenance/:id/status
     * Updates the status of an existing maintenance log.
     * @param {number|string} id 
     * @param {String} status 
     */
    updateMaintenanceStatus: (id, status) => {
        return apiClient.put(`/maintenance/${id}/status`, { status });
    }
};
