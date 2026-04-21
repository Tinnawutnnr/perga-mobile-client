import { AnomalyChartSection } from "@/components/home/AnomalyChartSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useAnomalyData } from "@/hooks/use-anomaly-data";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePatientStore } from "@/store/patient-store";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AnomalyScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const { role, username } = useAuth();
  const { selectedPatient } = usePatientStore();
  const headerName = role === "caregiver" ? selectedPatient?.username : username;

  const {
    chartData,
    scale,
    setScale,
    loading,
    error,
    refresh,
  } = useAnomalyData();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <ThemedView style={styles.headerRow}>
          <View>
            <ThemedText style={styles.title}>Anomalies</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              Unusual movement patterns
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.avatarRow}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            {!!headerName && (
              <ThemedText style={styles.patientName} numberOfLines={1}>
                {headerName}
              </ThemedText>
            )}
            <View style={[styles.avatar, { backgroundColor: cardColor }]}>
              <Ionicons name="person" size={22} color={tintColor} />
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Error */}
        {error && (
          <ThemedText style={[styles.errorText, { color: C.error }]}>
            {error}
          </ThemedText>
        )}

        {/* Loading */}
        {loading && !chartData.length && (
          <ActivityIndicator
            color={tintColor}
            style={{ marginVertical: 32 }}
          />
        )}

        {/* Chart */}
        <AnomalyChartSection
          chartData={chartData}
          scale={scale}
          onScaleChange={setScale}
          loading={loading}
        />

        {/* Context note */}
        {!loading && (
          <View style={[styles.note, { backgroundColor: cardColor }]}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={C.muted}
            />
            <ThemedText style={[styles.noteText, { color: C.muted }]}>
              Tap any point on the chart to see which gait metrics were involved
              and how they compared to normal.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  title: { fontSize: 28, fontWeight: "700", lineHeight: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 180,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
