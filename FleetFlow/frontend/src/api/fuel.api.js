import apiClient from './apiClient';

export const fuelApi = {
    /**
     * POST /api/fuel
     * Logs a new fuel expense.
     * @param {Object} data 
     */
    createFuelLog: (data) => {
        return apiClient.post('/fuel', data);
    },

    /**
     * GET /api/fuel/:vehicleId
     * Fetches all fuel logs for a vehicle.
     * @param {number|string} vehicleId 
     */
    getFuelLogs: (vehicleId) => {
        return apiClient.get(`/fuel/${vehicleId}`);
    },

    /**
     * DELETE /api/fuel/:id
     * Deletes a specific fuel log.
     * @param {number|string} id 
     */
    deleteFuelLog: (id) => {
        return apiClient.delete(`/fuel/${id}`);
    }
};
