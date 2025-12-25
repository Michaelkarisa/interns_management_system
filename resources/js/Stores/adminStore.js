import { create } from 'zustand';
import axios from 'axios';

export const useAdminStore = create((set) => ({
  auth: null,
  pageData: null,
  activePage: 'dashboard',
  loading: false,
  error: null,
  collapsed: false,

  fetchAuth: async () => {
    try {
      const response = await axios.get('/currentuser');
      set({ auth: response.data });
      console.log("data: ", response.adat);
    } catch (err) {
      console.error('Error fetching auth:', err);
    }
  },

  fetchPageData: async (page) => {
    set({ activePage: page, loading: true, error: null });
    try {
      const response = await axios.get(`/${page}`);
      set({ pageData: response.data, loading: false });
      console.log("data: ", response.adat);
    } catch (err) {
      console.error('Error fetching page data:', err);
      set({ error: err.message, pageData: null, loading: false });
    }
  },

  toggleSidebar: () => set((state) => {
    const newState = !state.collapsed;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    return { collapsed: newState };
  }),
}));
