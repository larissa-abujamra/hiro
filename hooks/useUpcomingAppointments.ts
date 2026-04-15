"use client";

import { useEffect, useState } from "react";

export interface UpcomingAppointment {
  id: string;
  patient_id?: string | null;
  patient_name: string;
  patient_phone?: string | null;
  datetime: string;
  type: string;
  status: string;
}

interface UseUpcomingAppointmentsResult {
  appointments: UpcomingAppointment[];
  currentAppointment: UpcomingAppointment | null;
  setCurrentAppointment: (appt: UpcomingAppointment) => void;
  isLoading: boolean;
}

/**
 * Fetches the doctor's appointments within ±windowMinutes of now,
 * filtering to `scheduled` / `confirmed`, and picks the one closest
 * to the current time as the "current" suggestion.
 */
export function useUpcomingAppointments(
  windowMinutes: number = 60,
): UseUpcomingAppointmentsResult {
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAppointment, setCurrentAppointment] =
    useState<UpcomingAppointment | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUpcoming() {
      setIsLoading(true);
      try {
        const now = new Date();
        const windowStart = new Date(
          now.getTime() - windowMinutes * 60 * 1000,
        );
        const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

        const res = await fetch(
          `/api/appointments?from=${windowStart.toISOString()}&to=${windowEnd.toISOString()}`,
        );
        if (!res.ok) {
          if (!cancelled) {
            setAppointments([]);
            setCurrentAppointment(null);
          }
          return;
        }

        const data = await res.json();
        const raw: UpcomingAppointment[] = data.appointments ?? [];
        const filtered = raw.filter(
          (a) => a.status === "scheduled" || a.status === "confirmed",
        );

        if (cancelled) return;
        setAppointments(filtered);

        if (filtered.length === 0) {
          setCurrentAppointment(null);
          return;
        }

        const closest = filtered.reduce((prev, curr) => {
          const prevDiff = Math.abs(
            new Date(prev.datetime).getTime() - now.getTime(),
          );
          const currDiff = Math.abs(
            new Date(curr.datetime).getTime() - now.getTime(),
          );
          return currDiff < prevDiff ? curr : prev;
        }, filtered[0]);

        setCurrentAppointment(closest);
      } catch (err) {
        console.error("[useUpcomingAppointments] error:", err);
        if (!cancelled) {
          setAppointments([]);
          setCurrentAppointment(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchUpcoming();
    return () => {
      cancelled = true;
    };
  }, [windowMinutes]);

  return { appointments, currentAppointment, setCurrentAppointment, isLoading };
}
