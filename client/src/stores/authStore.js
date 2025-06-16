import { reactive } from 'vue';

export const authStore = reactive({
    token: localStorage.getItem('token') || null,

    setAuth(token, userData) {
        this.token = token;
        this.user = userData;
        localStorage.setItem('token', token);
    },

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
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