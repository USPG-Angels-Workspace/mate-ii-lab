import type { Subtema } from "@/domain/types";
import { puntaje, type Dominio, type Fallo, type ResultadoSimulacro } from "@/store/progreso";

/**
 * Los subtemas más débiles: fallos del simulacro (peso 3), fallos registrados en el día (peso 1)
 * y bajo puntaje de dominio (peso 2). Solo cuentan subtemas con alguna evidencia.
 */
export function puntosDebiles(
  simulacro: ResultadoSimulacro | null,
  dominio: Partial<Record<Subtema, Dominio>>,
  fallos: Fallo[],
  n = 3,
): Subtema[] {
  const score = new Map<Subtema, number>();
  const sumar = (s: Subtema, v: number) => score.set(s, (score.get(s) ?? 0) + v);
  for (const e of simulacro?.ejercicios ?? []) if (!e.correcto) sumar(e.subtema, 3);
  for (const f of fallos) sumar(f.subtema, 1);
  for (const [s, d] of Object.entries(dominio) as [Subtema, Dominio][]) {
    const p = puntaje(d);
    if (p !== null && p < 0.75) sumar(s, 2 * (1 - p));
  }
  return [...score.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([s]) => s);
}
