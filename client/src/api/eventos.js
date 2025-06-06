const API_URL = 'http://127.0.0.1:3000';
import { authStore } from '../stores/authStore';

export const eventosService = {
    /**
     * Fetches publicly available events.
     * Does not send authentication headers.
     * The backend's `_getPublicEventsList` will handle filtering for isPublic: true.
     */
    async getPublicEvents(params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 8, // Default for public listings
            sortBy: params.sortBy || 'data',
            order: params.order || 'desc', // Default to newest first for public
            ...(params.query && { query: params.query }),
            ...(params.eventType && { eventType: params.eventType }),
            ...(params.datetime && { datetime: params.datetime }),
            ...(params.location && { location: params.location }),
            // No isPublic or organizerId here, as it's for public consumption
        });

        try {
            const response = await fetch(`${API_URL}/events?${queryParams.toString()}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || 'Error fetching public events');
            }
            return data; // Expected format: { data: [], pagination: {}, links: [] }
        } catch (error) {
            console.error('API Error fetching public events:', error);
            throw error;
        }
    },

    /**
     * Fetches events for admin users.
     * Sends authentication headers.
     * The backend's `_getAllEventsForAdmin` will handle admin-specific logic.
     */
    async getAdminEvents(params = {}) {
        if (!authStore.isAdmin()) {
            // This check is a safeguard; route protection should primarily be on the backend
            // and via router guards on the frontend for the admin view itself.
            return Promise.reject(new Error('Administrator privileges required to fetch all events.'));
        }

        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 10, // Default for admin tables
            sortBy: params.sortBy || 'data',
            order: params.order || 'asc',
            ...(params.query && { query: params.query }),
            ...(params.eventType && { eventType: params.eventType }),
            ...(params.datetime && { datetime: params.datetime }),
            ...(params.location && { location: params.location }),
        });

        // Admin-specific filters
        if (params.isPublic !== undefined && params.isPublic !== '') queryParams.set('isPublic', params.isPublic);
        if (params.organizerId) queryParams.set('organizerId', params.organizerId);

        try {
            const response = await fetch(`${API_URL}/events?${queryParams.toString()}`, {
                headers: {
                    ...authStore.getAuthHeaders() // Essential for admin access
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || 'Error fetching events for admin');
            }
            return data; // Expected format: { data: [], pagination: {}, links: [] }
        } catch (error) {
            console.error('API Error fetching admin events:', error);
            throw error;
        }
    },

    /**
     * Specialized function for featured events, uses getPublicEvents.
     */
    async getFeaturedEvents(page = 0, pageSize = 4) { // Reduced pageSize for featured
        return this.getPublicEvents({
            page,
            pageSize,
            sortBy: 'data', // Or 'visualizacoes' or other relevant field for "featured"
            order: 'desc'
        });
    }
    // Keep other event-specific methods like getEventById, createEvent, updateEvent, deleteEvent as needed.
    // For example, getEventById might not need admin rights if it's a public event detail.
    // Create, update, delete would likely require auth.
};