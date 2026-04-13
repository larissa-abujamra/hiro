export const SPECIALTY_FIELDS: Record<string, { id: string; name: string }[]> = {
  "Cardiologia": [
    { id: "blood_pressure", name: "Pressão Arterial" },
    { id: "heart_rate", name: "Frequência Cardíaca" },
    { id: "cardiac_auscultation", name: "Ausculta Cardíaca" },
    { id: "peripheral_pulses", name: "Pulsos Periféricos" },
    { id: "edema", name: "Edema" },
    { id: "murmurs", name: "Sopros" },
    { id: "jugular_distension", name: "Turgência Jugular" },
    { id: "ecg_description", name: "ECG (descrição)" },
  ],
  "Psiquiatria": [
    { id: "appearance", name: "Aparência e Comportamento" },
    { id: "consciousness", name: "Nível de Consciência" },
    { id: "orientation", name: "Orientação" },
    { id: "attention", name: "Atenção e Concentração" },
    { id: "memory", name: "Memória" },
    { id: "mood", name: "Humor e Afeto" },
    { id: "thought", name: "Pensamento" },
    { id: "perception", name: "Sensopercepção" },
    { id: "judgment", name: "Juízo Crítico" },
    { id: "insight", name: "Insight" },
  ],
  "Pediatria": [
    { id: "weight", name: "Peso" },
    { id: "height", name: "Altura/Comprimento" },
    { id: "head_circumference", name: "Perímetro Cefálico" },
    { id: "fontanelle", name: "Fontanelas" },
    { id: "development", name: "Desenvolvimento Neuropsicomotor" },
    { id: "vaccination", name: "Situação Vacinal" },
    { id: "feeding", name: "Alimentação" },
    { id: "sleep", name: "Sono" },
  ],
  "Ginecologia": [
    { id: "lmp", name: "DUM (Data da Última Menstruação)" },
    { id: "menstrual_cycle", name: "Ciclo Menstrual" },
    { id: "pregnancies", name: "Gestações (G/P/A)" },
    { id: "contraception", name: "Método Contraceptivo" },
    { id: "breast_exam", name: "Exame das Mamas" },
    { id: "speculum_exam", name: "Exame Especular" },
    { id: "bimanual_exam", name: "Toque Bimanual" },
  ],
  "Ortopedia": [
    { id: "gait", name: "Marcha" },
    { id: "posture", name: "Postura" },
    { id: "rom", name: "Amplitude de Movimento (ADM)" },
    { id: "muscle_strength", name: "Força Muscular" },
    { id: "reflexes", name: "Reflexos" },
    { id: "sensitivity", name: "Sensibilidade" },
    { id: "special_tests", name: "Testes Especiais" },
  ],
  "Dermatologia": [
    { id: "lesion_type", name: "Tipo de Lesão" },
    { id: "lesion_location", name: "Localização" },
    { id: "lesion_size", name: "Tamanho" },
    { id: "lesion_color", name: "Coloração" },
    { id: "lesion_borders", name: "Bordas" },
    { id: "lesion_distribution", name: "Distribuição" },
    { id: "dermatoscopy", name: "Dermatoscopia" },
  ],
  "Endocrinologia": [
    { id: "weight", name: "Peso" },
    { id: "height", name: "Altura" },
    { id: "bmi", name: "IMC" },
    { id: "waist", name: "Circunferência Abdominal" },
    { id: "thyroid", name: "Palpação da Tireoide" },
    { id: "skin_signs", name: "Sinais Cutâneos" },
    { id: "acanthosis", name: "Acantose Nigricans" },
  ],
  "Neurologia": [
    { id: "consciousness", name: "Nível de Consciência (Glasgow)" },
    { id: "cranial_nerves", name: "Nervos Cranianos" },
    { id: "motor", name: "Sistema Motor" },
    { id: "sensitivity", name: "Sensibilidade" },
    { id: "reflexes", name: "Reflexos" },
    { id: "coordination", name: "Coordenação" },
    { id: "gait", name: "Marcha" },
    { id: "meningeal_signs", name: "Sinais Meníngeos" },
  ],
  "Clínica Geral": [
    { id: "general_state", name: "Estado Geral" },
    { id: "vital_signs", name: "Sinais Vitais" },
    { id: "head_neck", name: "Cabeça e Pescoço" },
    { id: "respiratory", name: "Aparelho Respiratório" },
    { id: "cardiovascular", name: "Aparelho Cardiovascular" },
    { id: "abdomen", name: "Abdome" },
    { id: "extremities", name: "Extremidades" },
    { id: "skin", name: "Pele" },
  ],
};

export const SPECIALTY_SPECIFIC_QUESTIONS: Record<string, {
  title: string;
  questions: {
    id: string;
    label: string;
    type: "checkbox" | "radio" | "multiselect";
    options?: { value: string; label: string }[];
  }[];
}> = {
  "Psiquiatria": {
    title: "Configurações para Psiquiatria",
    questions: [
      {
        id: "scales", label: "Escalas que você utiliza:", type: "multiselect",
        options: [
          { value: "phq9", label: "PHQ-9 (Depressão)" },
          { value: "gad7", label: "GAD-7 (Ansiedade)" },
          { value: "hamd", label: "HAM-D" },
          { value: "mini", label: "MINI" },
          { value: "bdi", label: "BDI (Beck)" },
          { value: "ymrs", label: "YMRS (Mania)" },
        ],
      },
      {
        id: "noteFormat", label: "Formato das notas:", type: "radio",
        options: [
          { value: "structured", label: "Estruturado (S.O.A.P.)" },
          { value: "narrative", label: "Narrativo livre" },
        ],
      },
    ],
  },
  "Pediatria": {
    title: "Configurações para Pediatria",
    questions: [
      { id: "includeGrowthPercentiles", label: "Incluir percentis de crescimento", type: "checkbox" },
      { id: "includeDevelopmentMilestones", label: "Registrar marcos do desenvolvimento", type: "checkbox" },
      { id: "includeVaccineCalendar", label: "Mostrar calendário vacinal", type: "checkbox" },
      { id: "calculateAgeInMonths", label: "Calcular idade em meses automaticamente", type: "checkbox" },
    ],
  },
  "Cardiologia": {
    title: "Configurações para Cardiologia",
    questions: [
      { id: "calculateCardiovascularRisk", label: "Calcular risco cardiovascular (Framingham)", type: "checkbox" },
      { id: "includeECGTemplate", label: "Incluir template para descrição de ECG", type: "checkbox" },
      { id: "recordLVEF", label: "Registrar FEVE quando disponível", type: "checkbox" },
    ],
  },
  "Ginecologia": {
    title: "Configurações para Ginecologia",
    questions: [
      { id: "includePregnancyTracking", label: "Acompanhamento de gestantes (pré-natal)", type: "checkbox" },
      { id: "recordLMP", label: "Registrar DUM/IG automaticamente", type: "checkbox" },
    ],
  },
  "Dermatologia": {
    title: "Configurações para Dermatologia",
    questions: [
      { id: "useBodyMapping", label: "Usar mapeamento corporal", type: "checkbox" },
      { id: "trackLesionEvolution", label: "Acompanhar evolução de lesões", type: "checkbox" },
    ],
  },
  "Ortopedia": {
    title: "Configurações para Ortopedia",
    questions: [
      { id: "recordROM", label: "Registrar amplitude de movimento (ADM)", type: "checkbox" },
      { id: "useAnatomicDiagrams", label: "Usar diagramas anatômicos", type: "checkbox" },
    ],
  },
};
