"use client";
import { Printer, TriangleAlert } from "lucide-react";
import { REPASO_RAPIDO } from "@/data/repasoRapido";
import type { Subtema } from "@/domain/types";
import { puntosDebiles } from "@/lib/debiles";
import { useProgreso } from "@/store/progreso";
import { useHidratado } from "./Hidratar";
import { NOMBRE_SUBTEMA } from "./Progreso";
import { Boton } from "./ui/basicos";
import { MathText } from "./ui/Tex";

/** Lo mínimo que hay que llevar en la cabeza al examen, siempre en la hoja. */
const ESENCIALES: Subtema[] = ["lim-factorizar", "lim-racionalizar", "asi-vertical", "asi-horizontal", "asi-oblicua", "der-producto", "der-cociente", "der-cadena"];

/** Hoja resumen de una página (imprimible) con lo que más fallaste. */
export function HojaResumen() {
  const hidratado = useHidratado();
  const { simulacro, dominio, fallos, completarBloque } = useProgreso();
  if (!hidratado) return <p className="text-muted-foreground">Cargando…</p>;
  const debiles = puntosDebiles(simulacro, dominio, fallos, 5);
  const resto = ESENCIALES.filter((s) => !debiles.includes(s));
  const ultimos = [...fallos].reverse().slice(0, 6);
  return (
    <div className="space-y-4 print:space-y-2 print:text-[11px]">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Hoja resumen</h1>
        <div className="flex gap-2">
          <Boton onClick={() => window.print()}><Printer /> Imprimir / PDF</Boton>
          <Boton variante="ok" onClick={() => completarBloque("b6")}>
            Cierre hecho
          </Boton>
        </div>
      </div>
      <header className="hidden print:block">
        <h1 className="text-lg font-bold">Hoja resumen · Matemática II (final)</h1>
      </header>
      {simulacro && (
        <p className="text-sm">
          Simulacro: <strong>{simulacro.aciertos}/{simulacro.total}</strong>. Errores del día registrados: {fallos.length}.
        </p>
      )}

      <section className="rounded-xl border border-bad/40 p-3 print:p-2">
        <h2 className="mb-2 flex items-center gap-2 font-semibold"><TriangleAlert className="size-4 text-bad" /> Lo que más fallé (repásalo primero)</h2>
        {debiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay datos: haz la práctica y el simulacro.</p>
        ) : (
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {debiles.map((s) => (
              <li key={s}>
                <strong>{NOMBRE_SUBTEMA[s]}.</strong> <MathText text={REPASO_RAPIDO[s].regla} />
                <br />
                <span className="text-bad">
                  Cuidado: <MathText text={REPASO_RAPIDO[s].error} />
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-xl border border-border p-3 print:p-2">
        <h2 className="mb-2 font-semibold">Reglas esenciales</h2>
        <ul className="grid gap-1 text-sm sm:grid-cols-2 print:grid-cols-2">
          {resto.map((s) => (
            <li key={s}>
              <strong>{NOMBRE_SUBTEMA[s]}:</strong> <MathText text={REPASO_RAPIDO[s].regla} />
            </li>
          ))}
        </ul>
      </section>

      {ultimos.length > 0 && (
        <section className="rounded-xl border border-border p-3 print:p-2">
          <h2 className="mb-2 font-semibold">Mis últimos errores</h2>
          <ul className="space-y-1 text-sm">
            {ultimos.map((f, i) => (
              <li key={i}>
                <span className="text-muted-foreground">{NOMBRE_SUBTEMA[f.subtema]}:</span> <MathText text={f.mensaje} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-ok/40 p-3 text-sm print:p-2">
        <h2 className="mb-1 font-semibold">En el examen</h2>
        <MathText text="1) Sustituye primero. 2) $\frac{0}{0}$ → factoriza/racionaliza, cancela, evalúa. 3) Deja constancia de **cada** renglón y **encierra** la respuesta. 4) En asíntotas: verifica el numerador y grafica con otro color. 5) En derivadas: desarrolla, agrupa y escribe $x\in\mathbb{R}$." />
      </section>
    </div>
  );
}
