export type ConsultationVisitType = "novo" | "retorno";
export type ConsultationVisitStatus = "confirmado" | "aguardando";

export type TodayConsultation = {
  patientName: string;
  type: ConsultationVisitType;
  status: ConsultationVisitStatus;
  date: Date;
};

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/** Compara apenas dia civil (timezone local). */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type TodayConsultationStats = {
  consultas: {
    total: number;
    confirmadas: number;
    aguardando: number;
  };
  pacientes: {
    total: number;
    novos: number;
    retornos: number;
  };
};

function normalizeStatus(
  raw: unknown,
): ConsultationVisitStatus | null {
  if (raw === "confirmado" || raw === "aguardando") return raw;
  return null;
}

function normalizeType(raw: unknown): ConsultationVisitType | null {
  if (raw === "novo" || raw === "retorno") return raw;
  return null;
}

/**
 * Filtra consultas do dia de referência e agrega contagens.
 * Campos inválidos não quebram o cálculo — são ignorados onde aplicável.
 */
export function getTodayStats(
  consultations: Partial<TodayConsultation>[],
  referenceDate: Date = new Date(),
): TodayConsultationStats {
  const today = consultations.filter((row) => {
    if (!row?.date || !isValidDate(row.date)) return false;
    return isSameCalendarDay(row.date, referenceDate);
  });

  let confirmadas = 0;
  let aguardando = 0;
  let novos = 0;
  let retornos = 0;

  for (const row of today) {
    const st = normalizeStatus(row.status);
    if (st === "confirmado") confirmadas += 1;
    else if (st === "aguardando") aguardando += 1;

    const tp = normalizeType(row.type);
    if (tp === "novo") novos += 1;
    else if (tp === "retorno") retornos += 1;
  }

  const total = today.length;

  return {
    consultas: {
      total,
      confirmadas,
      aguardando,
    },
    pacientes: {
      total,
      novos,
      retornos,
    },
  };
}

/** Horário local no dia de referência (para protótipo: todas as consultas mock são “hoje”). */
function atToday(reference: Date, hours: number, minutes: number): Date {
  const d = new Date(reference);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** Lista mock alinhada ao dia atual do sistema (demonstração em tempo real). */
export function getMockTodayConsultations(referenceDate: Date = new Date()): TodayConsultation[] {
  return [
    {
      patientName: "Ana Clara Ribeiro",
      type: "retorno",
      status: "confirmado",
      date: atToday(referenceDate, 9, 15),
    },
    {
      patientName: "Cíntia Souza",
      type: "retorno",
      status: "aguardando",
      date: atToday(referenceDate, 10, 0),
    },
    {
      patientName: "Bruno Ferreira",
      type: "novo",
      status: "confirmado",
      date: atToday(referenceDate, 11, 30),
    },
    {
      patientName: "Elaine Prado",
      type: "retorno",
      status: "confirmado",
      date: atToday(referenceDate, 14, 0),
    },
    {
      patientName: "Rodrigo Mendes",
      type: "novo",
      status: "aguardando",
      date: atToday(referenceDate, 15, 45),
    },
  ];
}
