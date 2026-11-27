"use client";
import { useState } from "react";
import { analizar } from "@/generators/asintotas";
import { frac } from "@/generators/rng";
import { factorTex, fromRoots, polyTex, type Poly } from "@/lib/math/poly";
import { MathText, Tex } from "../ui/Tex";
import { GraficaRacional } from "./GraficaRacional";

function Slider({ label, value, set, min = -5, max = 5 }: { label: string; value: number; set: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-6 font-mono">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
      <span className="w-6 text-right font-mono">{value}</span>
    </label>
  );
}

/** Modo 1: f=(x−p)(x−q)/(x−r). Si p=r la asíntota se vuelve hueco. */
function ModoHueco() {
  const [p, setP] = useState(2);
  const [q, setQ] = useState(-1);
  const [r, setR] = useState(3);
  const num = fromRoots([p, q]);
  const den = fromRoots([r]);
  const a = analizar({ num, den, raicesDen: [r] });
  const huecos = a.huecos.map((x) => ({ x, y: x - (x === p ? q : p) }));
  const esHueco = a.huecos.length > 0;
  return (
    <div className="space-y-3">
      <Tex display>{`f(x)=${frac(`${factorTex(p)}${factorTex(q)}`, factorTex(r))}`}</Tex>
      <div className="grid gap-1 sm:grid-cols-3">
        <Slider label="p" value={p} set={setP} />
        <Slider label="q" value={q} set={setQ} />
        <Slider label="r" value={r} set={setR} />
      </div>
      <GraficaRacional
        alto={280}
        g={{ f: frac(polyTex(num), polyTex(den)), verticales: a.verticales, huecos, horizontal: esHueco ? null : a.horizontal, oblicua: esHueco ? null : a.oblicua }}
      />
      <p className={`rounded-lg px-3 py-2 text-sm ${esHueco ? "bg-warn/10" : "bg-accent/10"}`}>
        <MathText
          text={
            esHueco
              ? `En $x=${r}$ el numerador **también** vale 0 ($\\frac{0}{0}$): el factor se cancela y queda la recta $y=${polyTex([-(r === p ? q : p), 1])}$ con un **hueco**. ¡No hay asíntota vertical!`
              : `En $x=${r}$ el numerador vale $${(r - p) * (r - q)} \\neq 0$ ($\\frac{k}{0}$): **asíntota vertical** $x=${r}$. Además, grado 2 sobre grado 1 → oblicua $y=${polyTex([a.oblicua!.b, a.oblicua!.m])}$.`
          }
        />
      </p>
      <p className="text-xs text-muted">Prueba: pon p igual a r y mira cómo desaparece la asíntota.</p>
    </div>
  );
}

/** Modo 2: comparar grados — (c·xⁿ + 1)/(x² − 4). */
function ModoGrados() {
  const [n, setN] = useState(2);
  const [c, setC] = useState(3);
  const num: Poly = Array.from({ length: n + 1 }, (_, i) => (i === n ? c : i === 0 ? 1 : 0));
  if (n === 0) num[0] = c;
  const den: Poly = [-4, 0, 1];
  const a = analizar({ num, den, raicesDen: [2, -2] });
  const caso =
    n < 2
      ? "Grado de arriba **menor**: el denominador crece más rápido → $y=0$."
      : n === 2
        ? `Grados **iguales** → $y = \\frac{${c}}{1} = ${c}$.`
        : n === 3
          ? `Arriba mayor **por uno** → no hay horizontal; hay **oblicua** $y=${polyTex([a.oblicua!.b, a.oblicua!.m])}$ (cociente de la división).`
          : "Arriba mayor por dos o más → ni horizontal ni oblicua.";
  return (
    <div className="space-y-3">
      <Tex display>{`f(x)=${frac(polyTex(num), "x^2-4")}`}</Tex>
      <div className="grid gap-1 sm:grid-cols-2">
        <Slider label="n" value={n} set={setN} min={0} max={4} />
        <Slider label="c" value={c} set={(v) => setC(v === 0 ? 1 : v)} min={-4} max={4} />
      </div>
      <GraficaRacional alto={280} g={{ f: frac(polyTex(num), "x^2-4"), verticales: a.verticales, huecos: [], horizontal: a.horizontal, oblicua: a.oblicua }} />
      <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm">
        <MathText text={`Grado arriba ${n}, abajo 2. ${caso}`} />
      </p>
      <p className="text-xs text-muted">
        <MathText text="Las verticales $x=\pm2$ no cambian: dependen solo del denominador." />
      </p>
    </div>
  );
}

export function AsintotasSliders() {
  const [modo, setModo] = useState<"hueco" | "grados">("hueco");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(
          [
            ["hueco", "Vertical vs. hueco"],
            ["grados", "Horizontal / oblicua (grados)"],
          ] as const
        ).map(([id, t]) => (
          <button key={id} onClick={() => setModo(id)} className={`rounded-full border px-3 py-1 text-sm ${modo === id ? "border-accent bg-accent/15" : "border-line"}`}>
            {t}
          </button>
        ))}
      </div>
      {modo === "hueco" ? <ModoHueco /> : <ModoGrados />}
    </div>
  );
}
