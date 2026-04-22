import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ToastItem, useToastStore } from "@/store/toast-store";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";

export function ToastContainer() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  const [displayed, setDisplayed] = useState<ToastItem | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (current) {
      setDisplayed(current);
      // If replacing an existing toast, snap partially down before re-springing
      if (displayed && displayed.id !== current.id) {
        anim.setValue(0.6);
      }
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 110,
        friction: 13,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setDisplayed(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current === null]);

  if (!displayed) return null;

  const dotColor =
    displayed.type === "success"
      ? C.success
      : displayed.type === "error"
        ? C.error
        : displayed.type === "warning"
          ? C.warning
          : C.tint;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });

  return (
    <View
      style={[styles.overlay, { top: insets.top + 10 }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={{ opacity: anim, transform: [{ translateY }] }}
        pointerEvents="auto"
      >
        <TouchableOpacity
          style={[styles.toast, { backgroundColor: cardColor, borderColor }]}
          onPress={dismiss}
          activeOpacity={0.88}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={displayed.message}
        >
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <ThemedText style={styles.message} numberOfLines={2}>
            {displayed.message}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "stretch",
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
