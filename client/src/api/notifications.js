const API_URL = 'http://127.0.0.1:3000';
import { authStore } from '../stores/authStore';

async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...authStore.getAuthHeaders(),
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
        return { success: true };
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.errorMessage || data.error || `API call failed with status ${response.status}`);
    }
    return data;
}

export const notificationsService = {
    listUserNotifications(params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 0,
            pageSize: params.pageSize || 20,
            ...(params.unreadOnly !== undefined && { unreadOnly: params.unreadOnly }),
        });
        return fetchWithAuth(`${API_URL}/notifications?${queryParams.toString()}`);
    },

    updateNotificationStatus(notificationId, isRead) {
        return fetchWithAuth(`${API_URL}/notifications/${notificationId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isRead }),
        });
    },
};