import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "../../hooks/use-theme-color";

export default function TabLayout() {
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
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="ble-connection"
        options={{
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
        }}
      />
    </Tabs>
  );
}
