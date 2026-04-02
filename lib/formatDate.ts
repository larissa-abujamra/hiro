/**
 * Formats an ISO date string (YYYY-MM-DD) or Date to DD/MM/AAAA (Brazilian format).
 */
export function formatDateBR(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  if (isNaN(d.getTime())) return String(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
