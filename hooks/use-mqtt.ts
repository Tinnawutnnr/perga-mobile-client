import type { IClientOptions, MqttClient } from "precompiled-mqtt";
import { connect as mqttConnect } from "precompiled-mqtt";
import { useCallback, useRef, useState } from "react";

const MQTT_BROKER_URL: string = process.env.EXPO_PUBLIC_MQTT_BROKER_URL ?? "";
const MQTT_USERNAME: string = process.env.EXPO_PUBLIC_MQTT_USERNAME ?? "";
const MQTT_PASSWORD: string = process.env.EXPO_PUBLIC_MQTT_PASSWORD ?? "";

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
  connectMqtt: (token?: string) => Promise<void>;
  disconnectMqtt: () => void;
  publishGaitData: (userId: string, dataBatch: number[]) => void;
}

export const useMqtt = (): UseMqttReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<MqttClient | null>(null);

  const connectMqtt = useCallback(async (_token?: string) => {
    if (!MQTT_BROKER_URL) {
      console.error("[MQTT] BROKER_URL not found");
      throw new Error("MQTT broker URL is not configured");
    }

    if (!MQTT_USERNAME || !MQTT_PASSWORD) {
      console.error("[MQTT] Username/password not configured");
      throw new Error("MQTT credentials are not configured");
    }

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

    const brokerUrl = normalizeBrokerUrl(MQTT_BROKER_URL);

    if (!/^wss:\/\//i.test(brokerUrl)) {
      console.error(`[MQTT] Invalid broker protocol: ${redactBrokerUrl(brokerUrl)}`);
      throw new Error("MQTT broker must use wss:// for mobile connectivity");
    }

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
          username: MQTT_USERNAME,
          password: MQTT_PASSWORD,
          clientId: `perga_mobile_${Math.random().toString(16).substring(2, 8)}`,
          reconnectPeriod: 5000,
          connectTimeout: CONNECT_TIMEOUT_MS,
        };

        console.log(`[MQTT] Connecting to ${redactBrokerUrl(brokerUrl)}`);
        const client = mqttConnect(brokerUrl, options);

        const timer = setTimeout(() => {
          console.error("[MQTT] Connection timed out");
          client.end(true);
          clientRef.current = null;
          settleReject(new Error("MQTT connection timed out"));
        }, CONNECT_TIMEOUT_MS);

        client.on("connect", () => {
          clearTimeout(timer);
          console.log("[MQTT] Connected!");
          setIsConnected(true);
          settleResolve();
        });

        client.on("reconnect", () => {
          console.log("[MQTT] Reconnecting...");
        });

        client.on("error", (err: Error) => {
          clearTimeout(timer);
          console.error("[MQTT] Error:", err.message);
          setIsConnected(false);
          client.end(true);
          clientRef.current = null;
          settleReject(err);
        });

        client.on("close", () => {
          console.warn("[MQTT] Connection closed");
          setIsConnected(false);
        });

        client.on("offline", () => {
          console.warn("[MQTT] Offline");
          setIsConnected(false);
        });

        clientRef.current = client;
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
    (userId: string, dataBatch: number[]) => {
      if (!clientRef.current || !isConnected) {
        console.warn("Cannot publish: MQTT not connected");
        return;
      }

      const topic = `gait/telemetry/${userId}`;
      const payload = { gyro_z: dataBatch };

      try {
        clientRef.current.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1 },
          (error?: Error) => {
            if (error) {
              console.error("Publish Error: ", error.message);
            } else {
              // console.log(`Published ${dataBatch.length} records to ${topic}`);
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