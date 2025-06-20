const API_URL = 'http://127.0.0.1:3000';
import { authStore } from '../stores/authStore';

async function fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...authStore.getAuthHeaders()
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.errorMessage || data.error || `API call failed with status ${response.status}`);
    }
    return data;
}

export const userService = {
    getProfile() {
        return fetchWithAuth(`${API_URL}/users/me`);
    },

    addFavorite(eventId) {
        return fetch(`${API_URL}/favorites/${eventId}`, {
            method: 'POST',
            headers: authStore.getAuthHeaders()
        }).then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.errorMessage || 'Failed to add favorite') });
            }
            return response.json();
        });
    },

    getFavorites(params = {}) {
        const queryParams = new URLSearchParams({ page: params.page || 0, pageSize: params.pageSize || 5 });
        return fetchWithAuth(`${API_URL}/favorites?${queryParams.toString()}`);
    },

    removeFavorite(eventId) {
        return fetch(`${API_URL}/favorites/${eventId}`, {
            method: 'DELETE',
            headers: authStore.getAuthHeaders()
        }).then(response => {
            if (response.status !== 204) {
                 throw new Error('Failed to remove favorite');
            }
            return { success: true };
        });
    },

    getParticipations(params = {}) {
        const queryParams = new URLSearchParams({ page: params.page || 0, pageSize: params.pageSize || 5 });
        return fetchWithAuth(`${API_URL}/users/me/participations?${queryParams.toString()}`);
    },

    getWaitlist(params = {}) {
        const queryParams = new URLSearchParams({ page: params.page || 0, pageSize: params.pageSize || 5 });
        return fetchWithAuth(`${API_URL}/users/me/waitlist?${queryParams.toString()}`);
    }
};