import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('devle_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('devle_refresh');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
                    if (res.data.success) {
                        localStorage.setItem('devle_token', res.data.data.token);
                        localStorage.setItem('devle_refresh', res.data.data.refreshToken);
                        error.config.headers.Authorization = `Bearer ${res.data.data.token}`;
                        return api(error.config);
                    }
                } catch {
                    localStorage.removeItem('devle_token');
                    localStorage.removeItem('devle_refresh');
                    localStorage.removeItem('devle_user');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
