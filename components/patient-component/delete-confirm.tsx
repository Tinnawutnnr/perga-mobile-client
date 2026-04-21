import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  visible: boolean;
  patientName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmModal = ({ visible, patientName, onConfirm, onCancel }: Props) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: C.card }]}>
          <View style={[styles.iconDisc, { backgroundColor: `${C.error}18` }]}>
            <Ionicons name="person-remove-outline" size={22} color={C.error} />
          </View>

          <ThemedText style={styles.title}>Remove patient?</ThemedText>
          <ThemedText type="muted" style={styles.message}>
            {patientName
              ? `${patientName} will be unlinked from your account. You can add them again later.`
              : "This patient will be unlinked from your account. You can add them again later."}
          </ThemedText>

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.cancelText, { color: C.muted }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <View style={[styles.buttonDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.confirmText, { color: C.error }]}>
                Remove
              </ThemedText>
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    paddingTop: 28,
    overflow: "hidden",
  },
  iconDisc: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    height: 52,
  },
  buttonDivider: {
    width: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
