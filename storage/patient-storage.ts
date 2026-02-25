import { STORAGE_KEYS } from "@/types/secure-store";
import * as SecureStore from "expo-secure-store";

export const secureStore = {
  set: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },

  get: async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  },

  remove: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },

  clear: async () => {
    Object.values(STORAGE_KEYS).map((key) => SecureStore.deleteItemAsync(key));
  },
};
