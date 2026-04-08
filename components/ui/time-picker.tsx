"use client";

import { useCallback, useEffect, useState } from "react";

export interface TimePickerProps {
  value?: string; // "HH:MM" in 24h format
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

const selectClass =
  "glass-card-input appearance-none rounded-xl px-3 py-2.5 text-center text-[14px] font-medium tabular-nums text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30 cursor-pointer";

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");

  // Parse incoming value
  useEffect(() => {
    if (!value) return;
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      setHour(match[1].padStart(2, "0"));
      // Snap to nearest 15
      const m = parseInt(match[2], 10);
      const snapped = Math.round(m / 15) * 15;
      setMinute(String(snapped === 60 ? 0 : snapped).padStart(2, "0"));
    }
  }, [value]);

  const handleChange = useCallback(
    (h: string, m: string) => {
      setHour(h);
      setMinute(m);
      onChange?.(`${h}:${m}`);
    },
    [onChange],
  );

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <select
        disabled={disabled}
        value={hour}
        onChange={(e) => handleChange(e.target.value, minute)}
        className={`${selectClass} w-16`}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="text-[16px] font-medium text-hiro-muted">:</span>

      <select
        disabled={disabled}
        value={minute}
        onChange={(e) => handleChange(hour, e.target.value)}
        className={`${selectClass} w-16`}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
