const API_URL = 'http://127.0.0.1:3000';

export const eventosService = {
    async getFeaturedEvents(page = 0, pageSize = 8) {
        const queryParams = new URLSearchParams({
            page,
            pageSize,
            sortBy: 'visualizacoes',
            order: 'desc'
        });

        const response = await fetch(`${API_URL}/events?${queryParams}`);
        if (!response.ok) {
            throw new Error('Error fetching events');
        }
        return response.json();
    }
};