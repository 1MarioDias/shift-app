import { reactive } from 'vue';

export const authStore = reactive({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null, // Stores { userId, name, email, role }

    setAuth(token, userData) {
        this.token = token;
        this.user = userData;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    },

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isLoggedIn() {
        return !!this.token;
    },

    isAdmin() {
        return this.user && this.user.role === 'Administrador';
    },

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }
});