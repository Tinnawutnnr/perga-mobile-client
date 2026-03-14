import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const CompareButton = ({ label }: { label: string }) => (
  <TouchableOpacity
    style={styles.compareBtn}
    onPress={() =>
      router.push({ pathname: "/metric-compare", params: { label } })
    }
    activeOpacity={0.7}
  >
    <Ionicons name="bar-chart-outline" size={18} color="#fff" />
    <ThemedText style={styles.compareBtnText}>Compare in Detail</ThemedText>
    <Ionicons
      name="chevron-forward"
      size={16}
      color="#fff"
      style={{ marginLeft: "auto" }}
    />
  </TouchableOpacity>
);

export default CompareButton;

const styles = StyleSheet.create({
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#5D7DDF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  compareBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});