interface RecordingZoneProps {
  isRecording: boolean;
}

export function RecordingZone({ isRecording }: RecordingZoneProps) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium text-hiro-text">Gravacao</p>
      <p className="mt-1 text-xs text-hiro-muted">
        {isRecording ? "Capturando audio da consulta..." : "Aguardando inicio."}
      </p>
    </section>
  );
}
