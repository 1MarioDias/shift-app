const API_URL = 'http://127.0.0.1:3000';

export const eventosService = {
    async getFeaturedEvents(page = 0, pageSize = 8) {
        const queryParams = new URLSearchParams({
            page,
            pageSize,
            sortBy: 'data',
            order: 'asc'
        });

        const response = await fetch(`${API_URL}/events?${queryParams}`);
        if (!response.ok) {
            throw new Error('Error fetching events');
        }
        return response.json();
    },

    async getAdminEvents(params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 10,
            sortBy: params.sortBy || 'data',
            order: params.order || 'asc',
            ...(params.query && { query: params.query }),
            ...(params.eventType && { eventType: params.eventType }),
            ...(params.datetime && { datetime: params.datetime }),
            ...(params.location && { location: params.location }),
            ...(params.isPublic !== undefined && { isPublic: params.isPublic })
        });

        try {
            const response = await fetch(`${API_URL}/events/admin?${queryParams}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error fetching events');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};