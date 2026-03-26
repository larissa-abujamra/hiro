interface RecordingZoneProps {
  isRecording: boolean;
}

export function RecordingZone({ isRecording }: RecordingZoneProps) {
  return (
    <section className="rounded-2xl bg-hiro-card p-4">
      <p className="text-sm font-medium text-hiro-text">Gravacao</p>
      <p className="mt-1 text-xs text-hiro-muted">
        {isRecording ? "Capturando audio da consulta..." : "Aguardando inicio."}
      </p>
    </section>
  );
}
