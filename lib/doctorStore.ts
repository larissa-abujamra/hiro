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
}

interface DoctorState {
  profile: DoctorProfile;
  setProfile: (updates: Partial<DoctorProfile>) => void;
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
};

export const useDoctorStore = create<DoctorState>()(
  persist(
    (set, get) => ({
      profile: emptyProfile,
      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      isProfileComplete: () => {
        const { nome, sobrenome, cpf, crm, uf, data_nascimento } =
          get().profile;
        return !!(nome && sobrenome && cpf && crm && uf && data_nascimento);
      },
    }),
    { name: "hiro-doctor-profile" },
  ),
);
