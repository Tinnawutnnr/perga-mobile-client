import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { MetricBox } from "../../components/metric-box";
import { MetricGroup } from "../../components/metric-group";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Colors } from "../../constants/theme";
import { useColorScheme } from "../../hooks/use-color-scheme";

export default function TestScreen() {
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? "light"].icon;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.header}>
          Metric Box Test
        </ThemedText>

        <MetricGroup title="Sleep Metrics">
          <MetricBox
            label="Sleep Duration"
            value="7:31"
            subValue=""
            status="Optimal"
            statusColor="success"
            icon={<Ionicons name="time-outline" size={24} color={iconColor} />}
          />

          <MetricBox
            label="Sleep Regularity"
            value="63%"
            subValue=""
            status="Fair"
            statusColor="warning"
            icon={<Ionicons name="moon-outline" size={24} color={iconColor} />}
          />

          <MetricBox
            label="Deep"
            value="0:57"
            subValue="(13%)"
            status="Normal"
            statusColor="success"
            icon={<Ionicons name="body-outline" size={24} color={iconColor} />}
          />

          <MetricBox
            label="REM Sleep"
            value="1:15"
            subValue="(16%)"
            status="Normal"
            statusColor="success"
            icon={<Ionicons name="eye-outline" size={24} color={iconColor} />}
          />

          <MetricBox
            label="Awake"
            value="0:14"
            subValue="(2 times)"
            status="Normal"
            statusColor="success"
            icon={
              <Ionicons name="eye-off-outline" size={24} color={iconColor} />
            }
          />
        </MetricGroup>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginVertical: 20,
  },
});
