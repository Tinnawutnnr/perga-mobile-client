import { PatientBrief } from "@/api/caretaker";
import AddPatientModal from "@/components/patient-component/add-patient-modal";
import DeleteConfirmModal from "@/components/patient-component/delete-confirm";
import PatientCard from "@/components/patient-component/patient-card";
import { useAuth } from "@/context/auth-context";
import { usePatientSelection } from "@/hooks/use-patients";
import { usePatientStore } from "@/store/patient-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PatientSelectionScreen = () => {
  const router = useRouter(); // <-- Initialize the router
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const primaryOnPrimaryColor = isDarkMode ? "#000000" : "#FFFFFF";
  const emptyIconColor = isDarkMode ? "#4F7D81" : "#B0C8CA";

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

  const { clearToken } = useAuth();
  const { setSelectedPatient } = usePatientStore();

  const handleLogout = async () => {
    await clearToken();
    setSelectedPatient(null);
    router.replace("/login");
  };

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
              <Ionicons name="add" size={24} color={primaryOnPrimaryColor} />
            </TouchableOpacity>
          </View>

          {/* Render when patient found, otherwise show no patient found */}
          {patients.length > 0 ? (
            patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                isSelected={selectedId === patient.id}
                onPress={handleSelect}
                onDelete={setDeleteTarget}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={emptyIconColor} />
              <Text style={styles.emptyTitle}>No Patients Found</Text>
              <Text style={styles.emptySubtitle}>
                Please add a patient or create account for before proceeding.
              </Text>
            </View>
          )}

          {/* Conditionally render Back button or Confirm button based on patients length */}
          {patients.length === 0 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
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
                <ActivityIndicator color={primaryOnPrimaryColor} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modals remain the same */}
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
  emptyContainer: {
    paddingVertical: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4F7D81",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#808080",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F2F2F2", // A neutral color for the back button
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  backButtonText: {
    color: "#4F7D81", // Brand color text on neutral background
    fontSize: 16,
    fontWeight: "600",
  },
});
