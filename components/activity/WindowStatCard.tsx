import { WindowReport } from "@/types/metric";
import {
  healthColor,
  healthLabel,
  modelStatusLabel,
} from "@/utils/activity-session";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type Props = {
  report: WindowReport | null; // ✅ Allow null from ActivityScreen
  cardColor: string;
  borderColor: string;
  tintColor: string;
};

export const WindowStatCard: React.FC<Props> = ({
  report,
  cardColor,
  borderColor,
  tintColor,
}) => {
  // Helper function to display value or "--"
  const val = (value: number | string | null | undefined, unit: string = "") => {
    if (value === null || value === undefined) return "--";
    return `${value}${unit}`;
  };

  const statusColor = healthColor(report?.gait_health ?? null);

  return (
    <ThemedView
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Per Window Stat</ThemedText>
        <ThemedView
          style={[
            styles.badge,
            {
              backgroundColor: statusColor + "20",
              minWidth: 104,
              alignItems: "center",
            },
          ]}
        >
          <ThemedText
            numberOfLines={1}
            style={[
              styles.badgeText,
              {
                color: statusColor,
              },
            ]}
          >
            {healthLabel(report?.gait_health ?? null)}
          </ThemedText>
        </ThemedView>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="muted" style={styles.metaLabel}>
          Status
        </ThemedText>
        <ThemedText style={styles.metaValue}>
          {modelStatusLabel(report?.status ?? null)}
        </ThemedText>
      </View>
      <View style={styles.metaRow}>
        <ThemedText type="muted" style={styles.metaLabel}>
          Anomaly Score
        </ThemedText>
        <ThemedText style={styles.metaValue}>
          {val(report?.anomaly_score)}
        </ThemedText>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <View style={styles.grid}>
        <ReportStat
          label="Max Swing Velocity"
          value={val(report?.max_gyr_ms, " deg/s")}
          color={tintColor}
        />
        <ReportStat
          label="Impact Intensity"
          value={val(report?.val_gyr_hs, " deg/s")}
          color={tintColor}
        />
        <ReportStat
          label="Swing Time"
          value={val(report?.swing_time, " sec")}
          color={tintColor}
        />
        <ReportStat
          label="Stance Time"
          value={val(report?.stance_time, " sec")}
          color={tintColor}
        />
        <ReportStat
          label="Stride Variability"
          value={val(report?.stride_cv, "%")}
          color={tintColor}
          fullWidth
        />
      </View>

      <ThemedText type="muted" style={styles.timestamp}>
        {report?.timestamp 
          ? new Date(report.timestamp).toLocaleTimeString() 
          : "--:--:--"}
      </ThemedText>
    </ThemedView>
  );
};

type ReportStatProps = {
  label: string;
  value: string | number;
  color: string;
  fullWidth?: boolean;
};

const ReportStat: React.FC<ReportStatProps> = ({
  label,
  value,
  color,
  fullWidth = false,
}) => (
  <View style={[styles.statCell, fullWidth && styles.statCellFull]}>
    <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
    <ThemedText type="muted" style={styles.statLabel}>
      {label}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCell: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 8,
  },
  statCellFull: {
    width: "100%",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 10,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 10,
    textAlign: "right",
  },
});