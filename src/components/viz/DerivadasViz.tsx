"use client";
import { Cog } from "lucide-react";
import { Coordinates, Line, Plot, Point } from "mafs";
import { Lienzo } from "./Lienzo";
import { useState } from "react";
import { MathText, Tex } from "../ui/Tex";

const FUNCS = [
  { id: "x2", tex: "f(x)=x^2", f: (x: number) => x * x, d: (x: number) => 2 * x, dTex: "2x" },
  { id: "x3", tex: "f(x)=x^3-3x", f: (x: number) => x ** 3 - 3 * x, d: (x: number) => 3 * x * x - 3, dTex: "3x^2-3" },
];

/** Recta secante que se convierte en tangente al hacer h → 0. */
export function SecanteTangente() {
  const [fn, setFn] = useState(FUNCS[0]);
  const [a, setA] = useState(1);
  const [h, setH] = useState(2);
  const m = (fn.f(a + h) - fn.f(a)) / h;
  const mt = fn.d(a);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FUNCS.map((f) => (
          <button key={f.id} onClick={() => setFn(f)} className={`rounded-full border px-3 py-1 text-sm ${f.id === fn.id ? "border-primary bg-primary/15" : "border-border"}`}>
            <Tex>{f.tex}</Tex>
          </button>
        ))}
      </div>
      <Lienzo alto={280} x={[-4, 4]} y={[-4, 8]}>
        <Coordinates.Cartesian subdivisions={false} />
        <Plot.OfX y={fn.f} color="var(--curve)" weight={3} />
        <Line.ThroughPoints point1={[a, fn.f(a)]} point2={[a + h, fn.f(a + h)]} color="#d9480f" />
        {h < 0.05 && <Line.PointSlope point={[a, fn.f(a)]} slope={mt} color="#188a4a" style="dashed" />}
        <Point x={a} y={fn.f(a)} color="#188a4a" />
        <Point x={a + h} y={fn.f(a + h)} color="#d9480f" />
      </Lienzo>
      <label className="block text-sm">
        Punto a: <strong>{a}</strong>
        <input type="range" min={-2} max={2} step={0.5} value={a} onChange={(e) => setA(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
      </label>
      <label className="block text-sm">
        Distancia <strong>h = {h.toFixed(3)}</strong> — arrastra hacia la izquierda para acercar el segundo punto
        <input type="range" min={0.001} max={2} step={0.001} value={h} onChange={(e) => setH(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
      </label>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <p className="rounded-lg bg-bad/10 px-3 py-2">
          <MathText text={`Pendiente de la **secante**: $\\frac{f(a+h)-f(a)}{h} = ${m.toFixed(4)}$`} />
        </p>
        <p className="rounded-lg bg-ok/10 px-3 py-2">
          <MathText text={`Pendiente de la **tangente**: $f'(a) = ${fn.dTex.replace(/x/g, `(${a})`)} = ${mt.toFixed(4)}$`} />
        </p>
      </div>
      {h < 0.05 && <p className="text-sm">¡Mira! Con h casi 0, la secante (naranja) y la tangente (verde punteada) casi coinciden: eso es la derivada.</p>}
    </div>
  );
}

/** Regla de la cadena como engranajes: las razones de cambio se multiplican. */
export function CadenaViz() {
  const [x, setX] = useState(1);
  const u = x * x + 1;
  const du = 2 * x;
  const dfu = 3 * u * u;
  return (
    <div className="space-y-3">
      <Tex display>{"f(x)=(x^2+1)^3 \\quad\\Rightarrow\\quad \\text{adentro } u=x^2+1,\\ \\text{afuera } u^3"}</Tex>
      <label className="block text-sm">
        x = <strong>{x}</strong>
        <input type="range" min={-2} max={2} step={0.5} value={x} onChange={(e) => setX(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
      </label>
      <div className="grid gap-2 text-center text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <Cog className="mx-auto mb-1 size-5 text-primary" />
          adentro
          <MathText className="block" text={`$u' = 2x = ${du}$`} />
          <span className="text-xs text-muted-foreground">u cambia {du} veces lo que cambia x</span>
        </div>
        <div className="rounded-lg border border-border p-3">
          <Cog className="mx-auto mb-1 size-5 text-primary" />
          afuera
          <MathText className="block" text={`$3u^2 = 3(${u})^2 = ${dfu}$`} />
          <span className="text-xs text-muted-foreground">f cambia {dfu} veces lo que cambia u</span>
        </div>
        <div className="rounded-lg border border-primary bg-primary/10 p-3">
          <Cog className="mx-auto mb-1 size-5 text-primary" />
          total
          <MathText className="block" text={`$f'(x) = ${dfu}\\cdot${du} = ${dfu * du}$`} />
          <span className="text-xs text-muted-foreground">se multiplican, como engranajes</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        <MathText text="Si olvidas multiplicar por $u'$, solo mides el engranaje de afuera. Comprueba: con $x=0$, $u'=0$ y la derivada total es 0 (la curva está plana ahí)." />
      </p>
    </div>
  );
}
