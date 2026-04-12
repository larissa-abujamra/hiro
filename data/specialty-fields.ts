export interface SpecialtyField {
  id: string;
  label: string;
  description?: string;
  type: "text" | "number" | "select" | "multiselect" | "boolean";
  options?: string[];
  unit?: string;
  section: "subjetivo" | "objetivo" | "avaliacao" | "plano";
}

export interface SpecialtyConfig {
  name: string;
  fields: SpecialtyField[];
}

export const specialtyConfigs: Record<string, SpecialtyConfig> = {
  "Clínica Geral": {
    name: "Clínica Geral",
    fields: [
      { id: "pa", label: "Pressão arterial", type: "text", unit: "mmHg", section: "objetivo" },
      { id: "fc", label: "Frequência cardíaca", type: "number", unit: "bpm", section: "objetivo" },
      { id: "temperatura", label: "Temperatura", type: "number", unit: "°C", section: "objetivo" },
      { id: "peso", label: "Peso", type: "number", unit: "kg", section: "objetivo" },
      { id: "altura", label: "Altura", type: "number", unit: "cm", section: "objetivo" },
      { id: "alergias", label: "Alergias conhecidas", type: "text", section: "subjetivo" },
      { id: "medicacoes_uso", label: "Medicações em uso", type: "text", section: "subjetivo" },
      { id: "comorbidades", label: "Comorbidades", type: "text", section: "subjetivo" },
    ],
  },
  Cardiologia: {
    name: "Cardiologia",
    fields: [
      { id: "fatores_risco", label: "Fatores de risco cardiovascular", type: "multiselect", options: ["HAS", "DM", "Dislipidemia", "Tabagismo", "Obesidade", "Sedentarismo", "Histórico familiar"], section: "subjetivo" },
      { id: "pa", label: "Pressão arterial", type: "text", unit: "mmHg", section: "objetivo" },
      { id: "fc", label: "Frequência cardíaca", type: "number", unit: "bpm", section: "objetivo" },
      { id: "ultimo_ecg", label: "Último ECG", type: "text", section: "objetivo" },
      { id: "ultimo_eco", label: "Último ecocardiograma", type: "text", section: "objetivo" },
      { id: "classe_funcional", label: "Classe funcional (NYHA)", type: "select", options: ["I", "II", "III", "IV"], section: "avaliacao" },
    ],
  },
  Dermatologia: {
    name: "Dermatologia",
    fields: [
      { id: "tipo_pele", label: "Fototipo de pele", type: "select", options: ["I", "II", "III", "IV", "V", "VI"], section: "objetivo" },
      { id: "lesoes_ativas", label: "Lesões ativas", type: "text", section: "objetivo" },
      { id: "localizacao", label: "Localização das lesões", type: "text", section: "objetivo" },
      { id: "tempo_evolucao", label: "Tempo de evolução", type: "text", section: "subjetivo" },
      { id: "tratamentos_previos", label: "Tratamentos anteriores", type: "text", section: "subjetivo" },
      { id: "alergias_cosmeticos", label: "Alergias a cosméticos", type: "text", section: "subjetivo" },
    ],
  },
  Pediatria: {
    name: "Pediatria",
    fields: [
      { id: "idade_gestacional", label: "Idade gestacional ao nascer", type: "text", section: "subjetivo" },
      { id: "peso_nascer", label: "Peso ao nascer", type: "number", unit: "g", section: "subjetivo" },
      { id: "peso_atual", label: "Peso atual", type: "number", unit: "kg", section: "objetivo" },
      { id: "altura_atual", label: "Altura atual", type: "number", unit: "cm", section: "objetivo" },
      { id: "perimetro_cefalico", label: "Perímetro cefálico", type: "number", unit: "cm", section: "objetivo" },
      { id: "vacinas_dia", label: "Vacinas em dia", type: "boolean", section: "objetivo" },
      { id: "marcos_desenvolvimento", label: "Marcos do desenvolvimento", type: "text", section: "objetivo" },
      { id: "alimentacao", label: "Alimentação", type: "select", options: ["Aleitamento materno exclusivo", "Aleitamento misto", "Fórmula", "Alimentação complementar"], section: "subjetivo" },
    ],
  },
  Ortopedia: {
    name: "Ortopedia",
    fields: [
      { id: "local_dor", label: "Local da dor", type: "text", section: "subjetivo" },
      { id: "intensidade_dor", label: "Intensidade da dor (0-10)", type: "number", section: "subjetivo" },
      { id: "mecanismo_lesao", label: "Mecanismo de lesão", type: "text", section: "subjetivo" },
      { id: "tempo_sintomas", label: "Tempo de sintomas", type: "text", section: "subjetivo" },
      { id: "limitacao_funcional", label: "Limitação funcional", type: "text", section: "subjetivo" },
      { id: "exame_fisico_local", label: "Exame físico local", type: "text", section: "objetivo" },
      { id: "amplitude_movimento", label: "Amplitude de movimento", type: "text", section: "objetivo" },
      { id: "exames_imagem", label: "Exames de imagem", type: "text", section: "objetivo" },
    ],
  },
  Ginecologia: {
    name: "Ginecologia",
    fields: [
      { id: "dum", label: "DUM", type: "text", section: "subjetivo" },
      { id: "ciclo_menstrual", label: "Ciclo menstrual", type: "text", section: "subjetivo" },
      { id: "gesta_para", label: "Gesta/Para", type: "text", section: "subjetivo" },
      { id: "metodo_contraceptivo", label: "Método contraceptivo", type: "text", section: "subjetivo" },
      { id: "ultimo_preventivo", label: "Último preventivo", type: "text", section: "subjetivo" },
      { id: "ultima_mamografia", label: "Última mamografia", type: "text", section: "subjetivo" },
    ],
  },
  Psiquiatria: {
    name: "Psiquiatria",
    fields: [
      { id: "queixa_principal", label: "Queixa principal", type: "text", section: "subjetivo" },
      { id: "humor", label: "Humor", type: "select", options: ["Eutímico", "Deprimido", "Elevado", "Irritável", "Ansioso", "Lábil"], section: "objetivo" },
      { id: "afeto", label: "Afeto", type: "select", options: ["Congruente", "Incongruente", "Embotado", "Restrito"], section: "objetivo" },
      { id: "sono", label: "Padrão de sono", type: "text", section: "subjetivo" },
      { id: "apetite", label: "Apetite", type: "select", options: ["Normal", "Aumentado", "Diminuído"], section: "subjetivo" },
      { id: "ideacao_suicida", label: "Ideação suicida", type: "boolean", section: "objetivo" },
      { id: "insight", label: "Insight", type: "select", options: ["Presente", "Parcial", "Ausente"], section: "objetivo" },
      { id: "medicacoes_psiq", label: "Medicações psiquiátricas em uso", type: "text", section: "subjetivo" },
    ],
  },
  Endocrinologia: {
    name: "Endocrinologia",
    fields: [
      { id: "peso", label: "Peso", type: "number", unit: "kg", section: "objetivo" },
      { id: "altura", label: "Altura", type: "number", unit: "cm", section: "objetivo" },
      { id: "imc", label: "IMC", type: "number", unit: "kg/m²", section: "objetivo" },
      { id: "circunf_abdominal", label: "Circunferência abdominal", type: "number", unit: "cm", section: "objetivo" },
      { id: "glicemia_jejum", label: "Última glicemia de jejum", type: "number", unit: "mg/dL", section: "objetivo" },
      { id: "hba1c", label: "Última HbA1c", type: "number", unit: "%", section: "objetivo" },
      { id: "tsh", label: "Último TSH", type: "number", unit: "mUI/L", section: "objetivo" },
      { id: "t4_livre", label: "Último T4 livre", type: "number", unit: "ng/dL", section: "objetivo" },
    ],
  },
  Neurologia: {
    name: "Neurologia",
    fields: [
      { id: "queixa_neuro", label: "Queixa neurológica", type: "text", section: "subjetivo" },
      { id: "nivel_consciencia", label: "Nível de consciência", type: "select", options: ["Alerta", "Sonolento", "Torporoso", "Comatoso"], section: "objetivo" },
      { id: "orientacao", label: "Orientação", type: "multiselect", options: ["Tempo", "Espaço", "Pessoa"], section: "objetivo" },
      { id: "forca_muscular", label: "Força muscular", type: "text", section: "objetivo" },
      { id: "sensibilidade", label: "Sensibilidade", type: "text", section: "objetivo" },
      { id: "reflexos", label: "Reflexos", type: "text", section: "objetivo" },
      { id: "coordenacao", label: "Coordenação", type: "text", section: "objetivo" },
      { id: "marcha", label: "Marcha", type: "text", section: "objetivo" },
    ],
  },
};

/** All specialties available in the dropdown — those with custom fields first, then extras */
export const specialtyOptions = [
  ...Object.keys(specialtyConfigs),
  "Gastroenterologia",
  "Geriatria",
  "Oftalmologia",
  "Otorrinolaringologia",
  "Pneumologia",
  "Reumatologia",
  "Urologia",
  "Outra",
].filter((v, i, a) => a.indexOf(v) === i); // dedupe

export const specialties = specialtyOptions;
