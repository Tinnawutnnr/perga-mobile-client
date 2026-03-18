import { apiClient } from "./client";

export interface DeviceRegisterRequest {
    user_id: number;
    expo_push_token: string;
    platform: string;
}

export const deviceApi = {
    // Register the device with User ID
    register: (data: DeviceRegisterRequest, token: string) =>
        apiClient.post<{ message: string}>("/devices/register", data, token),

    // Logout and unregister the device
    unregister: (expoPushToken: string, token: string) =>
        apiClient.post<{ message: string }>("/devices/unregister", { expo_push_token: expoPushToken }, token),
}