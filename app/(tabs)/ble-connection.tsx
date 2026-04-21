import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useBleStore } from "@/store/ble-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../../components/themed-text";
import BleNotAvailablePage from "./ble-unavailable";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex))
    return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Signal Bars ──────────────────────────────────────────────────────────────

function SignalBars({
  rssi,
  tintColor,
  mutedColor,
}: {
  rssi: number | null;
  tintColor: string;
  mutedColor: string;
}) {
  const level =
    rssi == null ? 0 : rssi > -50 ? 3 : rssi > -70 ? 2 : rssi > -90 ? 1 : 0;
  return (
    <View style={sigStyles.row}>
      {([5, 8, 11] as const).map((h, i) => (
        <View
          key={i}
          style={[
            sigStyles.bar,
            {
              height: h,
              backgroundColor: i < level ? tintColor : mutedColor,
              opacity: i < level ? 1 : 0.28,
            },
          ]}
        />
      ))}
    </View>
  );
}

const sigStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 4, borderRadius: 1 },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const RING_SIZE = 120;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BLEConnectionScreen() {
  const isScanning = useBleStore((s) => s.isScanning);
  const foundDevices = useBleStore((s) => s.foundDevices);
  const connectedDevice = useBleStore((s) => s.connectedDevice);
  const isStreaming = useBleStore((s) => s.isStreaming);
  const isWeb = useBleStore((s) => s.isWeb);
  const scanForDevices = useBleStore((s) => s.scanForDevices);
  const connectToDevice = useBleStore((s) => s.connectToDevice);
  const disconnectDevice = useBleStore((s) => s.disconnectDevice);

  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  // ── Sonar ring animation ─────────────────────────────────────────────────
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.85)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!isScanning) {
      ring1Opacity.setValue(0);
      ring1Scale.setValue(0.85);
      ring2Opacity.setValue(0);
      ring2Scale.setValue(0.85);
      return;
    }

    let mounted = true;

    const runRing = (
      opacity: Animated.Value,
      scale: Animated.Value,
      delay: number,
    ) => {
      const tick = () => {
        if (!mounted) return;
        opacity.setValue(0.48);
        scale.setValue(0.85);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1700,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.6,
            duration: 1700,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished && mounted) tick();
        });
      };
      const t = setTimeout(tick, delay);
      return t;
    };

    const t1 = runRing(ring1Opacity, ring1Scale, 0);
    const t2 = runRing(ring2Opacity, ring2Scale, 850);

    return () => {
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isScanning]);

  // ── Derived mode ─────────────────────────────────────────────────────────
  const mode = connectedDevice
    ? "connected"
    : isScanning
      ? "scanning"
      : foundDevices.length > 0
        ? "found"
        : "idle";

  if (isWeb) return <BleNotAvailablePage />;

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 48,
        }}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={styles.title}>Device</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              Gait sensor
            </ThemedText>
          </View>
          {mode === "connected" && (
            <View
              style={[
                styles.connectedBadge,
                { backgroundColor: hexToRGBA(C.success, 0.1) },
              ]}
            >
              <View
                style={[
                  styles.connectedBadgeDot,
                  { backgroundColor: C.success },
                ]}
              />
              <ThemedText
                style={[styles.connectedBadgeText, { color: C.success }]}
              >
                Connected
              </ThemedText>
            </View>
          )}
        </View>

        {/* ── IDLE ── */}
        {mode === "idle" && (
          <View style={styles.idlePanel}>
            <Ionicons
              name="watch-outline"
              size={44}
              color={tintColor}
              style={styles.idleIcon}
            />
            <ThemedText style={styles.idleHeadline}>
              Connect your sensor
            </ThemedText>
            <ThemedText style={[styles.idleBody, { color: C.muted }]}>
              Make sure your gait sensor is powered on and within range of this
              device.
            </ThemedText>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={scanForDevices}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Scan for sensor"
            >
              <Ionicons name="bluetooth" size={18} color="#FFFFFF" />
              <ThemedText style={styles.primaryButtonLabel}>
                Scan for sensor
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SCANNING ── */}
        {mode === "scanning" && (
          <View style={styles.scanPanel}>
            <View style={styles.sonarContainer}>
              <Animated.View
                style={[
                  styles.sonarRing,
                  {
                    borderColor: tintColor,
                    opacity: ring1Opacity,
                    transform: [{ scale: ring1Scale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.sonarRing,
                  {
                    borderColor: tintColor,
                    opacity: ring2Opacity,
                    transform: [{ scale: ring2Scale }],
                  },
                ]}
              />
              <View
                style={[
                  styles.sonarCenter,
                  { backgroundColor: hexToRGBA(tintColor, 0.08) },
                ]}
              >
                <Ionicons name="watch-outline" size={28} color={tintColor} />
              </View>
            </View>
            <ThemedText style={styles.scanHeadline}>
              Searching nearby…
            </ThemedText>
            <ThemedText style={[styles.scanBody, { color: C.muted }]}>
              Looking for BLE devices within range
            </ThemedText>
          </View>
        )}

        {/* ── FOUND (scan finished, devices available) ── */}
        {mode === "found" && (
          <View style={styles.foundHeader}>
            <ThemedText style={styles.foundHeadline}>
              {foundDevices.length === 1
                ? "1 device found"
                : `${foundDevices.length} devices found`}
            </ThemedText>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor }]}
              onPress={scanForDevices}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Scan again"
            >
              <Ionicons name="refresh" size={15} color={tintColor} />
              <ThemedText
                style={[styles.secondaryButtonLabel, { color: tintColor }]}
              >
                Scan again
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* ── DEVICE LIST (scanning or found) ── */}
        {(mode === "scanning" || mode === "found") &&
          foundDevices.length > 0 && (
            <View style={styles.deviceSection}>
              {mode === "scanning" && (
                <ThemedText
                  style={[styles.sectionLabel, { color: C.muted }]}
                >
                  NEARBY DEVICES
                </ThemedText>
              )}
              <View
                style={[
                  styles.deviceListCard,
                  { backgroundColor: cardColor },
                ]}
              >
                {foundDevices.map((device, index) => {
                  const isLast = index === foundDevices.length - 1;
                  return (
                    <View key={device.id}>
                      <TouchableOpacity
                        style={styles.deviceRow}
                        onPress={() => connectToDevice(device.rawDevice)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Connect to ${device.name ?? "Unknown"}`}
                      >
                        <View style={styles.deviceRowLeft}>
                          <ThemedText style={styles.deviceName}>
                            {device.name ?? "Unknown Device"}
                          </ThemedText>
                          <ThemedText
                            style={[styles.deviceHint, { color: tintColor }]}
                          >
                            Tap to connect
                          </ThemedText>
                        </View>
                        <View style={styles.deviceRowRight}>
                          <SignalBars
                            rssi={device.rssi}
                            tintColor={tintColor}
                            mutedColor={mutedColor}
                          />
                          {device.rssi != null && (
                            <ThemedText
                              style={[
                                styles.rssiLabel,
                                { color: C.muted },
                              ]}
                            >
                              {device.rssi} dBm
                            </ThemedText>
                          )}
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={mutedColor}
                          />
                        </View>
                      </TouchableOpacity>
                      {!isLast && (
                        <View
                          style={[
                            styles.hairline,
                            { backgroundColor: borderColor },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

        {/* ── CONNECTED ── */}
        {mode === "connected" && (
          <View style={styles.connectedPanel}>
            {/* Device info block */}
            <View
              style={[styles.connectedCard, { backgroundColor: cardColor }]}
            >
              <ThemedText
                style={[styles.connectedLabel, { color: C.muted }]}
              >
                CONNECTED TO
              </ThemedText>
              <ThemedText
                style={styles.connectedDeviceName}
                numberOfLines={1}
              >
                {connectedDevice!.name ?? "Unknown Device"}
              </ThemedText>

              <View style={styles.connectedMetaRow}>
                <SignalBars
                  rssi={connectedDevice!.rssi ?? null}
                  tintColor={tintColor}
                  mutedColor={mutedColor}
                />
                {connectedDevice!.rssi != null && (
                  <ThemedText
                    style={[styles.connectedRssi, { color: C.muted }]}
                  >
                    {connectedDevice!.rssi} dBm
                  </ThemedText>
                )}
                <View
                  style={[
                    styles.streamingPill,
                    {
                      backgroundColor: hexToRGBA(
                        isStreaming ? C.success : C.muted,
                        0.1,
                      ),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.streamingDot,
                      {
                        backgroundColor: isStreaming ? C.success : C.muted,
                      },
                    ]}
                  />
                  <ThemedText
                    style={[
                      styles.streamingLabel,
                      { color: isStreaming ? C.success : C.muted },
                    ]}
                  >
                    {isStreaming ? "Receiving data" : "Sensor ready"}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Disconnect */}
            <TouchableOpacity
              style={[
                styles.disconnectButton,
                { borderColor: hexToRGBA(C.error, 0.35) },
              ]}
              onPress={disconnectDevice}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Disconnect sensor"
            >
              <ThemedText
                style={[styles.disconnectLabel, { color: C.error }]}
              >
                Disconnect sensor
              </ThemedText>
            </TouchableOpacity>

            {/* Info note */}
            <View style={[styles.infoNote, { backgroundColor: cardColor }]}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={C.muted}
              />
              <ThemedText
                style={[styles.infoNoteText, { color: C.muted }]}
              >
                Keep the sensor within range to maintain connection and ensure
                accurate gait data.
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  title: { fontSize: 28, fontWeight: "700", lineHeight: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectedBadgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  connectedBadgeText: { fontSize: 13, fontWeight: "600" },

  // Idle panel
  idlePanel: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  idleIcon: { marginBottom: 20, opacity: 0.9 },
  idleHeadline: { fontSize: 22, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  idleBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 36,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 32,
    width: "100%",
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },

  // Scan panel
  scanPanel: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  sonarContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  sonarRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
  },
  sonarCenter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  scanHeadline: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  scanBody: { fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 32 },

  // Found header
  foundHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  foundHeadline: { fontSize: 18, fontWeight: "700" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryButtonLabel: { fontSize: 14, fontWeight: "600" },

  // Device list
  deviceSection: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  deviceListCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  deviceRowLeft: { flex: 1, gap: 4, paddingRight: 12 },
  deviceName: { fontSize: 15, fontWeight: "600" },
  deviceHint: { fontSize: 12, fontWeight: "500" },
  deviceRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rssiLabel: { fontSize: 11, fontWeight: "500" },
  hairline: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

  // Connected panel
  connectedPanel: { gap: 12 },
  connectedCard: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 6,
  },
  connectedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  connectedDeviceName: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 32,
    marginBottom: 12,
  },
  connectedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  connectedRssi: { fontSize: 12, fontWeight: "500" },
  streamingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streamingDot: { width: 6, height: 6, borderRadius: 3 },
  streamingLabel: { fontSize: 12, fontWeight: "600" },
  disconnectButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectLabel: { fontSize: 15, fontWeight: "600" },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
