import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const PATIENT_ID_KEY = "selected_patient_id";
const PATIENT_USERNAME_KEY = "selected_patient_username";
const ROLE_KEY = "user_role";
const USERNAME_KEY = "username";

export const tokenStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  save: (token: string): Promise<void> =>
    SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
};

export const roleStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(ROLE_KEY),
  save: (role: string): Promise<void> =>
    SecureStore.setItemAsync(ROLE_KEY, role),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(ROLE_KEY),
};

export const patientStorage = {
  getId: (): Promise<string | null> => SecureStore.getItemAsync(PATIENT_ID_KEY),
  getUsername: (): Promise<string | null> =>
    SecureStore.getItemAsync(PATIENT_USERNAME_KEY),
  save: (id: number, username: string): Promise<void> =>
    Promise.all([
      SecureStore.setItemAsync(PATIENT_ID_KEY, String(id)),
      SecureStore.setItemAsync(PATIENT_USERNAME_KEY, username),
    ]).then(() => {}),
  clear: (): Promise<void> =>
    Promise.all([
      SecureStore.deleteItemAsync(PATIENT_ID_KEY),
      SecureStore.deleteItemAsync(PATIENT_USERNAME_KEY),
    ]).then(() => {}),
};

export const usernameStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(USERNAME_KEY),
  save: (username: string): Promise<void> =>
    SecureStore.setItemAsync(USERNAME_KEY, username),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(USERNAME_KEY),
};
