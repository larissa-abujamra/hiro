"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CalendarAppointment } from "@/types/calendar";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useCalendar() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/appointments");

      if (res.status === 400) {
        // Not connected
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

  const refreshAppointments = useCallback(async () => {
    setIsLoading(true);
    await fetchAppointments();
    setIsLoading(false);
  }, [fetchAppointments]);

  // Initial load
  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  // Auto-refresh when connected
  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(fetchAppointments, REFRESH_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, fetchAppointments]);

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

  return {
    isConnected,
    isLoading,
    appointments,
    error,
    connectCalendar,
    disconnectCalendar,
    refreshAppointments,
  };
}
