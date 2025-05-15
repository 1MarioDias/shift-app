const API_URL = 'http://127.0.0.1:3000';

export const authService = {
    async login(credentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errorMessage || 'Failed to login');
        }

        const data = await response.json();
        localStorage.setItem('token', data.accessToken);
        return data;
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errorMessage || 'Failed to register');
        }

        return response.json();
    },

    logout() {
        localStorage.removeItem('token');
    }
};