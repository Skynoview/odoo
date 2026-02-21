import apiClient from './apiClient';

export const tripApi = {
    /**
     * GET /api/trips
     * Retrieves all trips.
     */
    getTrips: () => {
        return apiClient.get('/trips');
    },

    /**
     * POST /api/trips
     * Creates a new trip.
     * @param {Object} tripData 
     */
    createTrip: (tripData) => {
        return apiClient.post('/trips', tripData);
    },

    /**
     * PUT /api/trips/:id/status
     * Updates the status of an existing trip.
     * @param {number|string} id 
     * @param {String} status 
     */
    updateTripStatus: (id, status) => {
        return apiClient.put(`/trips/${id}/status`, { status });
    }
};
