import type { TranscriptionLine } from "@/lib/types";

interface TranscriptionPanelProps {
  lines: TranscriptionLine[];
}

export function TranscriptionPanel({ lines }: TranscriptionPanelProps) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium text-hiro-text">Transcricao</p>
      <div className="mt-3 space-y-2">
        {lines.map((line, index) => (
          <p key={`${line.timestamp}-${index}`} className="text-sm text-hiro-text">
            <span className="mr-2 text-xs uppercase text-hiro-muted">
              {line.speaker}
            </span>
            {line.text}
          </p>
        ))}
      </div>
    </section>
  );
}
