import apiClient from './apiClient';

export const financeApi = {
    /**
     * GET /api/finance/vehicle-cost/:vehicleId
     * Fetches the cost breakdown (fuel, maintenance, etc.) for a specific vehicle.
     * @param {number|string} vehicleId 
     */
    getVehicleCosts: (vehicleId) => {
        return apiClient.get(`/finance/vehicle-cost/${vehicleId}`);
    }
};
