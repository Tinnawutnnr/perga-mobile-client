import { router } from "expo-router";
import { useState } from "react";
import { mockPatients, Patient } from "../data/mockPatient";

export const usePatientSelection = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const handleSelect = (id: number) => setSelectedId(id);

  const handleConfirm = () => {
    if (selectedId === null) return;
    router.replace("/(tabs)/home");
  };

  const handleEditConfirm = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) setSelectedId(null);
    setDeleteTarget(null);
  };

  return {
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
  };
};
