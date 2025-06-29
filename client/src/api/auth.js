const API_URL = 'http://127.0.0.1:3000';

import { authStore } from '../stores/authStore';
import router from '../router';

export const authService = {
    async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || 'Login failed.');
            }
            if (!data.accessToken || !data.user) {
                throw new Error('Server response missing authentication token or user data.');
            }
            authStore.setAuth(data.accessToken, data.user); // Store token e user data
            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errorMessage || data.error || this.getRegistrationErrorMessage(response.status));
            }
            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }
            throw error;
        }
    },

    logout() {
        authStore.clearAuth();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userProfileImage");
        localStorage.removeItem("username");
        // redirect para o login
        router.push('/login'); 
    },
    getRegistrationErrorMessage(status) {
        const errorMessages = {
            400: 'Invalid registration information provided.',
            409: 'An account with this email already exists.',
            500: 'Server error occurred during registration.'
        };
        return errorMessages[status] || 'Registration failed. Please try again.';
    }
};