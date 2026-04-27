import { PatientBrief } from "@/api/caregiver";
import AddPatientModal from "@/components/patient-component/add-patient-modal";
import DeleteConfirmModal from "@/components/patient-component/delete-confirm";
import PatientCard from "@/components/patient-component/patient-card";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/fonts";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePatientSelection } from "@/hooks/use-patients";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePatientStore } from "@/store/patient-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const PatientSelectionScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

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

  const canConfirm = !!selectedId && !isConfirming;

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, gap: 3 }}>
            <ThemedText style={styles.title}>Your patients</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              Select who you&apos;re monitoring today
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <ThemedText style={[styles.signOutText, { color: mutedColor }]}>
              Sign out
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Patient list */}
        {patients.length > 0 ? (
          <View
            style={[
              styles.listContainer,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            {patients.map((patient, index) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                isSelected={selectedId === patient.id}
                onPress={handleSelect}
                onDelete={setDeleteTarget}
                isLast={index === patients.length - 1}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyBlock}>
            <View
              style={[
                styles.emptyDisc,
                { backgroundColor: hexToRGBA(tintColor, 0.08) },
              ]}
            >
              <Ionicons name="people-outline" size={30} color={tintColor} />
            </View>
            <ThemedText style={styles.emptyTitle}>No patients yet</ThemedText>
            <ThemedText type="muted" style={styles.emptyBody}>
              Add a patient by their username to start monitoring their gait
              health.
            </ThemedText>
          </View>
        )}

        {/* Add patient row */}
        <TouchableOpacity
          style={styles.addRow}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add a patient"
        >
          <Ionicons name="add-circle-outline" size={17} color={tintColor} />
          <ThemedText style={[styles.addText, { color: tintColor }]}>
            Add a patient
          </ThemedText>
        </TouchableOpacity>

        {/* Spacer pushes button toward bottom */}
        <View style={{ flex: 1, minHeight: 32 }} />

        {/* Continue button — only shown when there are patients */}
        {patients.length > 0 && (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                backgroundColor: canConfirm
                  ? tintColor
                  : hexToRGBA(tintColor, 0.35),
              },
            ]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={!canConfirm}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canConfirm }}
            accessibilityLabel="Continue with selected patient"
          >
            {isConfirming ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.confirmText}>Continue</ThemedText>
            )}
          </TouchableOpacity>
        )}
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
    </View>
  );
};

export default PatientSelectionScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 34,
    fontFamily: Fonts.heading,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
  },

  listContainer: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 12,
  },

  emptyBlock: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyDisc: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 260,
  },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
  },

  confirmButton: {
    height: 60,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },
});
