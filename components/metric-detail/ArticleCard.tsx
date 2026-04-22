import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const ArticleCard = ({ data }: { data: MetricDetailData }) => {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <ThemedText style={styles.sectionTitle}>{data.articleTitle}</ThemedText>
      <ThemedText style={[styles.body, { color: mutedColor }]}>
        {data.articleBody}
      </ThemedText>
      <TouchableOpacity
        style={[styles.learnMore, { borderTopColor: borderColor }]}
        activeOpacity={0.7}
        accessibilityRole="link"
      >
        <ThemedText style={[styles.learnMoreText, { color: tintColor }]}>
          Learn more
        </ThemedText>
        <Ionicons name="arrow-forward" size={14} color={tintColor} />
      </TouchableOpacity>
    </View>
  );
};

export default ArticleCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.1,
    lineHeight: 22,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  learnMore: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
