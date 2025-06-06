import { authStore } from '../stores/authStore';
const API_URL = 'http://127.0.0.1:3000';

export const adminService = {
    // User Management
    async getUsers(params = {}) {
        if (!authStore.isAdmin()) return Promise.reject(new Error('Administrator privileges required.'));
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 10,
            sortBy: params.sortBy || 'dataRegisto',
            order: params.order || 'desc',
            ...(params.query && { query: params.query }),
        });
        const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, { headers: authStore.getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.errorMessage || data.error || 'Error fetching users.');
        return data;
    },

    async deleteUser(userId) {
        if (!authStore.isAdmin()) return Promise.reject(new Error('Administrator privileges required.'));
        const response = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE', headers: authStore.getAuthHeaders() });
        if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
            const data = await response.json().catch(() => ({}));
            throw new Error(data.errorMessage || data.error || 'Error deleting user.');
        }
        return true;
    },

    // Comment Management
    async getComments(params = {}) {
        if (!authStore.isAdmin()) return Promise.reject(new Error('Administrator privileges required.'));
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 10,
            sortBy: params.sortBy || 'dataComentario',
            order: params.order || 'desc',
            ...(params.query && { query: params.query }),
            ...(params.userId && { userId: params.userId }),
            ...(params.eventId && { eventId: params.eventId }),
        });
        const response = await fetch(`${API_URL}/comments?${queryParams.toString()}`, { headers: authStore.getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.errorMessage || data.error || 'Error fetching comments.');
        return data;
    },

    async deleteComment(commentId) {
        if (!authStore.isAdmin()) return Promise.reject(new Error('Administrator privileges required.'));
        const response = await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE', headers: authStore.getAuthHeaders() });
         if (!response.ok && response.status !== 204) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.errorMessage || data.error || 'Error deleting comment.');
        }
        return true;
    }
};