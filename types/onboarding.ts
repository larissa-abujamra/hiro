export interface WritingPreferences {
  tone: "formal" | "detailed" | "concise";
  planFormat: "numbered_list" | "categories" | "prose";
  includeDateTime: boolean;
  includeDuration: boolean;
  includeSuggestedCID: boolean;
  includeSuggestedReturn: boolean;
}

export interface SpecialtyField {
  id: string;
  name: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface SpecialtySettings {
  // Psiquiatria
  scales?: string[];
  noteFormat?: "structured" | "narrative";
  // Pediatria
  includeGrowthPercentiles?: boolean;
  includeDevelopmentMilestones?: boolean;
  includeVaccineCalendar?: boolean;
  calculateAgeInMonths?: boolean;
  // Cardiologia
  calculateCardiovascularRisk?: boolean;
  includeECGTemplate?: boolean;
  recordLVEF?: boolean;
  // Ginecologia
  includePregnancyTracking?: boolean;
  recordLMP?: boolean;
  // Dermatologia
  useBodyMapping?: boolean;
  trackLesionEvolution?: boolean;
  // Ortopedia
  recordROM?: boolean;
  useAnatomicDiagrams?: boolean;
}

export interface OnboardingData {
  step: number;
  specialtyFields: SpecialtyField[];
  writingPreferences: WritingPreferences;
  specialtySettings: SpecialtySettings;
  uploadedFiles?: File[];
}
