import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'high_risk' | 'moderate_risk' | 'info' | 'device' | 'report';
  timestamp: Date;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low' | 'info';
}

// Mock data for notifications
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "High Risk Detected",
    message: "Gait pattern anomaly detected. Immediate attention required.",
    type: "high_risk",
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    isRead: false,
    severity: "high",
  },
  {
    id: "2",
    title: "Moderate Risk Alert",
    message: "Unusual walking pattern detected. Monitor recommended.",
    type: "moderate_risk", 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    severity: "medium",
  },
  {
    id: "3",
    title: "Device Disconnected",
    message: "Wearable Gait Detection device lost connection.",
    type: "device",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    isRead: true,
    severity: "medium",
  },
  {
    id: "4",
    title: "Weekly Report Ready",
    message: "Your weekly gait analysis report is available.",
    type: "report",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    severity: "info",
  },
  {
    id: "5",
    title: "Low Risk Alert",
    message: "Minor gait irregularity detected during evening walk.",
    type: "info",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    severity: "low",
  },
];

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'muted');

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    Alert.alert("Success", "All notifications marked as read");
  };

  const handleNotificationPress = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF9800';
      case 'low': return '#FFC107';
      case 'info': return tintColor;
      default: return mutedColor;
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'high_risk': return 'warning';
      case 'moderate_risk': return 'alert-circle-outline';
      case 'device': return 'bluetooth-outline';
      case 'report': return 'document-text-outline';
      case 'info': return 'information-circle-outline';
      default: return 'notifications-outline';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayNotifications = notifications.filter(n => isToday(n.timestamp));
  const earlierNotifications = notifications.filter(n => !isToday(n.timestamp));
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayAlertsCount = todayNotifications.filter(n => n.severity === 'high' || n.severity === 'medium').length;
  const weekAlertsCount = notifications.filter(n => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return n.timestamp > weekAgo && (n.severity === 'high' || n.severity === 'medium');
  }).length;

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: cardColor, borderColor },
        !item.isRead && { borderLeftWidth: 4, borderLeftColor: getSeverityColor(item.severity) }
      ]}
      onPress={() => handleNotificationPress(item.id)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.notificationContent}>
        <ThemedView style={styles.notificationHeader}>
          <Ionicons
            name={getSeverityIcon(item.type) as any}
            size={20}
            color={getSeverityColor(item.severity)}
          />
          <ThemedView style={styles.headerContent}>
            <ThemedText style={[styles.notificationTitle, !item.isRead && { fontWeight: '700' }]}>
              {item.title}
            </ThemedText>
            <ThemedText type="muted" style={styles.timestamp}>
              {formatTimeAgo(item.timestamp)}
            </ThemedText>
          </ThemedView>
          {!item.isRead && (
            <ThemedView style={[styles.unreadIndicator, { backgroundColor: getSeverityColor(item.severity) }]} />
          )}
        </ThemedView>
        <ThemedText type="muted" style={styles.notificationMessage}>
          {item.message}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Notifications</ThemedText>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.markAllButton, { backgroundColor: tintColor }]}
              onPress={handleMarkAllRead}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.markAllText}>Mark All Read</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Statistics Cards */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="today-outline" size={24} color="#FF9800" />
            <ThemedText style={styles.statValue}>{todayAlertsCount}</ThemedText>
            <ThemedText type="muted" style={styles.statLabel}>Alerts Today</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="calendar-outline" size={24} color={tintColor} />
            <ThemedText style={styles.statValue}>{weekAlertsCount}</ThemedText>
            <ThemedText type="muted" style={styles.statLabel}>This Week</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="mail-unread-outline" size={24} color="#4CAF50" />
            <ThemedText style={styles.statValue}>{unreadCount}</ThemedText>
            <ThemedText type="muted" style={styles.statLabel}>Unread</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Today's Notifications */}
        {todayNotifications.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Today</ThemedText>
            <FlatList
              data={todayNotifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </ThemedView>
        )}

        {/* Earlier Notifications */}
        {earlierNotifications.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Earlier</ThemedText>
            <FlatList
              data={earlierNotifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </ThemedView>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <ThemedView style={[styles.emptyState, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="notifications-outline" size={64} color={mutedColor} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>No Notifications</ThemedText>
            <ThemedText type="muted" style={styles.emptyText}>
              You're all caught up! New anomaly alerts will appear here.
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;

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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
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
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  notificationContent: {
    gap: 8,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginTop: 40,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});