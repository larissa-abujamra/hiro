"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CalendarAppointment } from "@/types/calendar";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useCalendar() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [manualAppointments, setManualAppointments] = useState<CalendarAppointment[]>([]);
  const [hasManual, setHasManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch Google Calendar appointments
  const fetchGoogleAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/appointments");

      if (res.status === 400) {
        setIsConnected(false);
        setAppointments([]);
        return;
      }

      if (res.status === 401) {
        const data = await res.json();
        setIsConnected(false);
        setAppointments([]);
        setError(data.error ?? null);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao buscar compromissos");
        return;
      }

      const data = await res.json();
      setIsConnected(true);
      setAppointments(
        data.appointments.map((a: CalendarAppointment) => ({
          ...a,
          date: new Date(a.date),
        }))
      );
      setError(null);
    } catch {
      setError("Erro de conexão ao buscar compromissos");
    }
  }, []);

  // Fetch manual appointments
  const fetchManualAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data.appointments ?? []).map((a: CalendarAppointment) => ({
        ...a,
        date: new Date(a.date),
      }));
      setManualAppointments(mapped);
      setHasManual(mapped.length > 0);
    } catch {
      // silent — manual appointments are optional
    }
  }, []);

  const refreshAppointments = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchGoogleAppointments(), fetchManualAppointments()]);
    setIsLoading(false);
  }, [fetchGoogleAppointments, fetchManualAppointments]);

  // Initial load
  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  // Auto-refresh when connected
  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(fetchGoogleAppointments, REFRESH_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, fetchGoogleAppointments]);

  function connectCalendar() {
    window.location.href = "/api/calendar/auth/google";
  }

  async function disconnectCalendar() {
    try {
      const res = await fetch("/api/calendar/disconnect", { method: "POST" });
      if (res.ok) {
        setIsConnected(false);
        setAppointments([]);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao desconectar");
      }
    } catch {
      setError("Erro de conexão ao desconectar");
    }
  }

  async function addManualAppointment(patientName: string, scheduledTime: string) {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_name: patientName, scheduled_time: scheduledTime }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Erro ao adicionar consulta");
    }
    await fetchManualAppointments();
  }

  async function removeManualAppointment(id: string) {
    const res = await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Erro ao remover consulta");
    }
    setManualAppointments((prev) => prev.filter((a) => a.id !== id));
    setHasManual(manualAppointments.length > 1);
  }

  return {
    isConnected,
    isLoading,
    appointments,
    manualAppointments,
    hasManual,
    error,
    connectCalendar,
    disconnectCalendar,
    addManualAppointment,
    removeManualAppointment,
    refreshAppointments,
  };
}
