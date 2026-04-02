export interface CalendarAppointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  description?: string;
  location?: string;
}

export interface CalendarConnection {
  provider: "google" | "outlook" | "apple" | null;
  connected: boolean;
  connectedAt: Date | null;
}
