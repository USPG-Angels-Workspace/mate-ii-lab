"use client";
import { Coordinates, Line, Mafs, Plot, Point } from "mafs";
import { useState } from "react";
import { MathText, Tex } from "../ui/Tex";

/** f(x)=x³−3x: un punto recorre la curva; se ve el signo de f' (sube/baja) y la tangente. */
export function MaxMinViz() {
  const [x, setX] = useState(-2);
  const f = (t: number) => t ** 3 - 3 * t;
  const d = (t: number) => 3 * t * t - 3;
  const m = d(x);
  const estado = Math.abs(m) < 0.05 ? "plana (f' = 0): ¡punto crítico!" : m > 0 ? "sube (f' > 0)" : "baja (f' < 0)";
  return (
    <div className="space-y-3">
      <Tex display>{"f(x)=x^3-3x,\\qquad f'(x)=3x^2-3"}</Tex>
      <Mafs height={260} viewBox={{ x: [-3, 3], y: [-4, 4] }} preserveAspectRatio={false}>
        <Coordinates.Cartesian subdivisions={false} />
        <Plot.OfX y={f} color="var(--curve)" weight={3} />
        <Line.PointSlope point={[x, f(x)]} slope={m} color={Math.abs(m) < 0.05 ? "#188a4a" : "#d9480f"} style="dashed" />
        <Point x={x} y={f(x)} color="#d9480f" />
        <Point x={-1} y={2} color="#188a4a" opacity={0.5} />
        <Point x={1} y={-2} color="#188a4a" opacity={0.5} />
      </Mafs>
      <label className="block text-sm">
        x = <strong>{x.toFixed(2)}</strong>
        <input type="range" min={-2.2} max={2.2} step={0.05} value={x} onChange={(e) => setX(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
      </label>
      <p className={`rounded-lg px-3 py-2 text-sm ${Math.abs(m) < 0.05 ? "bg-ok/15" : "bg-primary/10"}`}>
        <MathText text={`Pendiente $f'(${x.toFixed(2)}) = ${m.toFixed(2)}$: la curva **${estado}**`} />
      </p>
      <p className="text-xs text-muted-foreground">Lleva el punto a x = −1 (máximo) y a x = 1 (mínimo): la tangente queda horizontal.</p>
    </div>
  );
}

/** Parábola (x−h)² = 4p(y−k) con foco y directriz. */
export function ParabolaViz() {
  const [p, setP] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const f = (x: number) => (x - h) ** 2 / (4 * p) + k;
  return (
    <div className="space-y-3">
      <Tex display>{`${h === 0 ? "x" : `(x${h > 0 ? `-${h}` : `+${-h}`})`}^2 = ${4 * p}${k === 0 ? "y" : `(y${k > 0 ? `-${k}` : `+${-k}`})`}`}</Tex>
      <Mafs height={260} viewBox={{ x: [-6, 6], y: [-6, 6] }} preserveAspectRatio={false}>
        <Coordinates.Cartesian subdivisions={false} />
        <Plot.OfX y={f} color="var(--curve)" weight={3} />
        <Line.ThroughPoints point1={[0, k - p]} point2={[1, k - p]} color="var(--asym)" style="dashed" />
        <Point x={h} y={k} color="var(--curve)" />
        <Point x={h} y={k + p} color="#188a4a" />
        <Line.Segment point1={[h - 2 * Math.abs(p), k + p]} point2={[h + 2 * Math.abs(p), k + p]} color="#188a4a" />
      </Mafs>
      <div className="grid gap-1 text-sm sm:grid-cols-3">
        {(
          [
            ["p", p, setP, -3, 3],
            ["h", h, setH, -3, 3],
            ["k", k, setK, -3, 3],
          ] as const
        ).map(([n, v, set, min, max]) => (
          <label key={n} className="flex items-center gap-2">
            <span className="w-4 font-mono">{n}</span>
            <input type="range" min={min} max={max} step={0.5} value={v} onChange={(e) => set(Number(e.target.value) || (n === "p" ? 0.5 : 0))} className="flex-1 accent-[var(--primary)]" />
            <span className="w-8 text-right font-mono">{v}</span>
          </label>
        ))}
      </div>
      <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm">
        <MathText text={`Vértice $(${h},${k})$ · foco $(${h},${k + p})$ (verde) · directriz $y=${k - p}$ (naranja) · lado recto $${Math.abs(4 * p)}$ (segmento verde). Abre hacia **${p > 0 ? "arriba" : "abajo"}**.`} />
      </p>
    </div>
  );
}
