import { useThemeContext } from "@/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  patientName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmModal = ({
  visible,
  patientName,
  onConfirm,
  onCancel,
}: Props) => {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const colors = {
    container: isDark ? "#1E1E1E" : "#FFFFFF",
    title: isDark ? "#FFFFFF" : "#000000",
    message: isDark ? "#AAAAAA" : "#808080",
    bold: isDark ? "#FFFFFF" : "#000000",
    cancelBorder: isDark ? "#3A3A3A" : "#E5E5E5",
    cancelText: isDark ? "#AAAAAA" : "#808080",
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.container }]}>
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.title }]}>
            Delete Patient
          </Text>
          <Text style={[styles.message, { color: colors.message }]}>
            Are you sure you want to delete{" "}
            <Text style={[styles.bold, { color: colors.bold }]}>
              {patientName}
            </Text>
            ? This action cannot be undone.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: colors.cancelBorder },
              ]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelText, { color: colors.cancelText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  bold: {
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
