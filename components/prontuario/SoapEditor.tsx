import type { Consultation } from "@/lib/types";

interface SoapEditorProps {
  value: Consultation["soap"];
  onChange?: (value: Consultation["soap"]) => void;
}

export function SoapEditor({ value }: SoapEditorProps) {
  return (
    <section className="rounded-2xl bg-white/50 p-4">
      <p className="text-sm font-medium text-hiro-text">SOAP</p>
      <pre className="mt-3 whitespace-pre-wrap text-sm text-hiro-text">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}
