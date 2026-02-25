declare module "precompiled-mqtt" {
  export interface IClientOptions {
    protocol?: "wss" | "ws" | "mqtt" | "mqtts";
    username?: string;
    password?: string;
    clientId?: string;
    reconnectPeriod?: number;
    keepalive?: number;
    clean?: boolean;
    [key: string]: unknown;
  }

  export interface MqttClient {
    on(event: "connect", cb: () => void): this;
    on(event: "reconnect", cb: () => void): this;
    on(event: "error", cb: (err: Error) => void): this;
    on(event: "offline", cb: () => void): this;
    on(event: "close", cb: () => void): this;
    on(event: "message", cb: (topic: string, message: Buffer) => void): this;
    publish(
      topic: string,
      message: string | Buffer,
      opts?: { qos?: 0 | 1 | 2; retain?: boolean },
      cb?: (error?: Error) => void,
    ): this;
    end(force?: boolean, cb?: () => void): this;
    subscribe(topic: string | string[], cb?: (err: Error | null) => void): this;
    unsubscribe(topic: string | string[], cb?: (err?: Error) => void): this;
    connected: boolean;
  }

  export function connect(url: string, opts?: IClientOptions): MqttClient;
}
