import {
  patientStorage,
  roleStorage,
  tokenStorage,
  usernameStorage,
} from "@/utils/token-storage";
import { router } from "expo-router";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_PREFIX = "/api/v1";

const parseResponse = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};


const handleResponse = async <T>(
  response: Response,
  authenticated = false,
): Promise<T> => {
  const data = await parseResponse(response);
  if (!response.ok) {
    console.log(

      "[apiClient] Error response:",
      response.status,
      JSON.stringify(data),
    );
    if (response.status === 401 && authenticated) {
      Promise.all([
        tokenStorage.clear(),
        roleStorage.clear(),
        patientStorage.clear(),
        usernameStorage.clear(),
      ]).then(() => router.replace("/login"));
    }
    throw new Error(data?.message ?? data?.detail ?? "Request failed");
  }
  return data as T;
};

const url = (path: string) => `${BASE_URL}${API_PREFIX}${path}`;

export const apiClient = {
  post: <T>(path: string, body: unknown, token?: string): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url(path), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }).then((res) => handleResponse<T>(res, !!token));
  },

  // No token — never triggers auth redirect (e.g. login, register endpoints)
  postForm: <T>(path: string, body: Record<string, string>): Promise<T> =>
    fetch(url(path), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    }).then((res) => handleResponse<T>(res, false)),

  get: <T>(path: string, token?: string): Promise<T> => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url(path), { method: "GET", headers }).then((res) =>
      handleResponse<T>(res, !!token),
    );
  },
  delete: <T>(path: string, token?: string): Promise<T> => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url(path), { method: "DELETE", headers }).then((res) =>
      handleResponse<T>(res, !!token),
    );
  },
  put: <T>(path: string, body: unknown, token?: string): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url(path), {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }).then((res) => handleResponse<T>(res, !!token));
  },
};
