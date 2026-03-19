import { apiClient } from "./client";
import { MqttCredentialResponse } from "@/types/mqtt-res";

export const mqttApi = {
  getCredentials: (token: string) => {
    return apiClient.get<MqttCredentialResponse>("/mqtt-credential/me", token);
  },
};
