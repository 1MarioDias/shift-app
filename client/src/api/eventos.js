const API_URL = 'http://127.0.0.1:3000';

import { authStore } from '../stores/authStore'; // Adjust path if needed

export const eventosService = {
    async getFeaturedEvents(page = 0, pageSize = 8) { // This is for public/featured events
        const queryParams = new URLSearchParams({
            page,
            pageSize,
            sortBy: 'data', // Or 'visualizacoes' or other relevant field
            order: 'desc'  // Typically featured are newest or most popular
        });
        // This call does not send auth headers by default, backend handles public data
        const response = await fetch(`${API_URL}/events?${queryParams.toString()}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errorMessage || errorData.error || 'Error fetching featured events');
        }
        return response.json();
    },

    // Renamed to reflect it can fetch events with admin privileges if logged in as admin
    // Or public events if not logged in / not admin
    async getAllEvents(params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 10,
            sortBy: params.sortBy || 'data',
            order: params.order || 'asc',
            ...(params.query && { query: params.query }),
            ...(params.eventType && { eventType: params.eventType }),
            ...(params.datetime && { datetime: params.datetime }),
            ...(params.location && { location: params.location }),
        });

        // For admin-specific filters, only add if admin is making the request
        if (authStore.isAdmin()) {
            if (params.isPublic !== undefined) queryParams.set('isPublic', params.isPublic);
            if (params.organizerId) queryParams.set('organizerId', params.organizerId);
        }
        
        try {
            // Always send auth headers if available; backend will use them if user is admin
            const response = await fetch(`${API_URL}/events?${queryParams.toString()}`, {
                headers: {
                    ...authStore.getAuthHeaders() // Sends token if admin is logged in
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || 'Error fetching events');
            }
            return data;
        } catch (error) {
            console.error('API Error fetching all events:', error);
            throw error;
        }
    }
};