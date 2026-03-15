import { profileApi } from "@/api/profile";
import { usePatientStore } from "@/store/patient-store";
import { patientStorage } from "@/utils/token-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useAuth } from "../../context/auth-context";
import { useThemeContext } from "../../context/theme-context";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { useThemeColor } from "../../hooks/use-theme-color";

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const { toggleColorScheme } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const { setSelectedPatient } = usePatientStore();
  const { clearToken, role, token, username } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (!token) return;
    profileApi
      .getMe(token)
      .then((data) => {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
      })
      .catch(() => {});
  }, [token]);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const mutedColor = useThemeColor({}, "muted");

  const handleDarkModeToggle = () => {
    toggleColorScheme();
  };

  const handleLogout = async () => {
    // Clear persisted auth/session state so index route won't auto-redirect.
    await clearToken();
    setSelectedPatient(null);
    router.replace("/login");
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      title: "My Info",
      subtitle: "Edit your details",
      onPress: () => router.push("/(tabs)/my-info"),
    },
    ...(role === "caretaker"
      ? [
          {
            icon: "people-outline" as const,
            title: "Patient Selection",
            subtitle: "Select Patient",
            onPress: async () => {
              setSelectedPatient(null);
              await patientStorage.clear();
              router.push("/(tabs)/patient-selection");
            },
          },
        ]
      : []),
    {
      icon: "medical-outline" as const,
      title: "Historical Report",
      subtitle: "View your historical data",
      onPress: () => console.log("Health Profile"),
    },
    {
      icon: "bluetooth-outline" as const,
      title: "BLE Connection",
      subtitle: "Manage device connections",
      onPress: () => router.push("/ble-connection"),
    },
    {
      icon: "help-circle-outline" as const,
      title: "Help",
      subtitle: "Get support",
      onPress: () => console.log("Help"),
    },
    {
      icon: "information-circle-outline" as const,
      title: "About App",
      subtitle: "Version and app info",
      onPress: () => console.log("About"),
    },
  ];

  const settingsItems = [
    {
      icon: "notifications-outline" as const,
      title: "Notifications",
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
      type: "switch" as const,
    },
    {
      icon: "moon-outline" as const,
      title: "Dark Mode",
      value: colorScheme === "dark",
      onToggle: handleDarkModeToggle,
      type: "toggle" as const,
    },
    {
      icon: "location-outline" as const,
      title: "Location",
      value: locationEnabled,
      onToggle: setLocationEnabled,
      type: "switch" as const,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView transparent style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Profile
          </ThemedText>
        </ThemedView>

        {/* User Info Card */}
        <ThemedView
          style={[styles.userCard, { backgroundColor: cardColor, borderColor }]}
        >
          <ThemedView transparent style={styles.avatarContainer}>
            <ThemedView style={[styles.avatar, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.avatarText}>
                {firstName ? firstName.charAt(0).toUpperCase() : "?"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView transparent style={styles.userInfo}>
            <ThemedText style={styles.userName}>
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : "—"}
            </ThemedText>
            <ThemedText type="muted" style={styles.userEmail}>
              @{username ?? ""}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Menu Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: borderColor }]}
              onPress={item.onPress}
            >
              <ThemedView style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color={iconColor} />
              </ThemedView>
              <ThemedView style={styles.menuContent}>
                <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                <ThemedText type="muted" style={styles.menuSubtitle}>
                  {item.subtitle}
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Settings Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          {settingsItems.map((item, index) => (
            <ThemedView
              key={index}
              style={[styles.settingItem, { borderBottomColor: borderColor }]}
            >
              <ThemedView style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color={iconColor} />
              </ThemedView>
              <ThemedView style={styles.menuContent}>
                <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
              </ThemedView>
              <Switch
                value={item.value}
                onValueChange={
                  item.type === "toggle" ? () => item.onToggle() : item.onToggle
                }
                trackColor={{ false: borderColor, true: tintColor }}
                thumbColor={item.value ? "#FFFFFF" : "#f4f3f4"}
              />
            </ThemedView>
          ))}
        </ThemedView>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: cardColor, borderColor },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>

        {/* App Version */}
        <ThemedText type="muted" style={styles.versionText}>
          Version 1.0.0
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  userCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4444",
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarContainer: {
    marginRight: 16,
  },
});
