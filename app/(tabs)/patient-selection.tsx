import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeleteConfirmModal from "@/components/patient-component/delete-confirm";
import EditPatientModal from "@/components/patient-component/edit-confirm";
import PatientCard from "@/components/patient-component/patient-card";
import { usePatientSelection } from "@/hooks/use-patients";

const PatientSelectionScreen = () => {
  const {
    patients,
    selectedId,
    editTarget,
    deleteTarget,
    handleSelect,
    handleConfirm,
    setEditTarget,
    setDeleteTarget,
    handleEditConfirm,
    handleDeleteConfirm,
  } = usePatientSelection();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Select Patient</Text>
          <Text style={styles.subtitle}>
            Choose a patient to continue monitoring
          </Text>

          {patients.map((patient, index) => (
            <View key={patient.id} style={{ zIndex: patients.length - index }}>
              <PatientCard
                patient={patient}
                isSelected={selectedId === patient.id}
                onPress={handleSelect}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedId && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={!selectedId}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <EditPatientModal
        visible={!!editTarget}
        patient={editTarget}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditTarget(null)}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        visible={!!deleteTarget}
        patientName={deleteTarget?.fullname ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

export default PatientSelectionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 24,
  },
  confirmButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: "#B0C8CA",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
