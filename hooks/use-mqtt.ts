import { GaitSensorData } from "@/types/ble-type";
import type { IClientOptions, MqttClient } from "precompiled-mqtt";
import { connect as mqttConnect } from "precompiled-mqtt";
import { useCallback, useRef, useState } from "react";

const MQTT_BROKER_URL: string = process.env.EXPO_PUBLIC_MQTT_BROKER_URL ?? "";
const MQTT_USERNAME: string = process.env.EXPO_PUBLIC_MQTT_USERNAME ?? "";
const MQTT_PASSWORD: string = process.env.EXPO_PUBLIC_MQTT_PASSWORD ?? "";

const CONNECT_TIMEOUT_MS = 10_000;

export interface UseMqttReturn {
  isConnected: boolean;
  connectMqtt: (token?: string) => Promise<void>;
  disconnectMqtt: () => void;
  publishGaitData: (
    userId: string,
    sessionId: string,
    dataBatch: GaitSensorData[],
  ) => void;
}

export const useMqtt = (): UseMqttReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<MqttClient | null>(null);

  /**
   * Connect to HiveMQ Cloud over WSS.
   *
   * Returns a Promise that resolves when the MQTT "connect" event fires,
   * so callers can `await connectMqtt()` before starting BLE streaming.
   */
  const connectMqtt = useCallback(async (_token?: string) => {
    if (!MQTT_BROKER_URL) {
      console.error(
        "[MQTT] EXPO_PUBLIC_MQTT_BROKER_URL is empty. " +
          "Set it in .env.local and restart with `npx expo start --clear`.",
      );
      throw new Error("MQTT broker URL is not configured");
    }

    if (clientRef.current) {
      console.log("[MQTT] Client already exists, skipping re-connect");
      return;
    }

    console.log("[MQTT] Connecting to", MQTT_BROKER_URL);

    return new Promise<void>((resolve, reject) => {
      try {
        const options: IClientOptions = {
          protocol: "wss",
          username: MQTT_USERNAME,
          password: MQTT_PASSWORD,
          clientId: `pgad_mobile_${Math.random().toString(16).substring(2, 8)}`,
          reconnectPeriod: 5000,
          connectTimeout: CONNECT_TIMEOUT_MS,
        };

        const client = mqttConnect(MQTT_BROKER_URL, options);

        const timer = setTimeout(() => {
          console.error("[MQTT] Connection timed out");
          client.end(true);
          clientRef.current = null;
          reject(new Error("MQTT connection timed out"));
        }, CONNECT_TIMEOUT_MS);

        client.on("connect", () => {
          clearTimeout(timer);
          console.log("[MQTT] Connected!");
          setIsConnected(true);
          resolve();
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
          reject(err);
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
        reject(error);
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
    (userId: string, sessionId: string, dataBatch: GaitSensorData[]) => {
      if (!clientRef.current || !isConnected) {
        console.warn("Cannot publish: MQTT not connected");
        return;
      }

      const topic = `pgad/users/${userId}/sessions/${sessionId}/data`;

      const payload = {
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        batchSize: dataBatch.length,
        data: dataBatch,
      };

      try {
        clientRef.current.publish(
          topic,
          JSON.stringify(payload),
          { qos: 1 },
          (error?: Error) => {
            if (error) {
              console.error("Publish Error: ", error.message);
            } else {
              console.log(`Published ${dataBatch.length} records to ${topic}`);
            }
          },
        );
      } catch (error) {
        console.error(
          "Failed to stringify or publish payload",
          error instanceof Error ? error.message : error,
        );
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
