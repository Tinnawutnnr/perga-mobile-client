import { Patient } from "@/types/patient";
import client from "./client";

export const patientApi = {
  getAll: async (caretakerId: number): Promise<Patient[]> => {
    const res = await client.get(`/patient/${caretakerId}`);
    return res.data;
  },

  create: async (
    caretakerId: number,
    data: Omit<Patient, "id" | "caretakerId">,
  ): Promise<void> => {
    await client.post(`/patient/${caretakerId}`, data);
  },

  getById: async (caretakerId: number, patientId: number): Promise<Patient> => {
    const res = await client.get(`/patient/${caretakerId}/${patientId}`);
    return res.data;
  },

  update: async (
    caretakerId: number,
    patientId: number,
    data: Patient,
  ): Promise<void> => {
    await client.put(`/patient/${caretakerId}/${patientId}`, data);
  },

  delete: async (caretakerId: number, patientId: number): Promise<void> => {
    await client.delete(`/patient/${caretakerId}/${patientId}`);
  },
};
