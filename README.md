# PERGA Mobile Application

**Personalized Gait Anomaly Detection in Elderly — Mobile Client**

[![Expo](https://img.shields.io/badge/Expo_SDK-54-000020.svg?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61dafb.svg?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Platform iOS](https://img.shields.io/badge/platform-iOS-000000.svg?logo=apple)](https://developer.apple.com)
[![Platform Android](https://img.shields.io/badge/platform-Android-3ddc84.svg?logo=android)](https://developer.android.com)

---

## 1. Abstract

The PERGA Mobile Application is a cross-platform React Native client that serves as the real-time data relay and clinical dashboard within a broader IoT pipeline for gait anomaly detection in elderly populations. Gait deterioration — manifested through reduced cadence, increased stride variability, and asymmetric swing-stance timing — is a clinically validated predictor of fall risk in aging individuals. PERGA addresses this by acquiring inertial measurement data from a wearable BNO085 IMU mounted on an ESP32-C3 microcontroller via Bluetooth Low Energy (BLE), batching the raw gyroscope telemetry, and forwarding it over MQTT to a cloud backend for anomaly detection. The mobile application additionally retrieves processed gait metrics, daily/weekly/monthly/yearly trend reports, peer-group benchmarks, and anomaly logs from a REST API, rendering them in a role-differentiated interface that supports both patient self-monitoring and remote caretaker oversight. Built on Expo SDK 54 with React Native's New Architecture enabled, the application targets iOS and Android and employs Zustand for high-frequency BLE state management and `expo-secure-store` for credential protection in a health-data context.

---

## 2. System Architecture & Data Flow

### 2.1 Architectural Layers

The PERGA system comprises six distinct layers, each with a single responsibility in the data pipeline:

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **Sensor** | ESP32-C3 + BNO085 IMU | Samples gyroscope Z-axis rotation at the sensor's native rate, serializes samples as 32-bit little-endian floats, and transmits via BLE GATT notifications |
| **Transport** | BLE (react-native-ble-plx) | Point-to-point wireless link between the wearable and the mobile device; handles service discovery, characteristic monitoring, and MTU negotiation |
| **Relay** | PERGA Mobile App | Decodes base64-encoded BLE frames, accumulates samples into batches of 100, and publishes each batch to the MQTT broker over a TLS-encrypted WebSocket |
| **Broker** | HiveMQ Cloud | Receives telemetry messages on session-scoped topics and routes them to backend consumers |
| **Analytics** | FastAPI Backend | Processes raw gyroscope streams into windowed gait metrics (30-second windows), computes daily/weekly/monthly/yearly aggregates, runs anomaly detection, and exposes results via REST API |
| **Presentation** | PERGA Mobile App (UI) | Fetches processed metrics from the REST API and renders dashboards, trend charts, anomaly logs, and peer-group comparisons |

### 2.2 End-to-End Data Path

```
ESP32-C3 / BNO085 IMU
    │
    │  BLE GATT Notification (base64-encoded float32LE array)
    ▼
┌─────────────────────────────────────────────────────┐
│  PERGA Mobile App                                   │
│                                                     │
│  ble-store.ts: processBatchData()                   │
│    ├─ Decode base64 → Buffer                        │
│    ├─ Parse 4-byte float32LE samples (gyro Z)       │
│    ├─ Accumulate in dataAccumulator[]               │
│    └─ On 100 samples → flush to pendingBatch state  │
│                                                     │
│  activity.tsx: useEffect on pendingBatch             │
│    └─ Calls publishGaitData(pendingBatch)            │
│                                                     │
│  use-mqtt.ts: publishGaitData()                     │
│    └─ MQTT publish to gait/telemetry/{token}        │
│       Payload: { gyro_z: number[] }  QoS: 1         │
└─────────────────────────────────────────────────────┘
    │
    │  WSS (TLS-encrypted WebSocket)
    ▼
HiveMQ Cloud Broker (:8884/mqtt)
    │
    ▼
FastAPI Backend — Anomaly Detection & Aggregation
    │
    │  REST API (JSON over HTTPS)
    ▼
┌─────────────────────────────────────────────────────┐
│  PERGA Mobile App (Presentation Layer)              │
│                                                     │
│  use-home-data.ts: Fetch daily/weekly/yearly avgs   │
│  use-anomaly-data.ts: Fetch anomaly logs            │
│  use-metric-compare.ts: Fetch peer benchmarks       │
│  use-metrics.ts: Derive clinical status thresholds  │
└─────────────────────────────────────────────────────┘
```

### 2.3 Data Transformation Points

Two principal transformations occur within the mobile application:

1. **Raw BLE → Numeric Batch** (`store/ble-store.ts:71–106`): Base64-encoded binary from the BLE characteristic is decoded into a `Buffer`, then parsed as consecutive 4-byte IEEE 754 little-endian floats via `buffer.readFloatLE(i)`. Each float represents a single gyroscope Z-axis sample in rad/s. Samples accumulate in a module-level array (`dataAccumulator`) until 100 are collected, at which point the batch is flushed to Zustand state (`pendingBatch`).

2. **Backend Aggregate → UI Model** (`hooks/use-home-data.ts:81–95`): The `DailyAverage` schema from the REST API contains raw statistical fields. The `toGaitData()` function derives user-facing metrics:
   - **Cadence**: `Math.round(60 / (avg_swing_time + avg_stance_time))` — steps per minute from gait cycle timing
   - **Stability**: `Math.max(0, Math.round((1 - avg_stride_cv) * 100))` — percentage derived from stride coefficient of variation, where lower CV yields higher stability
   - **Distance**: `total_distance_m / 1000` — meters to kilometers

### 2.4 BLE and MQTT Coordination

BLE and MQTT operate **sequentially in a producer-consumer pattern**, not in parallel. BLE is the sole data source; MQTT is the sole data sink. The coordination mechanism is a React `useEffect` in `activity.tsx` (lines 149–161) that watches the Zustand `pendingBatch` state. When BLE fills a batch (100 samples), the state update triggers the effect, which calls `publishGaitData()` on the MQTT hook. This design decouples the BLE acquisition rate from the MQTT publish rate — the BLE store accumulates at whatever rate the sensor transmits, while MQTT publishes only when a full batch is ready.

The mobile app **does not subscribe** to any MQTT topics. All downstream data (processed metrics, anomaly logs, reports) is retrieved via REST API polling. MQTT serves exclusively as the upstream telemetry channel.

---

## 3. BLE & MQTT Protocol Design

### 3.1 BLE Configuration

**GATT Service and Characteristic:**

```
Service UUID:        4fafc201-1fb5-459e-8fcc-cbfc85023240
Characteristic UUID: beb5483e-36e1-4688-b7f5-ea07361b26a8
```

These UUIDs are loaded from environment variables (`EXPO_PUBLIC_BLE_SERVICE_UUID`, `EXPO_PUBLIC_BLE_CHARACTERISTIC_UUID`) and validated at module initialization — the app will throw at startup if they are missing or empty on native platforms.

**Frame Format:**

Each BLE notification payload is a base64-encoded binary buffer containing one or more 32-bit IEEE 754 little-endian floating-point values. Each float represents a single gyroscope Z-axis angular velocity sample in rad/s. The number of samples per notification depends on the ESP32-C3 firmware configuration and the negotiated MTU.

```
Notification payload (base64) → Buffer
  ├── Bytes [0..3]:  float32LE  →  gyro_z sample 0
  ├── Bytes [4..7]:  float32LE  →  gyro_z sample 1
  ├── Bytes [8..11]: float32LE  →  gyro_z sample 2
  └── ...
```

**Connection Lifecycle:**

| Phase | Implementation | Details |
|-------|---------------|---------|
| **Scan** | `bleManager.startDeviceScan(null, null, callback)` | Scans for all BLE peripherals for 10 seconds (`SCAN_DURATION_MS`). Only devices with a non-null `name` property are surfaced to the UI. |
| **Connect** | `device.connect()` → `discoverAllServicesAndCharacteristics()` | Establishes GATT connection and enumerates services. |
| **Android Optimization** | `requestMTU(256)` + `requestConnectionPriority(1)` | Expands Maximum Transmission Unit to 256 bytes (allowing more samples per notification) and sets connection priority to high (reduces connection interval). |
| **Stream** | `monitorCharacteristicForService(SERVICE_UUID, CHAR_UUID, callback)` | Registers for GATT notifications. Each notification triggers `processBatchData()`. |
| **Soft Stop** | `set({ isStreaming: false })` | Sets a flag; the monitor callback checks this flag and returns early. The subscription itself is not removed, allowing rapid resume without re-registering. |
| **Disconnect** | `device.cancelConnection()` | Terminates the GATT connection. The monitor subscription reference is nullified. |

**Reconnection:** The current implementation does not include automatic BLE reconnection. If the connection drops, the user must manually re-scan and re-connect through the Device screen.

### 3.2 MQTT Configuration

**Broker:**

```
Port:     8884
Path:     /mqtt
Protocol: wss:// (WebSocket Secure, TLS-encrypted)
```

The broker URL is fetched dynamically from the backend credential endpoint, not hardcoded in the client. The `normalizeBrokerUrl()` function ensures the `wss://` prefix is present.

**Credentials:** Per-session MQTT credentials (username, password, telemetry token) are obtained by calling `GET /api/v1/mqtt-credential/me` with the user's JWT. This means each recording session receives fresh, scoped credentials from the backend.

**Topic Schema:**

```
gait/telemetry/{telemetry_token}
```

The `telemetry_token` is a session-specific identifier provided by the credential endpoint. This scopes each session's data to a unique topic, enabling the backend to associate incoming messages with the correct patient and session.

**Message Format:**

```json
{
  "gyro_z": [0.0234, -0.1567, 0.3891, ..., -0.0423]
}
```

An array of 100 float values representing consecutive gyroscope Z-axis samples in rad/s.

**Client Options:**

```typescript
{
  protocol: "wss",
  clientId: "perga_mobile_<random_6_hex_chars>",
  reconnectPeriod: 5000,      // 5 seconds
  connectTimeout: 10_000,     // 10 seconds
  qos: 1                      // At-least-once delivery
}
```

**Connection Lifecycle:** The MQTT client is created when the Activity screen mounts and destroyed on unmount. A guard prevents duplicate connections — if a client already exists and is connected, `connectMqtt()` returns immediately. Stale (disconnected) clients are cleaned up before retry. Event handlers for `error`, `close`, and `offline` update the `isConnected` React state, and a timeout rejects the connection promise if no `connect` event fires within 10 seconds.

### 3.3 Design Rationale: Why Both BLE and MQTT

BLE and MQTT serve fundamentally different communication roles:

- **BLE** is a short-range, point-to-point protocol suited for acquiring data from a body-worn sensor at close proximity. It operates without internet connectivity and provides low-latency, low-power data transfer from the ESP32-C3 to the phone.

- **MQTT** is a publish-subscribe protocol designed for reliable message delivery over the internet. It provides QoS guarantees (at-least-once with QoS 1), broker-mediated decoupling between producers and consumers, and TLS encryption for data in transit.

The mobile app acts as a **protocol bridge**: it translates BLE's characteristic-notification model into MQTT's topic-publish model, batching 100 samples per message to amortize the per-publish overhead of the MQTT protocol stack and reduce broker load. This two-protocol architecture allows the sensor firmware to remain simple (BLE-only, no WiFi stack) while enabling cloud-scale data ingestion.

---

## 4. State Management Design

### 4.1 Store Map

The application uses three state management mechanisms, each chosen for its access pattern:

#### Zustand Store: `ble-store` (`store/ble-store.ts`)

| State Field | Type | Purpose |
|-------------|------|---------|
| `isScanning` | `boolean` | Whether a BLE scan is in progress |
| `foundDevices` | `BluetoothDeviceDisplay[]` | Discovered BLE peripherals with name, RSSI, connectability |
| `connectedDevice` | `Device \| null` | Active GATT connection reference |
| `isStreaming` | `boolean` | Whether characteristic monitoring is active |
| `lastBleData` | `{ z: number; timestamp: number } \| null` | Most recent gyroscope sample (for UI display) |
| `pendingBatch` | `number[]` | The latest batch of 100 samples awaiting MQTT publish |
| `isWeb` | `boolean` | Platform guard (BLE unavailable on web) |

| Action | Behavior |
|--------|----------|
| `scanForDevices()` | Requests permissions, starts 10-second scan, populates `foundDevices` |
| `connectToDevice(device)` | Establishes GATT connection, discovers services, optimizes MTU/priority on Android |
| `disconnectDevice()` | Stops streaming, cancels connection, clears state |
| `startStreaming()` | Registers characteristic monitor, begins sample accumulation |
| `stopStreaming()` | Sets `isStreaming = false` (soft stop; monitor callback checks this flag) |

**Implementation detail:** The BLE store uses module-level singletons outside the Zustand state for performance-critical references: `bleManager` (singleton `BleManager` instance), `dataAccumulator` (mutable array for sample accumulation), `monitorSubscription` (GATT notification handle), and `scanTimeoutId` (scan duration timer). These are kept outside Zustand to avoid triggering React re-renders on every incoming BLE sample — only the batched output (`pendingBatch`) and the latest sample (`lastBleData`) enter reactive state.

#### Zustand Store: `patient-store` (`store/patient-store.ts`)

| State Field | Type | Purpose |
|-------------|------|---------|
| `selectedPatient` | `PatientProfile & { username } \| null` | The patient currently being viewed (caretaker role only) |

| Action | Behavior |
|--------|----------|
| `setSelectedPatient(patient)` | Updates the selected patient for all downstream data fetching |

#### React Context: `AuthContext` (`context/auth-context.tsx`)

| State Field | Type | Purpose |
|-------------|------|---------|
| `token` | `string \| null` | JWT access token |
| `role` | `string \| null` | `"patient"` or `"caretaker"` |
| `username` | `string \| null` | Authenticated user's username |
| `tempUsername` | `string \| null` | Transient username during registration flow |
| `isLoading` | `boolean` | Whether initial hydration from secure storage is complete |

On mount, the `AuthProvider` reads `auth_token`, `user_role`, and `username` from `expo-secure-store` via `Promise.all()` and hydrates the context state. All child components block on `isLoading` before making auth-dependent decisions.

### 4.2 Separation of Concerns

- **Zustand for BLE** was chosen because BLE data arrives at high frequency (potentially hundreds of times per second) and requires synchronous, non-blocking state updates. Zustand's lightweight subscription model (`useBleStore(selector)`) allows individual components to subscribe to specific slices without re-rendering on unrelated state changes.

- **React Context for Auth** was chosen because authentication state changes infrequently (login, logout) and must be accessible to every component in the tree. The Provider pattern at the root layout ensures universal access.

- **Zustand for Patient Selection** keeps caretaker state outside of React Context to avoid re-rendering the entire component tree when the selected patient changes — only components that subscribe to `usePatientStore` re-render.

### 4.3 Cross-Store Coordination

The Activity screen (`app/(tabs)/activity.tsx`) is the sole coordination point between the BLE store and the MQTT hook. A `useEffect` (lines 149–161) subscribes to three reactive dependencies: `pendingBatch` (from BLE store), `isRecording` (local state), and `isMqttConnected` (from MQTT hook). When all conditions are met — a non-empty batch exists, recording is active, and MQTT is connected — the effect publishes the batch. This pattern avoids direct coupling between the BLE store and the MQTT hook, keeping each module independently testable.

---

## 5. Performance & Latency Characteristics

### 5.1 Rendering Architecture

The application uses standard React state updates for all UI rendering. While `react-native-reanimated` (v4.1.1) and `react-native-worklets` (v0.5.1) are declared as dependencies — and React Native's New Architecture is enabled (`newArchEnabled: true`) — neither library is imported or used in any component, hook, or store in the current codebase. All UI updates flow through the standard React reconciliation path via `useState`, `useMemo`, and Zustand's `set()`.

The New Architecture does, however, provide architectural benefits independent of Reanimated: the new JSI (JavaScript Interface) replaces the legacy bridge with synchronous C++ bindings, reducing overhead for native module calls including BLE operations through `react-native-ble-plx`.

### 5.2 BLE Batching & Throughput

- **Batch size:** 100 float32 samples per MQTT publish
- **Sample size:** 4 bytes (IEEE 754 float32, little-endian)
- **Accumulation:** Module-level array (`dataAccumulator`) avoids React state overhead during accumulation. Only the completed batch is committed to Zustand state.
- **Estimated throughput:** At a typical IMU sampling rate of 100 Hz, one batch fills in approximately 1 second. The exact rate depends on the ESP32-C3 firmware's notification frequency and the number of samples packed per BLE notification (which depends on the negotiated MTU).

### 5.3 MQTT Publish Frequency

Each batch of 100 samples triggers exactly one MQTT publish. At ~100 Hz sensor output, this yields approximately **1 MQTT message per second**, each carrying a JSON payload of ~800–1200 bytes (100 floats serialized as JSON array elements).

### 5.4 REST API Polling

During an active recording session, the Activity screen polls the backend's `/patients/me/windowReport` endpoint every **30 seconds** (`WINDOW_REPORT_INTERVAL_MS = 30_000`). Each poll returns the latest 30-second analysis window with computed gait metrics (steps, distance, calories, anomaly score, gait health classification). These results are accumulated in local session totals for display.

### 5.5 Theoretical Latency Bounds (Sensor to Cloud)

| Segment | Estimated Latency | Notes |
|---------|-------------------|-------|
| IMU sample → BLE notification | ~10 ms | Depends on ESP32-C3 firmware buffering and BLE connection interval |
| BLE notification → decoded float | < 1 ms | Buffer decode is synchronous JavaScript |
| Accumulation to 100 samples | ~1 s | At 100 Hz sensor rate |
| MQTT publish → broker acknowledgement | 50–200 ms | Depends on network conditions; QoS 1 requires broker ACK |
| **Total (first sample in batch to cloud)** | **~1.2–1.5 s** | Dominated by the batching window |

The batching window is the primary contributor to end-to-end latency. This is a deliberate trade-off: smaller batches would reduce latency but increase MQTT overhead and broker load.

### 5.6 Android-Specific Optimizations

- **MTU Expansion** (`requestMTU(256)`): The default BLE MTU is 23 bytes (20 bytes payload). Expanding to 256 bytes allows the ESP32-C3 to pack more samples per notification, reducing the number of BLE transactions required to fill a batch.
- **Connection Priority** (`requestConnectionPriority(1)`): Setting high priority reduces the BLE connection interval (time between communication events), improving throughput at the cost of increased power consumption.

---

## 6. Security Design

### 6.1 JWT Lifecycle

| Phase | Mechanism |
|-------|-----------|
| **Acquisition** | `POST /api/v1/auth/login` with form-encoded `username` and `password`. Returns `{ access_token, token_type }`. |
| **Storage** | Saved via `expo-secure-store` under the key `auth_token`. On iOS, this uses Keychain Services (hardware-backed encryption on devices with Secure Enclave). On Android, this uses the Android Keystore system with EncryptedSharedPreferences. |
| **Usage** | Attached as `Authorization: Bearer {token}` header on all authenticated API requests via `api/client.ts`. |
| **Invalidation** | On any 401 response, the API client (`api/client.ts:29–37`) clears all four secure storage keys (`auth_token`, `user_role`, `selected_patient_id`/`username`, `username`) via `Promise.all()` and redirects to `/login`. |
| **Refresh** | **Not implemented.** There is no refresh token mechanism. When the JWT expires, the user must re-authenticate. |

### 6.2 Why `expo-secure-store` Over AsyncStorage

`AsyncStorage` (via `@react-native-async-storage/async-storage`, which is also present as a dependency) stores data as unencrypted JSON files on the device filesystem. Any process with file-system access — or any attacker with physical access to an unencrypted device backup — can read these values in plaintext.

`expo-secure-store` delegates to the operating system's secure credential storage:
- **iOS:** Keychain Services, which encrypts data with a key derived from the device passcode and, on supported hardware, stores the encryption key in the Secure Enclave.
- **Android:** Android Keystore with AES-256-GCM encryption, where the key material never leaves the hardware security module on supported devices.

For an application handling health-related gait telemetry, this distinction is material: even if the JWT does not directly contain PHI (Protected Health Information), it grants access to patient gait data and anomaly reports through the API. Secure storage ensures the token is protected at rest.

### 6.3 MQTT Transport Security

- **Protocol:** WebSocket Secure (`wss://`) over TLS, enforced by the `normalizeBrokerUrl()` function which rejects non-WSS URLs.
- **Authentication:** Per-session username/password credentials fetched from the authenticated backend endpoint (`/api/v1/mqtt-credential/me`). Credentials are not stored on the device beyond the session lifetime.
- **Topic Scoping:** The telemetry token embedded in the topic string (`gait/telemetry/{token}`) is generated server-side per session, preventing one patient's client from publishing to another patient's topic (assuming broker-side ACL enforcement).

### 6.4 BLE Permission Model

**iOS:**
- Declared in `Info.plist`:
  - `NSBluetoothAlwaysUsageDescription`: Required for Bluetooth access. Displays a system prompt explaining why the app needs Bluetooth.
  - `NSBluetoothPeripheralUsageDescription`: Required for communicating with BLE peripherals.
  - `UIBackgroundModes: ["bluetooth-central"]`: Declares capability for background BLE operation (though the current implementation does not actively use background streaming).
- No runtime permission code is needed on iOS; the system prompts automatically on first BLE access.

**Android:**
- Declared in `AndroidManifest.xml`: `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`.
- Runtime permissions requested in `requestBlePermissions()` (`store/ble-store.ts:32–53`):
  - **API level >= 31 (Android 12+):** Requests `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, and `ACCESS_FINE_LOCATION`.
  - **API level < 31:** Requests only `ACCESS_FINE_LOCATION` (BLE scanning on older Android versions is gated by location permission).

---

## 7. Navigation & Role-Based Access

### 7.1 Route Hierarchy

The application uses Expo Router (file-based routing) with the following structure:

```
app/
├── _layout.tsx              Root Stack (AuthProvider + ThemeProvider)
├── index.tsx                Entry point: reads token/role, redirects accordingly
├── onboarding.tsx           First-launch welcome screen
├── login.tsx                Username/password authentication
├── register.tsx             Account creation (email, username, password, role)
├── create-profile.tsx       Post-registration profile setup (name, age, height, weight)
├── forgot-password.tsx      Email-based password recovery
├── reset-password.tsx       OTP verification + new password
└── (tabs)/
    ├── _layout.tsx          Tab navigator with role-based visibility
    ├── home.tsx             Gait dashboard (metrics, trends, fall analysis)
    ├── activity.tsx         Real-time recording session (BLE → MQTT) [patient only]
    ├── notification.tsx     Notification center (mock data)
    ├── ble-connection.tsx   BLE device scanning & connection [patient only]
    ├── profile.tsx          User settings, theme toggle, logout
    ├── patient-selection.tsx Caretaker patient picker (hidden tab, no tab bar)
    ├── metric-detail.tsx    Single-metric deep dive (hidden tab, param-driven)
    ├── my-info.tsx          Edit profile information (hidden tab, no tab bar)
    ├── ble-unavailable.tsx  Fallback when BLE is not supported (hidden tab)
    └── test.tsx             Development testing screen (hidden tab)
```

### 7.2 Authentication Guard

The entry point (`app/index.tsx`) runs on every focus event via `useFocusEffect`. It reads `token` and `role` from the `AuthContext`:
- **No token:** Redirects to `/onboarding`.
- **Role = patient:** Redirects to `/(tabs)/home`.
- **Role = caretaker:** Redirects to `/(tabs)/patient-selection` (must select a patient before viewing data).

### 7.3 Role-Based Tab Visibility

In `app/(tabs)/_layout.tsx`, the `activity` and `ble-connection` tabs set `href: null` when the role is `"caretaker"` (or while the role is still loading). This hides these tabs from the tab bar entirely — caretakers cannot initiate BLE connections or recording sessions, as they are remote observers of patient data.

---

## 8. Data Model

### 8.1 Core Gait Metrics

The system tracks seven primary gait parameters, each derived from gyroscope Z-axis analysis:

| Metric | DB Field | UI Field | Unit | Clinical Significance |
|--------|----------|----------|------|----------------------|
| Cadence | Derived from `avg_swing_time` + `avg_stance_time` | `cadence` | steps/min | < 90: slow pace (mobility concern); 90–130: optimal; > 130: brisk |
| Swing Speed | `avg_max_gyr_ms` | `swingSpeed` | rad/s | < 4.5: low power (muscle weakness); >= 4.5: strong drive |
| Heel Impact | `avg_val_gyr_hs` | `heelImpact` | rad/s | > -1.5: guarded/limp; -4.5 to -1.5: controlled; < -4.5: heavy strike |
| Swing Time | `avg_swing_time` | `swingTime` | s | < 0.35: shuffling; 0.35–0.55: normal; > 0.55: slow swing |
| Stance Time | `avg_stance_time` | `stanceTime` | s | > 0.95: stiff/cautious; 0.55–0.95: normal; < 0.55: brief contact |
| Stride CV | `avg_stride_cv` | `stability` | % | > 8.8%: high fall risk; 5.5–8.8%: unsteady; <= 5.5%: stable |
| Total Steps | `total_steps` | `totalSteps` | steps | Daily activity indicator |

### 8.2 Anomaly Detection Schema

Each anomaly event contains:

```typescript
interface AnomalyLog {
  anomaly_id: string;
  window_id: string;           // Links to the 30-second analysis window
  patient_id: number;
  timestamp: string;           // ISO 8601
  anomaly_score: number | null;
  root_cause_feature: string | null;  // e.g., "avg_stride_cv", "avg_swing_time"
  z_score: number | null;      // Statistical deviation from patient's baseline
  current_val: number | null;  // Observed value
  normal_ref: number | null;   // Patient's baseline reference value
}
```

Gait health is classified by anomaly score thresholds: **healthy** (score <= 0.25), **moderate** (0.25 < score <= 0.4), **at-risk** (score > 0.4).

### 8.3 Report Aggregation Hierarchy

```
WindowReport (30-second window)
  └── DailyAverage (daily_report_id, report_date: "YYYY-MM-DD")
       └── WeeklyAverage (weekly_report_id, report_week: "YYYY-WW")
            └── MonthlyAverage (monthly_report_id, report_month: "YYYY-MM")
                 └── YearlyAverage (yearly_report_id, report_year: YYYY)
```

Each level aggregates the metrics from its children. The `FallAnalysisResponse` provides paired comparisons (previous vs. latest) at the weekly, monthly, and yearly levels, enabling trend detection.

---

## 9. REST API Surface

All endpoints are prefixed with `/api/v1` and require a Bearer token unless noted.

### 9.1 Authentication

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/login` | Form-encoded: `username`, `password` | `{ access_token, token_type }` |
| POST | `/auth/register` | JSON: `{ email, username, password, role }` | `{ access_token, token_type }` |
| POST | `/auth/forgot-password` | JSON: `{ email }` | Status message |
| POST | `/auth/reset-password` | JSON: `{ token, new_password }` | Status message |

### 9.2 Patient Endpoints (self-access)

| Method | Path | Response |
|--------|------|----------|
| GET | `/patients/me/dailyAverage` | `DailyAverage[]` |
| GET | `/patients/me/weeklyAverage` | `WeeklyAverage[]` |
| GET | `/patients/me/monthlyAverage` | `MonthlyAverage[]` |
| GET | `/patients/me/yearlyAverage` | `YearlyAverage[]` |
| GET | `/patients/me/dailyAverage/byDate?date_str=YYYY-MM-DD` | `DailyAverage` |
| GET | `/patients/me/windowReport` | `WindowReport` (latest 30-second window) |
| GET | `/patients/me/fallAnalysis?date_str=YYYY-MM-DD` | `FallAnalysisResponse` |
| GET | `/patients/me/benchmark` | `AllMetricsBenchmarkSchema` |
| GET | `/patients/me/anomalyLog` | `AnomalyLog[]` |
| POST | `/patients/me/sessions/stop` | Session stop confirmation |

### 9.3 Caretaker Endpoints (delegated access by patient username)

| Method | Path | Response |
|--------|------|----------|
| GET | `/caretakers/patients` | `PatientBrief[]` |
| GET | `/caretakers/patients/{username}` | `PatientProfile` |
| POST | `/caretakers/patients` | Link patient (body: `{ username }`) |
| DELETE | `/caretakers/patients/{username}` | Unlink patient |
| GET | `/caretakers/patients/dailyAverage/{username}` | `DailyAverage[]` |
| GET | `/caretakers/patients/weeklyAverage/{username}` | `WeeklyAverage[]` |
| GET | `/caretakers/patients/monthlyAverage/{username}` | `MonthlyAverage[]` |
| GET | `/caretakers/patients/yearlyAverage/{username}` | `YearlyAverage[]` |
| GET | `/caretakers/patients/dailyAverage/byDate/{username}?date_str=` | `DailyAverage \| null` |
| GET | `/caretakers/patients/fallAnalysis/{username}?date_str=` | `FallAnalysisResponse` |
| GET | `/caretakers/patients/benchmark/{username}` | `AllMetricsBenchmarkSchema` |
| GET | `/caretakers/patients/anomalyLog/{username}` | `AnomalyLog[]` |

### 9.4 MQTT Credentials

| Method | Path | Response |
|--------|------|----------|
| GET | `/mqtt-credential/me` | `{ broker_url, username, password, telemetry_token }` |

---

## 10. Limitations & Future Work

### 10.1 Current Limitations

1. **Single-Axis Telemetry.** The BNO085 IMU is a 9-DOF sensor (3-axis accelerometer, 3-axis gyroscope, 3-axis magnetometer), yet only the gyroscope Z-axis (`gyro_z`) is transmitted and published. The remaining 8 degrees of freedom are discarded at the firmware or mobile relay level. This limits the types of gait analysis the backend can perform — for example, lateral sway detection requires accelerometer data, and heading estimation requires magnetometer fusion.

2. **No Offline Data Buffering.** If the MQTT connection is lost during a recording session, BLE batches that arrive during the outage are published to a disconnected client and silently lost. There is no local queue or store-and-forward mechanism. In a clinical deployment, this could result in gaps in the telemetry record.

3. **No BLE Auto-Reconnection.** When the BLE connection drops (e.g., the patient walks out of range), the user must manually navigate to the Device screen, re-scan, and re-connect. There is no background reconnection loop or connection-lost notification.

4. **No JWT Refresh.** The authentication flow issues a single access token with no refresh mechanism. When the token expires, all API calls fail with 401 and the user is logged out. For clinical use where recording sessions may be long-running, this could interrupt active data collection.

5. **Notification Screen Uses Mock Data.** The notification tab (`app/(tabs)/notification.tsx`) renders static placeholder content. No notification API endpoint is consumed, and no push notification infrastructure (e.g., Firebase Cloud Messaging, APNs) is integrated.

6. **Background BLE Streaming Not Active.** While `UIBackgroundModes: ["bluetooth-central"]` is declared in the iOS Info.plist (enabling background BLE capability), the streaming implementation uses a foreground state flag (`isStreaming`) that is only checked when the characteristic monitor callback fires. The app does not implement background task management or background-safe state persistence.

7. **Hardcoded Assumptions.**
   - BLE UUIDs are loaded from `.env` but are specific to a single ESP32-C3 firmware build
   - The API base URL defaults to a local network IP (`http://10.44.162.49:8000`)
   - The batch size (100 samples) is a compile-time constant, not configurable
   - Gait health thresholds (anomaly score boundaries, metric status thresholds) are hardcoded in the mobile client rather than fetched from the backend

### 10.2 Future Work

- **Multi-Axis IMU Telemetry:** Extend the BLE frame format and MQTT payload to include all 9 DOF, enabling richer gait analysis (lateral stability, heading changes during turns, impact force magnitude).
- **Offline Queue with Store-and-Forward:** Implement a local SQLite or MMKV buffer for BLE batches when MQTT is unavailable, with automatic drain when connectivity resumes.
- **MQTT Subscriptions for Real-Time Alerts:** Subscribe to a patient-specific anomaly alert topic (e.g., `gait/alerts/{patient_id}`) to push fall-risk warnings to the caretaker's device in real time, rather than relying on REST polling.
- **OAuth2 Refresh Token Flow:** Implement refresh tokens with silent renewal to prevent session interruption during long recordings.
- **Background BLE Streaming:** Implement iOS background task management and Android foreground service to maintain BLE data acquisition when the app is not in the foreground.
- **Configurable Thresholds:** Fetch gait health classification thresholds from the backend to allow per-patient or per-cohort customization without app updates.

---

## 11. Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React Native | 0.81.5 |
| Platform SDK | Expo | ~54.0.20 |
| Language | TypeScript | ~5.9.2 |
| React | React | 19.1.0 |
| Navigation | expo-router | ~6.0.13 |
| BLE | react-native-ble-plx | ^3.5.0 |
| MQTT | precompiled-mqtt | ^4.3.14-beta |
| State Management | Zustand | ^5.0.11 |
| Secure Storage | expo-secure-store | ~15.0.8 |
| Form Validation | react-hook-form + zod | ^7.71.2 / ^4.3.6 |
| Animation (declared) | react-native-reanimated | ~4.1.1 |
| JS Engine | Hermes | Enabled |
| Architecture | React Native New Architecture | Enabled |

---

## 12. Local Environment Provisioning

### Prerequisites

- [Node.js 18+](https://nodejs.org) and npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- **iOS:** macOS with Xcode 15+ and CocoaPods (`sudo gem install cocoapods`)
- **Android:** Android Studio with a configured SDK and emulator, or a physical device with USB debugging enabled. Java 17 is required.

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set `EXPO_PUBLIC_API_URL` to your backend's address:

```
EXPO_PUBLIC_API_URL=http://<YOUR_WIFI_IP>:8000
```

### 3. iOS Build

```bash
npx pod-install
npx expo run:ios
```

### 4. Android Build

Ensure Java 17 is active (`java -version`). If using SDKMAN:

```bash
sdk install java 17.0.18-amzn
sdk use java 17.0.18-amzn
```

Then build:

```bash
npx expo run:android
```

### 5. Development Server (Expo Go)

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` to open in a simulator.
