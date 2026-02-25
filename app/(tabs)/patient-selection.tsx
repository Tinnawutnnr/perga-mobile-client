import CreatePatientModal from "@/components/patient-component/create-patient";
import DeleteConfirmModal from "@/components/patient-component/delete-confirm";
import EditPatientModal from "@/components/patient-component/edit-confirm";
import PatientCard from "@/components/patient-component/patient-card";
import { useThemeContext } from "@/context/theme-context";
import { usePatientSelection } from "@/hooks/use-patients";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PatientSelectionScreen = () => {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#000000",
    subtitle: isDark ? "#AAAAAA" : "#808080",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
  };

  const {
    patients,
    selectedId,
    editTarget,
    deleteTarget,
    createVisible,
    handleSelect,
    handleConfirm,
    setEditTarget,
    setDeleteTarget,
    setCreateVisible,
    handleEditConfirm,
    handleDeleteConfirm,
    handleCreateConfirm,
  } = usePatientSelection();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Select Patient
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                Choose a patient to continue monitoring
              </Text>
            </View>

            {/* Add button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setCreateVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

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

      {/* Create Modal */}
      <CreatePatientModal
        visible={createVisible}
        onConfirm={handleCreateConfirm}
        onCancel={() => setCreateVisible(false)}
      />

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
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
