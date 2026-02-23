import { useState, useCallback } from 'react';
import mqtt from 'mqtt'; 
import type { MqttClient } from 'mqtt';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const GETCREDENTIAL_URL = apiUrl + '/api/mqtt/credentials';

export const useMqtt = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectMqtt = useCallback(async (accessToken: string) => {
    if (!accessToken) {
      console.error('Cannot connect MQTT: No Access Token provided');
      return;
    }
    
    try {
      console.log('1. Fetching MQTT Credentials from Backend...');
      const response = await fetch(GETCREDENTIAL_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` 
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credentials: ${response.status}`);
      }

      const creds = await response.json();
      console.log('2. Credentials received. Connecting to HiveMQ...');

      const mqttClient = mqtt.connect(creds.brokerUrl, {
        clientId: `${creds.clientIdPrefix}${Math.random().toString(16).substring(2, 8)}`,
        username: creds.username,
        password: creds.password,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      mqttClient.on('connect', () => {
        console.log('MQTT Connected to HiveMQ successfully!');
        setIsConnected(true);
      });

      mqttClient.on('error', (err) => {
        console.error('MQTT Connection Error:', err);
        setIsConnected(false);
      });

      mqttClient.on('offline', () => {
        console.log('MQTT Offline');
        setIsConnected(false);
      });

      setClient(mqttClient);

    } catch (error) {
      console.error('Error in MQTT Setup:', error);
    }
  }, []);

  // ฟังก์ชันสำหรับโยนข้อมูลเซนเซอร์ขึ้น Cloud
  const publishGaitData = useCallback((userId: string, sessionId: string, dataBatch: any[]) => {
    if (client && isConnected) {
      const topic = `pgad/users/${userId}/sessions/${sessionId}/data`;
      const payload = JSON.stringify({
        timestamp: new Date().toISOString(),
        data: dataBatch 
      });

      //sent data with qos 0 
      client.publish(topic, payload, { qos: 0 });
      console.log(`Published ${dataBatch.length} records to ${topic}`);
    } else {
      console.warn('Cannot publish: MQTT is not connected.');
    }
  }, [client, isConnected]);

  const disconnectMqtt = useCallback(() => {
    if (client) {
      client.end();
      setIsConnected(false);
      console.log('MQTT Disconnected');
    }
  }, [client]);

  return {
    connectMqtt,
    publishGaitData,
    disconnectMqtt,
    isConnected,
  };
};