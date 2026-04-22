import { profileApi } from "@/api/profile";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/fonts";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useThemeContext } from "@/context/theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePatientStore } from "@/store/patient-store";
import { patientStorage } from "@/utils/token-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const { toggleColorScheme } = useThemeContext();
  const { setSelectedPatient } = usePatientStore();
  const { clearToken, role, token, username } = useAuth();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      profileApi
        .getMe(token)
        .then((data) => {
          setFirstName(data.first_name ?? "");
          setLastName(data.last_name ?? "");
        })
        .catch(() => {});
    }, [token]),
  );

  const handleLogout = async () => {
    await clearToken();
    setSelectedPatient(null);
    router.replace("/login");
  };

  const fullName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : null;
  const initial = (firstName || username || "?").charAt(0).toUpperCase();
  const roleLabel = role === "caregiver" ? "Caregiver" : role === "patient" ? "Patient" : null;

  // ── Menu items ──────────────────────────────────────────────────────────────

  const accountItems = [
    {
      icon: "person-outline" as const,
      label: "My info",
      onPress: () => router.push("/(tabs)/my-info"),
    },
    ...(role === "caregiver"
      ? [
          {
            icon: "people-outline" as const,
            label: "Switch patient",
            onPress: async () => {
              setSelectedPatient(null);
              await patientStorage.clear();
              router.push("/(tabs)/patient-selection");
            },
          },
        ]
      : []),
    {
      icon: "help-circle-outline" as const,
      label: "Help & support",
      onPress: () => {},
    },
    {
      icon: "information-circle-outline" as const,
      label: "About PERGA",
      onPress: () => {},
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 48,
          },
        ]}
      >
        {/* Page title */}
        <ThemedText style={styles.pageTitle}>Profile</ThemedText>

        {/* ── Identity block ────────────────────────────────────────────── */}
        <View style={styles.identityBlock}>
          <View style={[styles.avatarDisc, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.avatarInitial}>{initial}</ThemedText>
          </View>

          <View style={styles.identityText}>
            <ThemedText style={styles.displayName}>
              {fullName ?? username ?? "—"}
            </ThemedText>
            {username && (
              <ThemedText type="muted" style={styles.usernameText}>
                @{username}
              </ThemedText>
            )}
            {roleLabel && (
              <View
                style={[
                  styles.rolePill,
                  { backgroundColor: `${tintColor}14`, borderColor: `${tintColor}30` },
                ]}
              >
                <ThemedText style={[styles.roleText, { color: tintColor }]}>
                  {roleLabel}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* ── Account section ───────────────────────────────────────────── */}
        <ThemedText style={[styles.sectionLabel, { color: mutedColor }]}>
          ACCOUNT
        </ThemedText>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          {accountItems.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={item.onPress}
                activeOpacity={0.7}
                accessibilityRole="menuitem"
              >
                <Ionicons name={item.icon} size={20} color={mutedColor} />
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={C.border}
                />
              </TouchableOpacity>
              {i < accountItems.length - 1 && (
                <View
                  style={[styles.rowDivider, { backgroundColor: borderColor }]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ── Preferences section ───────────────────────────────────────── */}
        <ThemedText style={[styles.sectionLabel, { color: mutedColor }]}>
          PREFERENCES
        </ThemedText>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.menuRow}>
            <Ionicons
              name={scheme === "dark" ? "moon" : "moon-outline"}
              size={20}
              color={mutedColor}
            />
            <ThemedText style={styles.menuLabel}>Dark mode</ThemedText>
            <Switch
              value={scheme === "dark"}
              onValueChange={() => toggleColorScheme()}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        {/* ── Sign out ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.signOutCard,
            { backgroundColor: cardColor, borderColor },
          ]}
          onPress={handleLogout}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={18} color={C.error} />
          <ThemedText style={[styles.signOutText, { color: C.error }]}>
            Sign out
          </ThemedText>
        </TouchableOpacity>

        {/* Version */}
        <ThemedText
          type="muted"
          style={styles.version}
        >
          PERGA · v1.0.0
        </ThemedText>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 34,
    marginBottom: 28,
    fontFamily: Fonts.heading,
  },

  // Identity
  identityBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
  },
  avatarDisc: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 36,
  },
  identityText: {
    flex: 1,
    gap: 3,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  usernameText: {
    fontSize: 13,
    lineHeight: 18,
  },
  rolePill: {
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 52,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },

  // Sign out
  signOutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 32,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },

  version: {
    fontSize: 12,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
