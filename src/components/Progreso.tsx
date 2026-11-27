"use client";
import { PartyPopper } from "lucide-react";
import { MODULOS } from "@/content/modulos";
import type { Subtema } from "@/domain/types";
import { puntaje, useProgreso } from "@/store/progreso";
import { useHidratado } from "./Hidratar";
import { Boton, Tarjeta } from "./ui/basicos";
import { MathText, Tex } from "./ui/Tex";

export const NOMBRE_SUBTEMA: Record<Subtema, string> = {
  "lim-directa": "Sustitución directa",
  "lim-factorizar": "Factorizar (0/0)",
  "lim-racionalizar": "Racionalizar",
  "lim-h": "Límites con h",
  "lim-laterales": "k/0 y laterales",
  "lim-infinito": "Al infinito",
  "asi-vertical": "A. vertical / hueco",
  "asi-horizontal": "A. horizontal",
  "asi-oblicua": "A. oblicua",
  "der-definicion": "Definición",
  "der-reglas": "Reglas básicas",
  "der-producto": "Producto",
  "der-cociente": "Cociente",
  "der-cadena": "Cadena",
  "rep-maxmin": "Máx. y mín.",
  "rep-recta": "Recta",
  "rep-parabola": "Parábola",
  "rep-angulos": "Ángulos",
};

function color(p: number | null) {
  if (p === null) return "bg-muted text-muted-foreground";
  if (p >= 0.75) return "bg-ok/25";
  if (p >= 0.4) return "bg-warn/25";
  return "bg-bad/25";
}

export function Progreso() {
  const hidratado = useHidratado();
  const { dominio, fallos, quitarFallo, reiniciar } = useProgreso();
  if (!hidratado) return <p className="text-muted-foreground">Cargando…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Progreso del día</h1>
      <Tarjeta>
        <h2 className="mb-3 text-lg font-semibold">Mapa de dominio</h2>
        {Object.values(MODULOS).map((m) => (
          <div key={m.id} className="mb-3">
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">{m.titulo}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {m.subtemas.map((s) => {
                const d = dominio[s];
                const p = puntaje(d);
                return (
                  <div key={s} className={`rounded-lg px-3 py-2 text-sm ${color(p)}`}>
                    <div className="font-medium">{NOMBRE_SUBTEMA[s]}</div>
                    <div className="text-xs">{p === null ? "sin intentos" : `${Math.round(p * 100)}% · ${d!.aciertos}/${d!.intentos}`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Tarjeta>
      <Tarjeta>
        <h2 className="mb-1 text-lg font-semibold">Repasar antes de dormir</h2>
        <p className="mb-3 text-sm text-muted-foreground">Lo que fallaste hoy. Léelo, entiende el porqué y quítalo de la lista.</p>
        {fallos.length === 0 ? (
          <p className="flex items-center gap-2 text-muted-foreground"><PartyPopper className="size-4" /> Nada pendiente.</p>
        ) : (
          <ul className="space-y-2">
            {fallos
              .map((f, i) => ({ f, i }))
              .reverse()
              .map(({ f, i }) => (
                <li key={f.fecha + "-" + i} className="rounded-lg border border-border p-3 text-sm">
                  <div className="mb-1 text-xs text-muted-foreground">{NOMBRE_SUBTEMA[f.subtema]}</div>
                  {f.tex && (
                    <div className="overflow-x-auto">
                      <Tex>{f.tex}</Tex>
                    </div>
                  )}
                  <MathText text={f.paso} className="block font-medium" />
                  <MathText text={f.mensaje} className="block text-muted-foreground" />
                  <button className="mt-1 text-xs text-primary underline" onClick={() => quitarFallo(i)}>
                    Ya lo entendí
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Tarjeta>
      <Boton
        variante="fantasma"
        className="text-xs"
        onClick={() => {
          if (window.confirm("¿Borrar todo el progreso?")) reiniciar();
        }}
      >
        Reiniciar progreso
      </Boton>
    </div>
  );
}
