import { create } from 'zustand';
import api, { initCsrf } from '@/api/axios';

export const useAuthStore = create((set) => ({
    user: null,
    forcePasswordChange: false,
    loading: true,

    // Fetch current user
    fetchUser: async () => {
        set({ loading: true });
        try {
            await initCsrf(); // Ensure CSRF cookie exists
            const res = await api.get('/user');
            set({
                user: res.data.auth?.user || null,
                forcePasswordChange: res.data.auth?.user?.must_change_password || false,
                loading: false,
            });
        } catch (error) {
            set({ user: null, forcePasswordChange: false, loading: false });
        }
    },

    // Login
    login: async (credentials) => {
        await initCsrf();
        const res = await api.post('/login', credentials);
        set({
            user: res.data.auth.user,
            forcePasswordChange: res.data.force_password_change,
        });
        return res.data;
    },

    // Logout
    logout: async () => {
        await api.post('/logout');
        set({ user: null, forcePasswordChange: false });
    },
}));
