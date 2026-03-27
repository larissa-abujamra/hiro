import type { Patient } from "@/lib/types";

export const brunoFerreiraPatient: Patient = {
  id: "patient-bruno-ferreira",
  name: "Bruno Ferreira",
  dateOfBirth: "1968-09-17",
  sex: "M",
  height: 176,
  weight: 92,
  phone: "+55 11 98888-1122",
  conditions: ["Hipertensao arterial sistemica", "Dislipidemia"],
  medications: [
    { name: "Losartana", dose: "50 mg 2x/dia", status: "active" },
    { name: "Anlodipino", dose: "5 mg 1x/dia", status: "active" },
    { name: "Sinvastatina", dose: "20 mg a noite", status: "active" },
  ],
  cids: [
    {
      code: "I10",
      name: "Hipertensao essencial (primaria)",
      firstSeen: "2024-01-09",
      lastSeen: "2026-03-10",
    },
    {
      code: "E78.5",
      name: "Hiperlipidemia nao especificada",
      firstSeen: "2024-01-09",
      lastSeen: "2025-11-15",
    },
  ],
  consultations: [
    {
      id: "cons-2025-10-15",
      patientId: "patient-bruno-ferreira",
      date: "2025-10-15",
      reason: "Reavaliacao de hipertensao e ajuste de rotina",
      duration: 28,
      transcription: [
        {
          speaker: "patient",
          text: "Pressao em casa ainda fica 15 por 9 quando estou estressado.",
          timestamp: 42,
          isFinal: true,
        },
        {
          speaker: "doctor",
          text: "Vamos reforcar controle de sal e manter monitorizacao diaria.",
          timestamp: 84,
          isFinal: true,
        },
      ],
      soap: {
        s: "Paciente refere picos pressoricos no periodo noturno.",
        o: "PA consultorio 156/98 mmHg, FC 82 bpm, peso 92 kg.",
        a: "HAS estagio 2 com controle parcial.",
        p: "Manter losartana e iniciar anlodipino 5 mg; retorno em 8 semanas.",
      },
      confirmedCids: [
        {
          code: "I10",
          name: "Hipertensao essencial (primaria)",
          confidence: 0.95,
          sourceQuote: "Pressao ainda alta em casa.",
          confirmed: true,
        },
      ],
      detectedItems: [
        {
          id: "det-bruno-2025-10-15-1",
          type: "prescription",
          text: "Anlodipino 5 mg 1x/dia",
          sourceQuote: "Vamos adicionar um segundo anti-hipertensivo.",
          details: {},
        },
        {
          id: "det-bruno-2025-10-15-2",
          type: "return",
          text: "Retorno em 8 semanas com diario de PA",
          sourceQuote: "Quero ver seus registros no proximo retorno.",
          details: {},
        },
      ],
      documents: [
        {
          type: "prescription",
          status: "ready",
          content: "Receita: Losartana 50 mg 2x/dia + Anlodipino 5 mg 1x/dia.",
        },
      ],
    },
    {
      id: "cons-2025-11-26",
      patientId: "patient-bruno-ferreira",
      date: "2025-11-26",
      reason: "Seguimento de tratamento anti-hipertensivo",
      duration: 24,
      transcription: [
        {
          speaker: "patient",
          text: "Melhorei alimentacao e caminhada 4 vezes por semana.",
          timestamp: 35,
          isFinal: true,
        },
        {
          speaker: "doctor",
          text: "Otimo, a pressao ja caiu bastante comparada ao ultimo retorno.",
          timestamp: 91,
          isFinal: true,
        },
      ],
      soap: {
        s: "Boa adesao a atividade fisica e dieta hipossodica.",
        o: "PA 149/94 mmHg, peso 90.5 kg, glicemia capilar 122 mg/dL.",
        a: "Melhora inicial de controle pressorico.",
        p: "Manter esquema atual e reforcar perda ponderal gradual.",
      },
      confirmedCids: [
        {
          code: "I10",
          name: "Hipertensao essencial (primaria)",
          confidence: 0.93,
          sourceQuote: "Pressao melhorou, mas ainda acima da meta.",
          confirmed: true,
        },
      ],
      detectedItems: [
        {
          id: "det-bruno-2025-11-26-1",
          type: "return",
          text: "Retorno em 6 semanas",
          sourceQuote: "Vamos reavaliar em janeiro.",
          details: {},
        },
      ],
      documents: [
        {
          type: "tiss",
          status: "pending",
          content: "Guia TISS de acompanhamento clinico em processamento.",
        },
      ],
    },
    {
      id: "cons-2026-01-14",
      patientId: "patient-bruno-ferreira",
      date: "2026-01-14",
      reason: "Monitoramento de risco cardiovascular",
      duration: 31,
      transcription: [
        {
          speaker: "patient",
          text: "Tenho dormido melhor e diminui o consumo de ultraprocessados.",
          timestamp: 27,
          isFinal: true,
        },
        {
          speaker: "doctor",
          text: "Excelente. Vamos solicitar exames de controle metabolico.",
          timestamp: 102,
          isFinal: true,
        },
      ],
      soap: {
        s: "Sem cefaleia, sem dor toracica, boa tolerancia medicamentosa.",
        o: "PA 142/90 mmHg, peso 89.1 kg, glicemia 116 mg/dL.",
        a: "HAS em melhora progressiva; risco cardio-metabolico moderado.",
        p: "Solicitado perfil lipidico, creatinina e microalbuminuria.",
      },
      confirmedCids: [
        {
          code: "I10",
          name: "Hipertensao essencial (primaria)",
          confidence: 0.91,
          sourceQuote: "Controle melhor, ainda fora da meta ideal.",
          confirmed: true,
        },
      ],
      detectedItems: [
        {
          id: "det-bruno-2026-01-14-1",
          type: "exam",
          text: "Perfil lipidico + funcao renal",
          sourceQuote: "Vou pedir exames para o proximo retorno.",
          details: {},
        },
      ],
      documents: [
        {
          type: "exam-request",
          status: "ready",
          content: "Pedido de exames laboratoriais de controle cardiovascular.",
        },
      ],
    },
    {
      id: "cons-2026-02-18",
      patientId: "patient-bruno-ferreira",
      date: "2026-02-18",
      reason: "Revisao de exames e ajuste fino terapêutico",
      duration: 26,
      transcription: [
        {
          speaker: "patient",
          text: "Trouxe os exames e os valores de pressao da semana.",
          timestamp: 31,
          isFinal: true,
        },
        {
          speaker: "doctor",
          text: "Muito bom, o perfil geral mostra tendencia positiva.",
          timestamp: 96,
          isFinal: true,
        },
      ],
      soap: {
        s: "Paciente assintomatico, rotina de exercicios mantida.",
        o: "PA 136/86 mmHg, peso 87.8 kg, glicemia 109 mg/dL.",
        a: "Controle pressorico quase na meta; boa resposta clinica.",
        p: "Manter doses atuais e revisar em 1 mes com nova media domiciliar.",
      },
      confirmedCids: [
        {
          code: "I10",
          name: "Hipertensao essencial (primaria)",
          confidence: 0.89,
          sourceQuote: "PA perto da meta, manter conduta.",
          confirmed: true,
        },
      ],
      detectedItems: [
        {
          id: "det-bruno-2026-02-18-1",
          type: "return",
          text: "Retorno em 4 semanas",
          sourceQuote: "Quero reavaliar em um mes.",
          details: {},
        },
      ],
      documents: [
        {
          type: "certificate",
          status: "ready",
          content: "Atestado de comparecimento emitido para consulta ambulatorial.",
        },
      ],
    },
    {
      id: "cons-2026-03-10",
      patientId: "patient-bruno-ferreira",
      date: "2026-03-10",
      reason: "Acompanhamento final do ciclo de ajuste",
      duration: 22,
      transcription: [
        {
          speaker: "patient",
          text: "Estou mantendo rotina e os ultimos registros ficaram melhores.",
          timestamp: 23,
          isFinal: true,
        },
        {
          speaker: "doctor",
          text: "Excelente evolucao. Vamos manter plano e ampliar intervalo.",
          timestamp: 89,
          isFinal: true,
        },
      ],
      soap: {
        s: "Refere bem-estar, sem eventos adversos das medicações.",
        o: "PA 130/82 mmHg, peso 86.9 kg, glicemia 102 mg/dL.",
        a: "HAS controlada com melhora sustentada de parametros metabolicos.",
        p: "Manter tratamento atual; retorno trimestral.",
      },
      confirmedCids: [
        {
          code: "I10",
          name: "Hipertensao essencial (primaria)",
          confidence: 0.9,
          sourceQuote: "Pressao estabilizada em niveis adequados.",
          confirmed: true,
        },
      ],
      detectedItems: [
        {
          id: "det-bruno-2026-03-10-1",
          type: "return",
          text: "Retorno em 3 meses",
          sourceQuote: "Proximo acompanhamento pode ser trimestral.",
          details: {},
        },
      ],
      documents: [
        {
          type: "referral",
          status: "pending",
          content: "Encaminhamento opcional para nutricao cardiovascular.",
        },
      ],
    },
  ],
  exams: [
    {
      id: "exam-1",
      fileName: "perfil-lipidico-2026-02.pdf",
      date: "2026-02-10",
      type: "lab",
      url: "/mock/exams/bruno/perfil-lipidico-2026-02.pdf",
    },
    {
      id: "exam-2",
      fileName: "funcao-renal-2026-02.pdf",
      date: "2026-02-10",
      type: "lab",
      url: "/mock/exams/bruno/funcao-renal-2026-02.pdf",
    },
  ],
  metrics: [
    { date: "2025-10-15", systolic: 156, diastolic: 98, weight: 92, glucose: 128 },
    {
      date: "2025-11-26",
      systolic: 149,
      diastolic: 94,
      weight: 90.5,
      glucose: 122,
    },
    {
      date: "2026-01-14",
      systolic: 142,
      diastolic: 90,
      weight: 89.1,
      glucose: 116,
    },
    {
      date: "2026-02-18",
      systolic: 136,
      diastolic: 86,
      weight: 87.8,
      glucose: 109,
    },
    { date: "2026-03-10", systolic: 130, diastolic: 82, weight: 86.9, glucose: 102 },
  ],
};

export const mockPatients: Patient[] = [brunoFerreiraPatient];
