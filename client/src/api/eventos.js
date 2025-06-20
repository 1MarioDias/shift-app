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
            order: params.order || 'asc',
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

    async getCommentsForEvent(eventId, page = 0, pageSize = 10) {
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/comments?page=${page}&pageSize=${pageSize}`, {
                headers: {
                    ...authStore.getAuthHeaders()
                }
            });
            if (!response.ok) {
                let errorPayload = { message: `Error fetching comments for event ${eventId}. Status: ${response.status}` };
                try {
                    const errorData = await response.json();
                    errorPayload.message = errorData.errorMessage || errorData.error || errorPayload.message;
                } catch (e) {
                    // Ignore if error response is not JSON
                }
                throw new Error(errorPayload.message);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error fetching comments for event ${eventId}:`, error.message || error);
            throw error;
        }
    },

    async addCommentToEvent(eventId, text) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject(new Error('Authentication required to comment.'));
        }
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authStore.getAuthHeaders()
                },
                body: JSON.stringify({ text })
            });

            const responseData = await response.json();
            if (!response.ok) {
                const message = responseData.errorMessage || responseData.message || `Error adding comment. Status: ${response.status}`;
                throw new Error(message);
            }
            return responseData;
        } catch (error) {
            console.error(`API Error adding comment to event ${eventId}:`, error.message || error);
            throw error;
        }
    },

    async deleteComment(commentId) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject(new Error('Authentication required to delete a comment.'));
        }
        try {
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    ...authStore.getAuthHeaders()
                }
            });

            if (response.status === 204) {
                return { success: true };
            }

            if (!response.ok) {
                let errorPayload = { message: `Error deleting comment ${commentId}. Status: ${response.status}` };
                try {
                    const errorData = await response.json();
                    errorPayload.message = errorData.errorMessage || errorData.error || errorPayload.message;
                } catch (e) {
                    // Ignore
                }
                throw new Error(errorPayload.message);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error deleting comment ${commentId}:`, error.message || error);
            throw error;
        }
    },

    async registerForEvent(eventId) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject(new Error('Authentication required.'));
        }
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/participations`, {
                method: 'POST',
                headers: { ...authStore.getAuthHeaders() }
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.errorMessage || 'Failed to register for the event.');
            }
            return responseData;
        } catch (error) {
            console.error(`API Error registering for event ${eventId}:`, error.message || error);
            throw error;
        }
    },

    async cancelParticipation(eventId) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject(new Error('Authentication required.'));
        }
        try {
            const response = await fetch(`${API_URL}/events/${eventId}/participations`, {
                method: 'DELETE',
                headers: { ...authStore.getAuthHeaders() }
            });
            if (response.status !== 204) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.errorMessage || 'Failed to cancel participation.');
            }
            return { success: true };
        } catch (error) {
            console.error(`API Error canceling participation for event ${eventId}:`, error.message || error);
            throw error;
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
    async deleteEvent(eventId) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject(new Error('Authentication required.'));
        }
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: { ...authStore.getAuthHeaders() }
            });

            if (response.status === 204) {
                return { success: true };
            }

            let errorPayload = { message: `Error deleting event ${eventId}. Status: ${response.status}` };
            try {
                const errorData = await response.json();
                errorPayload.message = errorData.errorMessage || errorData.error || errorPayload.message;
            } catch (e) {
                // Ignorar se não houver corpo JSON
            }
            throw new Error(errorPayload.message);
        } catch (error) {
            console.error(`API Error deleting event ${eventId}:`, error.message || error);
            throw error;
        }
    },
    async createEvent(eventFormData) {
        if (!authStore.isLoggedIn()) {
            return Promise.reject({ status: 401, message: 'Authentication required to create an event.' });
        }
        try {
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    ...authStore.getAuthHeaders()
                },
                body: eventFormData
            });

            const responseData = await response.json();

            if (!response.ok) {
                const message = responseData.errorMessage || responseData.message || responseData.error || `Error creating event. Status: ${response.status}`;
                throw { status: response.status, message: message, details: responseData.details };
            }
            return responseData;
        } catch (error) {
            console.error('API Error creating event:', error);
            if (error.status) {
                throw error;
            }
            throw { status: 500, message: error.message || 'An unexpected error occurred while creating the event.' };
        }
    },
};