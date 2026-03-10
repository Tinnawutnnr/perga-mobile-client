import { PatientBrief } from "@/api/caretaker";
import AddPatientModal from "@/components/patient-component/add-patient-modal";
import DeleteConfirmModal from "@/components/patient-component/delete-confirm";
import PatientCard from "@/components/patient-component/patient-card";
import { usePatientSelection } from "@/hooks/use-patients";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PatientSelectionScreen = () => {
  const {
    patients,
    selectedId,
    isConfirming,
    showAddModal,
    setShowAddModal,
    handleSelect,
    handleConfirm,
    handleAddPatient,
    handleDeletePatient,
  } = usePatientSelection();

  const [deleteTarget, setDeleteTarget] = useState<PatientBrief | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Select Patient</Text>
              <Text style={styles.subtitle}>
                Choose a patient to continue monitoring
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isSelected={selectedId === patient.id}
              onPress={handleSelect}
              onDelete={setDeleteTarget}
            />
          ))}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedId || isConfirming) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={!selectedId || isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddPatientModal
        visible={showAddModal}
        onConfirm={handleAddPatient}
        onCancel={() => setShowAddModal(false)}
      />

      <DeleteConfirmModal
        visible={!!deleteTarget}
        patientName={
          deleteTarget
            ? `${deleteTarget.first_name ?? ""} ${deleteTarget.last_name ?? ""}`.trim()
            : ""
        }
        onConfirm={() => {
          if (deleteTarget) handleDeletePatient(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

export default PatientSelectionScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1, backgroundColor: "#FFFFFF" },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#808080",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  confirmButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  confirmButtonDisabled: { backgroundColor: "#B0C8CA" },
  confirmButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
