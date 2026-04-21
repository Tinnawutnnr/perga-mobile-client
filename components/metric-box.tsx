import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  type GestureResponderEvent,
} from "react-native";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";
import { ThemedText } from "./themed-text";

export interface MetricBoxProps {
  label: string;
  infoText?: string;
  value?: string;
  subValue: string;
  status: string;
  statusColor?: string;
  /** @deprecated Icon is no longer displayed. Prop kept for backwards compatibility. */
  icon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

function normalizeHex(color: string, fallback: string) {
  if (!color) return fallback;
  const candidate = color.trim();
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(candidate)
    ? candidate
    : fallback;
}

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  let r, g, b;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MetricBox({
  label,
  infoText,
  value,
  subValue,
  status,
  statusColor = Colors.light.success,
  onPress,
  style,
}: MetricBoxProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];
  const [showInfo, setShowInfo] = useState(false);

  const handleInfoPress = (event: GestureResponderEvent) => {
    event.stopPropagation?.();
    if (!infoText) return;
    setShowInfo(true);
  };

  const resolvedStatusColor =
    statusColor in themeColors
      ? themeColors[statusColor as keyof typeof themeColors]
      : statusColor;
  const resolvedStatusHex = normalizeHex(
    String(resolvedStatusColor),
    String(themeColors.info),
  );

  const isPressable = Boolean(onPress);

  return (
    <>
      <TouchableOpacity
        style={[styles.row, style]}
        disabled={!isPressable}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole={isPressable ? "button" : "text"}
      >
        {/* Left column: label + status */}
        <View style={styles.leftCol}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            {infoText ? (
              <TouchableOpacity
                onPress={handleInfoPress}
                activeOpacity={0.8}
                style={styles.infoButton}
                hitSlop={8}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={themeColors.muted}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: resolvedStatusHex }]}
            />
            <ThemedText
              style={[styles.statusText, { color: resolvedStatusHex }]}
            >
              {status}
            </ThemedText>
          </View>
        </View>

        {/* Right column: value + unit + optional chevron */}
        <View style={styles.rightCol}>
          <View style={styles.valueRow}>
            <ThemedText style={styles.value}>{value}</ThemedText>
            {subValue ? (
              <ThemedText style={[styles.unit, { color: themeColors.muted }]}>
                {subValue}
              </ThemedText>
            ) : null}
          </View>
          {isPressable && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={themeColors.muted}
            />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={showInfo && Boolean(infoText)}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <Pressable
          style={styles.infoModalBackdrop}
          onPress={() => setShowInfo(false)}
        >
          <Pressable
            style={[
              styles.infoModalCard,
              {
                backgroundColor: Colors[colorScheme].card,
                borderColor: hexToRGBA(resolvedStatusHex, 0.3),
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.infoModalHeader}>
              <ThemedText style={styles.infoModalTitle}>{label}</ThemedText>
              <TouchableOpacity
                onPress={() => setShowInfo(false)}
                hitSlop={8}
                style={styles.infoModalClose}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={Colors[colorScheme].muted}
                />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.infoModalText}>{infoText}</ThemedText>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  leftCol: {
    flex: 1,
    gap: 5,
    paddingRight: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  infoButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  rightCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 12,
    fontWeight: "500",
  },
  // Info modal
  infoModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  infoModalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  infoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoModalTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoModalClose: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  infoModalText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
});
