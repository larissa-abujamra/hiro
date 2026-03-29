import type { CSSProperties } from "react";

/** Círculo / quadrado de ícone sobre card claro ou areia (documentos, atividade, etc.). */
export const iconCircleGlassOnLightCard: CSSProperties = {
  background: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(24px) saturate(190%)",
  WebkitBackdropFilter: "blur(24px) saturate(190%)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.03)",
};
