const API_URL = 'http://127.0.0.1:3000';
import { authStore } from '../stores/authStore';

export const eventosService = {
    /* Retorna uma lista de eventos públicos.
    Não requer autenticação, mas pode aceitar parâmetros de consulta para filtragem.
    No Backend `_getPublicEventsList` 
    */
    async getPublicEvents(params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 8,
            sortBy: params.sortBy || 'data',
            order: params.order || 'desc',
            ...(params.query && { query: params.query }),
            ...(params.eventType && { eventType: params.eventType }),
            ...(params.datetime && { datetime: params.datetime }),
            ...(params.location && { location: params.location }),
        });

        try {
            const response = await fetch(`${API_URL}/events?${queryParams.toString()}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || 'Error fetching public events');
            }
            return data;
        } catch (error) {
            console.error('API Error fetching public events:', error);
            throw error;
        }
    },

    /*
    Retorna uma lista de eventos para o administrador.
    No Backend `_getAllEventsForAdmin`
    */
    async getAdminEvents(params = {}) {
        if (!authStore.isAdmin()) {
            return Promise.reject(new Error('Administrator privileges required to fetch all events.'));
        }

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

        // Filtros adicionais específicos para admin
        if (params.isPublic !== undefined && params.isPublic !== '') queryParams.set('isPublic', params.isPublic);
        if (params.organizerId) queryParams.set('organizerId', params.organizerId);

        try {
            const response = await fetch(`${API_URL}/events?${queryParams.toString()}`, {
                headers: {
                    ...authStore.getAuthHeaders() // Autenticação do admin
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || 'Error fetching events for admin');
            }
            return data;
        } catch (error) {
            console.error('API Error fetching admin events:', error);
            throw error;
        }
    },

    /*
    secção de featured events, usa getPublicEvents.
    */
    async getFeaturedEvents(page = 0, pageSize = 4) {
        return this.getPublicEvents({
            page,
            pageSize,
            sortBy: 'data', // ou 'visualizacoes'
            order: 'desc'
        });
    },

    /*
    Evento Especifico por ID.
    */
    async getEventById(eventId) {
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                headers: {
                    ...authStore.getAuthHeaders()
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

    /*
    Update campos específicos dum evento
    AUTH para admin OU criador do evento.
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
            return await response.json();
        } catch (error) {
            console.error(`API Error patching event ${eventId}:`, error.message || error);
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(String(error) || `An unknown error occurred while patching event ${eventId}.`);
            }
        }
    },

    /*
    Apaga um evento
    No backend DELETE /events/:eventId já faz a lógica de autenticação
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

            if (response.status === 204) {
                return true;
            }

            if (!response.ok) {
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