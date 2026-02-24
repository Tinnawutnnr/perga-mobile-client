import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Patient } from "../../data/mockPatient";
import PrimaryInput from "../primary-input";

type Props = {
  visible: boolean;
  patient: Patient | null;
  onConfirm: (updated: Patient) => void;
  onCancel: () => void;
};

const EditPatientModal = ({ visible, patient, onConfirm, onCancel }: Props) => {
  const [fullname, setFullname] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (patient) {
      setFullname(patient.fullname);
      setHeight(String(patient.height));
      setWeight(String(patient.weight));
      setAge(String(patient.age));
    }
  }, [patient]);

  const handleSave = () => {
    if (!patient) return;
    onConfirm({
      ...patient,
      fullname,
      height: Number(height),
      weight: Number(weight),
      age: Number(age),
    });
  };

  const isValid =
    fullname.length > 0 &&
    Number(height) > 0 &&
    Number(weight) > 0 &&
    Number(age) >= 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Patient</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Full Name</Text>
            <PrimaryInput
              value={fullname}
              onChangeText={setFullname}
              placeholder="Full name"
            />
            <Text style={styles.label}>Age</Text>
            <PrimaryInput
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Height (cm)</Text>
            <PrimaryInput
              value={height}
              onChangeText={setHeight}
              placeholder="Height in cm"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Weight (kg)</Text>
            <PrimaryInput
              value={weight}
              onChangeText={setWeight}
              placeholder="Weight in kg"
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!isValid}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditPatientModal;

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
    maxHeight: "85%",
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
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#808080",
    marginBottom: 4,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#808080",
  },
  saveButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#B0C8CA",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
