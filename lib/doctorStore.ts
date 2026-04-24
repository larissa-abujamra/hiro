"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DoctorProfile {
  nome: string;
  sobrenome: string;
  cpf: string;
  crm: string;
  uf: string;
  data_nascimento: string;
  sexo: "M" | "F";
  email: string;
  especialidade: string;
  clinica: string;
  clinic_address: string;
  rqe: string;
}

interface DoctorState {
  profile: DoctorProfile;
  selectedSpecialtyFields: string[];
  setProfile: (updates: Partial<DoctorProfile>) => void;
  setSelectedSpecialtyFields: (fields: string[]) => void;
  isProfileComplete: () => boolean;
}

const emptyProfile: DoctorProfile = {
  nome: "",
  sobrenome: "",
  cpf: "",
  crm: "",
  uf: "",
  data_nascimento: "",
  sexo: "F",
  email: "",
  especialidade: "",
  clinica: "",
  clinic_address: "",
  rqe: "",
};

export const useDoctorStore = create<DoctorState>()(
  persist(
    (set, get) => ({
      profile: emptyProfile,
      selectedSpecialtyFields: [],
      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      setSelectedSpecialtyFields: (fields) => set({ selectedSpecialtyFields: fields }),
      isProfileComplete: () => {
        const { nome, sobrenome, cpf, crm, uf, data_nascimento } =
          get().profile;
        return !!(nome && sobrenome && cpf && crm && uf && data_nascimento);
      },
    }),
    { name: "hiro-doctor-profile" },
  ),
);
