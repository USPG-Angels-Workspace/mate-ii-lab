"use client";
import { Coordinates, Line, Mafs, Plot, Point } from "mafs";
import { useState } from "react";
import { Tex } from "../ui/Tex";
import { tramos } from "./GraficaRacional";

interface Caso {
  id: string;
  nombre: string;
  tex: string;
  a: number;
  f: (x: number) => number;
  verticales: number[];
  hueco?: [number, number];
  conclusion: string;
}

const CASOS: Caso[] = [
  {
    id: "hueco",
    nombre: "Hueco (0/0)",
    tex: "f(x)=\\frac{x^2-1}{x-1}",
    a: 1,
    f: (x) => (x * x - 1) / (x - 1),
    verticales: [],
    hueco: [1, 2],
    conclusion: "Por ambos lados se acerca a 2, aunque f(1) no existe. El límite es 2.",
  },
  {
    id: "laterales",
    nombre: "k/0 (laterales distintos)",
    tex: "f(x)=\\frac{1}{x-2}",
    a: 2,
    f: (x) => 1 / (x - 2),
    verticales: [2],
    conclusion: "Por la izquierda baja a −∞, por la derecha sube a +∞. El límite no existe (hay asíntota vertical).",
  },
  {
    id: "raiz",
    nombre: "Raíz (racionalizar)",
    tex: "f(x)=\\frac{\\sqrt{x+1}-2}{x-3}",
    a: 3,
    f: (x) => (Math.sqrt(x + 1) - 2) / (x - 3),
    verticales: [],
    hueco: [3, 0.25],
    conclusion: "Se acerca a 0.25 = 1/4 por ambos lados. Racionalizando se obtiene exactamente 1/4.",
  },
];

const fmt = (v: number) => (Number.isFinite(v) ? (Math.abs(v) > 1e5 ? (v > 0 ? "muy grande +" : "muy grande −") : v.toFixed(4)) : "—");

/** Un punto que se acerca a x→a por ambos lados, con tabla de valores en vivo. */
export function LimiteAcercamiento() {
  const [caso, setCaso] = useState(CASOS[0]);
  const [exp, setExp] = useState(0); // d = 10^(-exp)
  const d = Math.pow(10, -exp);
  const xi = caso.a - d;
  const xd = caso.a + d;
  const clip = (y: number) => (Math.abs(y) > 50 ? NaN : y);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CASOS.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCaso(c);
              setExp(0);
            }}
            className={`rounded-full border px-3 py-1 text-sm ${c.id === caso.id ? "border-accent bg-accent/15" : "border-line"}`}
          >
            {c.nombre}
          </button>
        ))}
      </div>
      <Tex display>{`${caso.tex},\\quad x\\to ${caso.a}`}</Tex>
      <Mafs height={260} viewBox={{ x: [caso.a - 4, caso.a + 4], y: [-6, 6] }} preserveAspectRatio={false}>
        <Coordinates.Cartesian subdivisions={false} />
        {caso.verticales.map((v) => (
          <Line.ThroughPoints key={v} point1={[v, 0]} point2={[v, 1]} color="var(--asym)" style="dashed" />
        ))}
        {tramos(caso.verticales, caso.a - 6, caso.a + 6).map(([a, b]) => (
          <Plot.OfX key={a} y={(x) => clip(caso.f(x))} domain={[Math.max(a, caso.id === "raiz" ? -0.999 : a), b]} color="var(--curve)" weight={3} />
        ))}
        {caso.hueco && <Point x={caso.hueco[0]} y={caso.hueco[1]} color="var(--card)" svgCircleProps={{ stroke: "var(--curve)", strokeWidth: 2, r: 6 }} />}
        {Number.isFinite(clip(caso.f(xi))) && <Point x={xi} y={caso.f(xi)} color="#d9480f" />}
        {Number.isFinite(clip(caso.f(xd))) && <Point x={xd} y={caso.f(xd)} color="#188a4a" />}
      </Mafs>
      <label className="block text-sm">
        Distancia a {caso.a}: <strong>{d}</strong> — arrastra hacia la derecha para acercarte
        <input type="range" min={0} max={4} step={1} value={exp} onChange={(e) => setExp(Number(e.target.value))} className="mt-1 w-full accent-[var(--accent)]" />
      </label>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-muted">
              <th className="px-2 py-1 text-left" style={{ color: "#d9480f" }}>
                x (izquierda)
              </th>
              <th className="px-2 py-1 text-left">f(x)</th>
              <th className="px-2 py-1 text-left" style={{ color: "#188a4a" }}>
                x (derecha)
              </th>
              <th className="px-2 py-1 text-left">f(x)</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((k) => {
              const dd = Math.pow(10, -k);
              return (
                <tr key={k} className={k === exp ? "bg-accent/10 font-semibold" : ""}>
                  <td className="px-2 py-1">{(caso.a - dd).toFixed(4)}</td>
                  <td className="px-2 py-1">{fmt(caso.f(caso.a - dd))}</td>
                  <td className="px-2 py-1">{(caso.a + dd).toFixed(4)}</td>
                  <td className="px-2 py-1">{fmt(caso.f(caso.a + dd))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {exp >= 3 && <p className="rounded-lg bg-ok/10 px-3 py-2 text-sm">{caso.conclusion}</p>}
    </div>
  );
}
