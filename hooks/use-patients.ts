import { caretakerApi, PatientBrief } from "@/api/caretaker";
import { useAuth } from "@/context/auth-context";
import { usePatientStore } from "@/store/patient-store";
import { patientStorage } from "@/utils/token-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export const usePatientSelection = () => {
  const { token } = useAuth();
  const { setSelectedPatient } = usePatientStore();

  const [patients, setPatients] = useState<PatientBrief[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    caretakerApi
      .getPatients(token)
      .then((data) => {
        console.log("Patients from API:", JSON.stringify(data));
        setPatients(data);
      })
      .catch((err) => console.error("Failed to load patients:", err));
  }, [token]);

  const handleSelect = (id: number) => setSelectedId(id);

  const handleConfirm = async () => {
    if (selectedId === null || !token) return;
    const brief = patients.find((p) => p.id === selectedId);
    if (!brief) return;

    setIsConfirming(true);
    try {
      const profile = await caretakerApi.getPatient(brief.username, token);
      setSelectedPatient({ ...profile, username: brief.username });
      await patientStorage.save(profile.id, brief.username);
      router.replace("/(tabs)/home");
    } catch (err) {
      console.error("Failed to load patient profile:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleAddPatient = async (username: string) => {
    if (!token) return;
    await caretakerApi.linkPatient(username, token);
    const updated = await caretakerApi.getPatients(token);
    setPatients(updated);
    setShowAddModal(false);
  };

  const handleDeletePatient = async (patient: PatientBrief) => {
    if (!token) return;
    try {
      await caretakerApi.unlinkPatient(patient.username, token);
      setPatients((prev) => prev.filter((p) => p.id !== patient.id));
      if (selectedId === patient.id) setSelectedId(null);
    } catch (err) {
      console.error("Failed to unlink patient:", err);
    }
  };

  return {
    patients,
    selectedId,
    isConfirming,
    showAddModal,
    setShowAddModal,
    handleSelect,
    handleConfirm,
    handleAddPatient,
    handleDeletePatient,
  };
};
