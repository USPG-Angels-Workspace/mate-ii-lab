"use client";
import { Coordinates, Line, Mafs, Plot, Point } from "mafs";
import { useMemo } from "react";
import type { Grafica } from "@/domain/types";
import { evaluate, parseTex } from "@/lib/math/expr";

/** Tramos del dominio separados por las asíntotas verticales (para no unir ramas). */
export function tramos(verticales: number[], lo = -12, hi = 12, eps = 0.02): [number, number][] {
  const cortes = [...verticales].sort((a, b) => a - b);
  const out: [number, number][] = [];
  let ini = lo;
  for (const v of cortes) {
    out.push([ini, v - eps]);
    ini = v + eps;
  }
  out.push([ini, hi]);
  return out.filter(([a, b]) => b > a);
}

export function GraficaRacional({ g, alto = 320 }: { g: Grafica; alto?: number }) {
  const f = useMemo(() => {
    const p = parseTex(g.f);
    return (x: number) => {
      if (!p) return NaN;
      const y = evaluate(p.json, { x });
      return Math.abs(y) > 60 ? NaN : y;
    };
  }, [g.f]);
  const verticales = g.verticales ?? [];
  const yMax = 10;
  return (
    <figure className="space-y-2">
      <Mafs height={alto} viewBox={{ x: [-10, 10], y: [-yMax, yMax] }} preserveAspectRatio={false} pan zoom>
        <Coordinates.Cartesian subdivisions={false} />
        {verticales.map((v) => (
          <Line.ThroughPoints key={`v${v}`} point1={[v, 0]} point2={[v, 1]} color="var(--asym)" style="dashed" />
        ))}
        {g.horizontal !== null && g.horizontal !== undefined && (
          <Line.ThroughPoints point1={[0, g.horizontal]} point2={[1, g.horizontal]} color="var(--asym)" style="dashed" />
        )}
        {g.oblicua && <Line.ThroughPoints point1={[0, g.oblicua.b]} point2={[1, g.oblicua.m + g.oblicua.b]} color="var(--asym)" style="dashed" />}
        {tramos(verticales).map(([a, b]) => (
          <Plot.OfX key={`t${a}`} y={f} domain={[a, b]} color="var(--curve)" weight={3} />
        ))}
        {(g.huecos ?? []).map((h) => (
          <Point key={`h${h.x}`} x={h.x} y={h.y} color="var(--card)" svgCircleProps={{ stroke: "var(--curve)", strokeWidth: 2, r: 6 }} />
        ))}
      </Mafs>
      <figcaption className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>
          <span className="mr-1 inline-block h-0.5 w-5 align-middle" style={{ background: "var(--curve)" }} />
          función
        </span>
        <span>
          <span className="mr-1 inline-block w-5 border-t-2 border-dashed align-middle" style={{ borderColor: "var(--asym)" }} />
          asíntotas
        </span>
        {(g.huecos ?? []).length > 0 && <span>○ hueco</span>}
        <span>Arrastra o pellizca para mover/acercar.</span>
      </figcaption>
    </figure>
  );
}
