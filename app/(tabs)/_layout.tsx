import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAuth } from "../../context/auth-context";
import { useThemeColor } from "../../hooks/use-theme-color";

export default function TabLayout() {
  const { role, isLoading } = useAuth();
  const hideRestrictedTabs = isLoading || role === "caregiver";
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tabIconDefault = useThemeColor({}, "tabIconDefault");
  const tabIconSelected = useThemeColor({}, "tabIconSelected");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          backgroundColor: cardColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: tabIconSelected,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          href: hideRestrictedTabs ? null : undefined,
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "fitness" : "fitness-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="anomaly"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="fall-analysis"
        options={{
          title: "Analysis",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "analytics" : "analytics-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "pulse" : "pulse-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="ble-connection"
        options={{
          href: hideRestrictedTabs ? null : undefined,
          title: "Device",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "watch" : "watch"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* use for test /test */}
      <Tabs.Screen
        name="test"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="metric-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="ble-unavailable"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="patient-selection"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="my-info"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
    </Tabs>
  );
}
