import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBackendUrl = () => {
    if (Platform.OS === 'web') {
        const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
        return `http://${hostname}:8000`;
    }
    try {
        // Automatically detect the host IP from Expo Go / Dev Client
        if (Constants.expoConfig?.hostUri) {
            const host = Constants.expoConfig.hostUri.split(':')[0];
            return `http://${host}:8000`; // Assumes backend runs on port 8000
        }
    } catch (error) {
        console.warn("Failed to get dynamic backend URL, falling back to hardcoded.");
    }
    // Fallback for Android Emulator (10.0.2.2) or local Wi-Fi IP
    return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
};

export const DEV_BACKEND_URL = getBackendUrl();
console.log("Using Backend URL:", DEV_BACKEND_URL);

const api = axios.create({
    baseURL: DEV_BACKEND_URL,
    // headers: { 'Content-Type': 'multipart/form-data' }, // DO NOT SET THIS MANUALLY! It breaks boundary generation.
    timeout: 15000,
});

export interface Prediction {
    breed: string;
    confidence: number;
}

export const getScans = async (mobile: string): Promise<any[]> => {
    try {
        const response = await api.get(`/scans/${mobile}`);
        return response.data;
    } catch (error) {
        console.error('Get Scans Error:', error);
        throw error;
    }
};

import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

// ... (existing imports)

export const classifyBreed = async (imageUri: string, mobile: string = "1234567890"): Promise<Prediction[]> => {
    try {
        console.log(`Uploading image to ${DEV_BACKEND_URL}/predict...`);

        if (Platform.OS === 'web') {
            const formData = new FormData();
            const fetchRes = await fetch(imageUri);
            const blob = await fetchRes.blob();
            formData.append('file', blob, 'cattle_scan.jpg');
            formData.append('mobile', mobile);

            const response = await axios.post(`${DEV_BACKEND_URL}/predict`, formData);
            return response.data.predictions;
        }

        const response = await uploadAsync(`${DEV_BACKEND_URL}/predict`, imageUri, {
            fieldName: 'file',
            httpMethod: 'POST',
            uploadType: FileSystemUploadType.MULTIPART,
            parameters: {
                'mobile': mobile
            }
        });

        console.log("Upload status:", response.status);

        if (response.status !== 200) {
            throw new Error(`HTTP Error: ${response.status} - ${response.body}`);
        }

        const data = JSON.parse(response.body);
        return data.predictions;
    } catch (error) {
        console.error('API Error (classifyBreed):', error);
        throw error;
    }
};

export const getStats = async (mobile: string): Promise<any> => {
    try {
        const response = await api.get(`/stats/${mobile}`);
        return response.data;
    } catch (error) {
        console.error('Get Stats Error:', error);
        throw error;
    }
};
// --- Auth API ---

export const loginWithEmail = async (email: string, password: string): Promise<any> => {
    try {
        const response = await api.post('/auth/login', { email, password }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
};

export const registerWithEmail = async (email: string, password: string, fullName: string = "Cattle Officer"): Promise<any> => {
    try {
        const response = await api.post('/auth/register', { email, password, full_name: fullName }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Register Error:', error);
        throw error;
    }
};

export const sendOtp = async (mobile: string): Promise<any> => {
    return loginWithEmail(mobile, "123456");
};

export const verifyOtp = async (mobile: string, otp: string): Promise<any> => {
    return { success: true, message: "Login successful", token: "mock-jwt-token" };
};

// --- Profile API ---

export const getProfile = async (mobile: string): Promise<any> => {
    try {
        const response = await api.get(`/profile/${mobile}`);
        return response.data;
    } catch (error) {
        console.error('Get Profile Error:', error);
        throw error;
    }
};

export const updateProfile = async (mobile: string, data: any): Promise<any> => {
    try {
        const response = await api.put(`/profile/${mobile}`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Update Profile Error:', error);
        throw error;
    }
};

export const uploadProfilePicture = async (mobile: string, imageUri: string): Promise<any> => {
    try {
        console.log("Uploading profile picture...");
        const response = await uploadAsync(`${DEV_BACKEND_URL}/profile/upload`, imageUri, {
            fieldName: 'file',
            httpMethod: 'POST',
            uploadType: FileSystemUploadType.MULTIPART,
            parameters: {
                'mobile': mobile
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP Error: ${response.status} - ${response.body}`);
        }

        return JSON.parse(response.body);
    } catch (error) {
        console.error('Profile Upload Error:', error);
        throw error;
    }
};

// --- Analytics, Breeds & Admin API ---

export const getAnalytics = async (mobile: string): Promise<any> => {
    try {
        const response = await api.get(`/analytics/${mobile}`);
        return response.data;
    } catch (error) {
        console.error('Get Analytics Error:', error);
        throw error;
    }
};

export const deleteScan = async (scanId: number): Promise<any> => {
    try {
        const response = await api.delete(`/scans/${scanId}`);
        return response.data;
    } catch (error) {
        console.error('Delete Scan Error:', error);
        throw error;
    }
};

export const getBreedsList = async (): Promise<any> => {
    try {
        const response = await api.get('/breeds');
        return response.data;
    } catch (error) {
        console.error('Get Breeds Error:', error);
        throw error;
    }
};

export const getAdminStats = async (): Promise<any> => {
    try {
        const response = await api.get('/admin/stats');
        return response.data;
    } catch (error) {
        console.error('Admin Stats Error:', error);
        throw error;
    }
};

export const getAdminUsers = async (): Promise<any> => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Admin Users Error:', error);
        throw error;
    }
};

