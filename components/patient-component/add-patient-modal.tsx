import PrimaryInput from "@/components/primary-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  visible: boolean;
  onConfirm: (username: string) => Promise<void>;
  onCancel: () => void;
};

const AddPatientModal = ({ visible, onConfirm, onCancel }: Props) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(username.trim());
      setUsername("");
    } catch (e: any) {
      setError(e?.message ?? "Patient not found or already linked");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setError(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: C.card }]}>
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          <ThemedText style={styles.title}>Add patient</ThemedText>
          <ThemedText type="muted" style={styles.subtitle}>
            Enter their username to link them to your account.
          </ThemedText>

          <PrimaryInput
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError(null);
            }}
            placeholder="Username"
            autoCapitalize="none"
            keyboardType="default"
            hasError={!!error}
          />
          {error && (
            <ThemedText style={[styles.errorText, { color: C.error }]}>
              {error}
            </ThemedText>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: C.border }]}
              onPress={handleCancel}
              activeOpacity={0.8}
              disabled={isLoading}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.cancelText, { color: C.muted }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: !username.trim() || isLoading ? C.border : C.tint },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={!username.trim() || isLoading}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.addText}>Add</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddPatientModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
