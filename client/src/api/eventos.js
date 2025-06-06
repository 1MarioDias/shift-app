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
    },
    // Keep other event-specific methods like getEventById, createEvent, updateEvent, deleteEvent as needed.
    // For example, getEventById might not need admin rights if it's a public event detail.
    // Create, update, delete would likely require auth.

    async getEventById(eventId) {
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                headers: {
                    ...authStore.getAuthHeaders() // Send auth token if available
                }
            });
            if (!response.ok) {
                let errorPayload = { message: `Error fetching event ${eventId}. Status: ${response.status}` };
                try {
                    const errorData = await response.json();
                    errorPayload.message = errorData.errorMessage || errorData.error || errorPayload.message;
                } catch (e) {
                    console.warn(`Could not parse error response JSON for GET event ${eventId}.`, e);
                    if(response.statusText) errorPayload.message = response.statusText;
                }
                throw new Error(errorPayload.message);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error fetching event ${eventId}:`, error.message || error);
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(String(error) || `An unknown error occurred while fetching event ${eventId}.`);
            }
        }
    },

    /**
     * Updates specific fields of an event (PATCH).
     * Requires admin privileges (or event creator, handled by backend).
     */
    async patchEvent(eventId, eventData) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject(new Error('Authentication required.'));
        }
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authStore.getAuthHeaders()
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                let errorPayload = { message: `Error updating event ${eventId}. Status: ${response.status}` };
                try {
                    const errorData = await response.json();
                    errorPayload.message = errorData.errorMessage || errorData.error || errorPayload.message;
                } catch (e) {
                    console.warn(`Could not parse error response JSON for PATCH event ${eventId}.`, e);
                    if(response.statusText) errorPayload.message = response.statusText;
                }
                throw new Error(errorPayload.message);
            }
            return await response.json(); // Parse JSON only on success
        } catch (error) {
            console.error(`API Error patching event ${eventId}:`, error.message || error);
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(String(error) || `An unknown error occurred while patching event ${eventId}.`);
            }
        }
    },

    /**
     * Deletes an event. Admin specific endpoint or general delete with admin rights.
     * The backend DELETE /events/:eventId already handles admin/creator logic.
     */
    async deleteAdminEvent(eventId) {
        if (!authStore.isAdmin()) {
            return Promise.reject(new Error('Administrator privileges required.'));
        }
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: { ...authStore.getAuthHeaders() }
            });

            if (response.status === 204) { // Success: No Content
                return true;
            }

            if (!response.ok) { // For other error statuses
                let errorPayload = { message: `Error deleting event ${eventId}. Status: ${response.status}` };
                try {
                    const errorData = await response.json();
                    errorPayload.message = errorData.errorMessage || errorData.error || errorPayload.message;
                } catch (e) {
                    console.warn(`Could not parse error response JSON for DELETE event ${eventId}.`, e);
                    if(response.statusText) errorPayload.message = response.statusText;
                }
                throw new Error(errorPayload.message);
            }
            // Fallback for unexpected successful responses that are not 204
            return await response.json();
        } catch (error) {
            console.error(`API Error deleting event ${eventId}:`, error.message || error);
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(String(error) || `An unknown error occurred while deleting event ${eventId}.`);
            }
        }
    }
};