import PrimaryInput from "@/components/primary-input";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onConfirm: (username: string) => Promise<void>;
  onCancel: () => void;
};

const AddPatientModal = ({ visible, onConfirm, onCancel }: Props) => {
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
        <View style={styles.container}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add Patient</Text>
          <Text style={styles.subtitle}>
            Enter the patient's username to link them to your account
          </Text>

          <PrimaryInput
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError(null);
            }}
            placeholder="Patient username"
            keyboardType="default"
            hasError={!!error}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                (!username.trim() || isLoading) && styles.addButtonDisabled,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.addText}>Add</Text>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 20,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginTop: -8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#808080",
  },
  addButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#B0C8CA",
  },
  addText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
