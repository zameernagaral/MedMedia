import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator, localhost points to the emulator itself.
// We use 10.0.2.2 to point to the host machine's localhost.
const getBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configuredUrl) return configuredUrl;
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001/api';
    }
    return 'http://localhost:5001/api';
  }
  throw new Error('EXPO_PUBLIC_API_URL must be set to the deployed MedMedia API URL for production builds.');
};

export const API_BASE = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async getPosts() {
    const res = await apiClient.get('/posts');
    return res.data.posts;
  }
};
