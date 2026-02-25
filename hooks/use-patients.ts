import { patientApi } from "@/api/patient-api";
import { secureStore } from "@/storage/patient-storage";
import { Patient } from "@/types/patient";
import { STORAGE_KEYS } from "@/types/secure-store";
import { router } from "expo-router";
import { useEffect, useState } from "react";

const CARETAKER_ID = 3; //change later when authcontext present

export const usePatientSelection = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await patientApi.getAll(CARETAKER_ID);
        setPatients(data);
      } catch (err) {
        setError("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    //console.log(id);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    await secureStore.set(STORAGE_KEYS.PATIENT_ID, String(selectedId));
    router.push("/(tabs)/home");
  };

  const handleEditConfirm = async (updated: Patient) => {
    try {
      await patientApi.update(CARETAKER_ID, updated.id, updated);
      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      setEditTarget(null);
    } catch (err) {
      setError("Failed to update patient");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await patientApi.delete(CARETAKER_ID, deleteTarget.id);
      setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
    } catch (err) {
      setError("Failed to delete patient");
    }
  };

  const handleCreateConfirm = async (
    data: Omit<Patient, "id" | "caretakerId">,
  ) => {
    try {
      await patientApi.create(CARETAKER_ID, data);
      // refetch list after create
      const updated = await patientApi.getAll(CARETAKER_ID);
      setPatients(updated);
      setCreateVisible(false);
    } catch (err) {
      setError("Failed to create patient");
    }
  };

  return {
    patients,
    selectedId,
    editTarget,
    deleteTarget,
    loading,
    error,
    handleSelect,
    handleConfirm,
    setEditTarget,
    setDeleteTarget,
    handleEditConfirm,
    handleDeleteConfirm,
    createVisible,
    handleCreateConfirm,
    setCreateVisible,
  };
};
