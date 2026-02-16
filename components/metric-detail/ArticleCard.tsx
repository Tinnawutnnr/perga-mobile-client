import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const ArticleCard = ({ data }: { data: MetricDetailData }) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        {data.articleTitle}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 13,
          color: mutedColor,
          lineHeight: 20,
          marginBottom: 12,
        }}
      >
        {data.articleBody}
      </ThemedText>
      <TouchableOpacity
        style={[styles.learnMore, { borderTopColor: borderColor }]}
      >
        <ThemedText type="defaultSemiBold" style={{ fontSize: 13 }}>
          Learn more
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={mutedColor} />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
  learnMore: {
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
});

export default ArticleCard;
