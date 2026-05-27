import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type TokenCache = {
  getToken: (key: string) => Promise<string | null | undefined>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
};

const createTokenCache = (): TokenCache => {
  return {
    async getToken(key) {
      try {
        if (Platform.OS === 'web') {
          return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
      } catch {
        return null;
      }
    },
    async saveToken(key, value) {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem(key, value);
          return;
        }
        await SecureStore.setItemAsync(key, value);
      } catch {
        // ignore
      }
    },
    async clearToken(key) {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem(key);
          return;
        }
        await SecureStore.deleteItemAsync(key);
      } catch {
        // ignore
      }
    },
  };
};

export const tokenCache = createTokenCache();

export function getClerkRole(
  publicMetadata: Record<string, unknown> | undefined,
): 'admin' | 'user' {
  const role = publicMetadata?.role;
  return role === 'admin' ? 'admin' : 'user';
}
