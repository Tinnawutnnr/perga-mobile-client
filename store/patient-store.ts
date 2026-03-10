import { PatientProfile } from "@/api/caretaker";
import { create } from "zustand";

type SelectedPatient = PatientProfile & { username: string };

type PatientState = {
  selectedPatient: SelectedPatient | null;
  setSelectedPatient: (patient: SelectedPatient | null) => void;
};

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}));
