import { mqttApi } from "@/api/mqtt";
import { tokenStorage } from "@/utils/token-storage";
import type { IClientOptions, MqttClient } from "precompiled-mqtt";
import { connect as mqttConnect } from "precompiled-mqtt";
import { useCallback, useRef, useState } from "react";

const CONNECT_TIMEOUT_MS = 10_000;

const normalizeBrokerUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  return /^wss?:\/\//i.test(trimmed) ? trimmed : `wss://${trimmed}`;
};

const redactBrokerUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || "<default>"}${parsed.pathname}`;
  } catch {
    return "<invalid-url>";
  }
};

export interface UseMqttReturn {
  isConnected: boolean;
  connectMqtt: () => Promise<void>;
  disconnectMqtt: () => void;
  publishGaitData: (dataBatch: number[]) => void;
}

export const useMqtt = (): UseMqttReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<MqttClient | null>(null);
  const telemetryTokenRef = useRef<string | null>(null);

  const connectMqtt = useCallback(async () => {
    //Check if there's an existing active connection
    if (clientRef.current) {
      if (clientRef.current.connected) {
        console.log("[MQTT] Already connected, skipping.");
        return Promise.resolve();
      } else {
        console.warn("[MQTT] Cleaning up hanging client before retrying...");
        clientRef.current.end(true);
        clientRef.current = null;
      }
    }

    let mqttBrokerUrl = "";
    let mqttUsername = "";
    let mqttPassword = "";

    try {
      const token = await tokenStorage.get();
      if (!token) throw new Error("No authentication token found");

      // Api call to get mqtt data
      const { broker_url, username, password, telemetry_token } =
        await mqttApi.getCredentials(token);

      mqttBrokerUrl = broker_url;
      mqttUsername = username;
      mqttPassword = password;
      telemetryTokenRef.current = telemetry_token;
    } catch (error) {
      console.error("[MQTT] Failed to fetch credentials:", error);
      throw new Error("Unable to fetch MQTT credentials from backend", {
        cause: error,
      });
    }

    if (!mqttBrokerUrl || !mqttUsername || !mqttPassword) {
      throw new Error("MQTT credentials from backend are incomplete");
    }

    const brokerUrl = normalizeBrokerUrl(mqttBrokerUrl);

    if (!/^wss:\/\//i.test(brokerUrl)) {
      console.error(
        `[MQTT] Invalid broker protocol: ${redactBrokerUrl(brokerUrl)}`,
      );
      throw new Error("MQTT broker must use wss:// for mobile connectivity");
    }

    // Establish the connection
    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const settleResolve = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const settleReject = (error: Error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      try {
        const options: IClientOptions = {
          protocol: "wss",
          username: mqttUsername,
          password: mqttPassword,
          clientId: `perga_mobile_${Math.random().toString(16).substring(2, 8)}`,
          reconnectPeriod: 5000,
          connectTimeout: CONNECT_TIMEOUT_MS,
        };

        console.log(`[MQTT] Connecting to ${redactBrokerUrl(brokerUrl)}`);
        const client = mqttConnect(brokerUrl, options);
        // Set it immediately so event handlers can verify they belong to the active connection
        clientRef.current = client;

        const timer = setTimeout(() => {
          if (client !== clientRef.current) return;
          console.error("[MQTT] Connection timed out");
          // Mark connection as defunct
          clientRef.current = null;
          client.end(true);
          settleReject(new Error("MQTT connection timed out"));
        }, CONNECT_TIMEOUT_MS);

        client.on("connect", () => {
          if (client !== clientRef.current) return; // Guard against events from an aborted client
          clearTimeout(timer);
          console.log("[MQTT] Connected!");
          setIsConnected(true);
          settleResolve();
        });

        client.on("reconnect", () => {
          if (client !== clientRef.current) return; // Guard
          console.log("[MQTT] Reconnecting...");
        });

        client.on("error", (err: Error) => {
          if (client !== clientRef.current) return; // Guard
          clearTimeout(timer);
          console.error("[MQTT] Error:", err.message);
          setIsConnected(false);
          clientRef.current = null;
          client.end(true);
          settleReject(err);
        });

        client.on("close", () => {
          if (client !== clientRef.current) return; // Guard
          console.warn("[MQTT] Connection closed");
          setIsConnected(false);
        });

        client.on("offline", () => {
          if (client !== clientRef.current) return; // Guard
          console.warn("[MQTT] Offline");
          setIsConnected(false);
        });
      } catch (error) {
        console.error(
          "[MQTT] Failed to initialize client:",
          error instanceof Error ? error.message : error,
        );
        settleReject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }, []);

  const disconnectMqtt = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setIsConnected(false);
      console.log("HiveMQ Disconnected");
    }
  }, []);

  const publishGaitData = useCallback(
    (dataBatch: number[]) => {
      const currentToken = telemetryTokenRef.current;

      if (!clientRef.current || !isConnected || !currentToken) {
        console.warn("Cannot publish: MQTT not connected or missing token");
        return;
      }

      const topic = `gait/telemetry/${currentToken}`;
      const payload = { gyro_z: dataBatch };

      try {
        clientRef.current.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1 },
          (error?: Error) => {
            if (error) {
              console.error("Publish Error: ", error.message);
            }
          },
        );
      } catch (error) {
        console.error("Failed to stringify or publish payload", error);
      }
    },
    [isConnected],
  );

  return {
    isConnected,
    connectMqtt,
    disconnectMqtt,
    publishGaitData,
  };
};
