/**
 * FleetFlow — Dashboard API Service
 */

import apiClient from './apiClient';

export const dashboardApi = {
    /**
     * GET /api/dashboard/summary
     * @param {Object} filters
     */
    getSummary: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.vehicleType) params.append('vehicleType', filters.vehicleType);
        if (filters.status) params.append('status', filters.status);
        if (filters.region) params.append('region', filters.region);

        return apiClient.get(`/dashboard/summary?${params.toString()}`);
    }
};
