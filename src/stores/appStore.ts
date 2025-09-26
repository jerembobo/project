import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarOpen: boolean;
  isDark: boolean;
  selectedTimeframe: '7' | '30' | '90';
  notifications: Notification[];
  filters: {
    platform?: 'facebook' | 'tiktok' | 'google' | 'all';
    status?: 'active' | 'paused' | 'all';
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;
  setTimeframe: (timeframe: '7' | '30' | '90') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  resetFilters: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  sidebarOpen: false,
  isDark: false,
  selectedTimeframe: '30',
  notifications: [],
  filters: {
    platform: 'all',
    status: 'all',
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setDarkMode: (isDark) => {
        set({ isDark });
        document.documentElement.classList.toggle('dark', isDark);
      },
      toggleDarkMode: () => {
        const isDark = !get().isDark;
        set({ isDark });
        document.documentElement.classList.toggle('dark', isDark);
      },
      
      setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
        }));
      },
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
      
      resetFilters: () => set({
        filters: {
          platform: 'all',
          status: 'all',
        },
      }),
    }),
    {
      name: 'kapehi-app',
      partialize: (state) => ({
        isDark: state.isDark,
        selectedTimeframe: state.selectedTimeframe,
        filters: state.filters,
      }),
    }
  )
);