import type { DetectedItem } from "@/lib/types";

interface DetectedItemsProps {
  items: DetectedItem[];
}

export function DetectedItems({ items }: DetectedItemsProps) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium text-hiro-text">Itens detectados</p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-hiro-text">
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </section>
  );
}
