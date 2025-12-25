import axios from 'axios';

// Create Axios instance for Laravel Sanctum SPA
const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Required for session cookies
    headers: {
        Accept: 'application/json',
    },
});

// Add CSRF token from meta tag if present
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    api.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Initialize CSRF cookie
export async function initCsrf() {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

// Response interceptor for 401, 403, 419
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 419) {
            // CSRF expired — refresh and retry
            await initCsrf();
            return axios(error.config); // retry original request
        }

        if (status === 401) {
            window.dispatchEvent(new Event('unauthorized'));
        }

        if (status === 403) {
            console.error('Forbidden: insufficient permissions');
        }

        return Promise.reject(error);
    }
);

export default api;
