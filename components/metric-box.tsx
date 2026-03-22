import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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
import { ThemedView } from "./themed-view";

export interface MetricBoxProps {
  label: string;
  infoText?: string;
  value?: string;
  subValue: string;
  status: string;
  statusColor?: string;
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
  // Keep rgba generation deterministic for all status colors.
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
  icon,
  onPress,
  style,
}: MetricBoxProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];
  const [showInfo, setShowInfo] = useState(false);
  const hideInfoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showInfo) return;

    if (hideInfoTimer.current) {
      clearTimeout(hideInfoTimer.current);
    }

    hideInfoTimer.current = setTimeout(() => {
      setShowInfo(false);
    }, 3500);

    return () => {
      if (hideInfoTimer.current) {
        clearTimeout(hideInfoTimer.current);
      }
    };
  }, [showInfo]);

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
    <ThemedView
      style={[styles.container, style]}
      lightColor={Colors.light.card}
      darkColor={Colors.dark.card}
    >
      {/* Left accent bar */}
      <View
        style={[styles.accentBar, { backgroundColor: resolvedStatusHex }]}
      />
      <TouchableOpacity
        style={styles.content}
        disabled={!isPressable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icon */}
        {icon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: hexToRGBA(resolvedStatusHex, 0.1),
                borderRadius: 12,
              },
            ]}
          >
            {icon}
          </View>
        )}

        {/* Label */}
        <View style={styles.labelBlock}>
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
                  size={16}
                  color={themeColors.muted}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Status pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: hexToRGBA(resolvedStatusHex, 0.15),
                borderRadius: 20,
              },
            ]}
          >
            <ThemedText
              style={[styles.statusText, { color: resolvedStatusHex }]}
            >
              {status}
            </ThemedText>
          </View>
        </View>

        {/* Value block */}
        <View style={styles.rightContainer}>
          <View style={styles.valueRow}>
            <ThemedText style={styles.value}>{value}</ThemedText>
            {subValue && (
              <ThemedText style={styles.subValue}>{subValue}</ThemedText>
            )}
          </View>
          {isPressable && (
            <ThemedText
              style={[styles.tapHint, { color: Colors[colorScheme].tint }]}
            >
              Details
            </ThemedText>
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
                borderColor: hexToRGBA(resolvedStatusHex, 0.35),
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  labelBlock: {
    flex: 1,
    gap: 5,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: "hidden",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rightContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 30,
  },
  subValue: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: "500",
  },
  tapHint: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
  },
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
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginBottom: 4,
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
    lineHeight: 18,
    opacity: 0.85,
  },
});
