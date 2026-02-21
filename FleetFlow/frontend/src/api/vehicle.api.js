import apiClient from './apiClient';

export const vehicleApi = {
    /**
     * GET /api/vehicles
     * Retrieves all vehicles.
     */
    getVehicles: () => {
        return apiClient.get('/vehicles');
    },

    /**
     * POST /api/vehicles
     * Creates a new vehicle.
     * @param {Object} vehicleData 
     */
    createVehicle: (vehicleData) => {
        return apiClient.post('/vehicles', vehicleData);
    },

    /**
     * PUT /api/vehicles/:id
     * Updates an existing vehicle.
     * @param {number|string} id 
     * @param {Object} vehicleData 
     */
    updateVehicle: (id, vehicleData) => {
        return apiClient.put(`/vehicles/${id}`, vehicleData);
    },

    /**
     * DELETE /api/vehicles/:id
     * Soft deletes a vehicle (sets status to 'Out of Service').
     * @param {number|string} id 
     */
    deleteVehicle: (id) => {
        return apiClient.delete(`/vehicles/${id}`);
    }
};
