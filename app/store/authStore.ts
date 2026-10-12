import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    uid: string | null;
    userEmail: string | null;
    userMobile: string | null;
    displayName: string | null;
    role: string;
    isLoggedIn: boolean;
    login: (uid: string, email: string, displayName?: string, role?: string) => void;
    logout: () => void;
    setDisplayName: (name: string) => void;
    setRole: (role: string) => void;
    setOfficerRole: (role: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            uid: null,
            userEmail: null,
            userMobile: null,
            displayName: null,
            role: 'Field Officer',
            isLoggedIn: false,
            login: (uid, email, displayName, role) => set({
                uid,
                userEmail: email,
                userMobile: email,
                displayName: displayName || 'Cattle Officer',
                role: role || (email.toLowerCase().includes('admin') ? 'Admin' : 'Field Officer'),
                isLoggedIn: true,
            }),
            logout: () => set({
                uid: null,
                userEmail: null,
                userMobile: null,
                displayName: null,
                role: 'Field Officer',
                isLoggedIn: false,
            }),
            setDisplayName: (name) => set({ displayName: name }),
            setRole: (role) => set({ role: role }),
            setOfficerRole: (role) => set({ role: role }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
