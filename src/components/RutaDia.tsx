"use client";
import { Coffee, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RUTA, minutosBloque } from "@/data/ruta";
import type { Bloque } from "@/domain/types";
import { useProgreso } from "@/store/progreso";
import { useHidratado } from "./Hidratar";
import { Barra, Boton, Etiqueta, Tarjeta } from "./ui/basicos";

/** Todos los bloques están disponibles. */
const DISPONIBLE = (_b: Bloque) => true;

function fmt(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(Math.abs(s) / 60);
  return `${m}:${String(Math.abs(s) % 60).padStart(2, "0")}`;
}

function useAhora(activo: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!activo) return;
    setT(Date.now());
    const i = setInterval(() => setT(Date.now()), 1000);
    return () => clearInterval(i);
  }, [activo]);
  return t;
}

function enlace(b: Bloque) {
  if (b.modulo && b.tipo === "modulo") return `/modulo/${b.modulo}`;
  if (b.tipo === "simulacro") return "/simulacro";
  if (b.tipo === "cierre") return "/resumen";
  if (b.tipo === "repaso") return "/modulo/repaso";
  return null;
}

export function RutaDia() {
  const hidratado = useHidratado();
  const { bloques, comprimido, setComprimido, iniciarBloque, pausarBloque, completarBloque } = useProgreso();
  const enMarcha = Object.values(bloques).some((b) => b.inicio);
  const ahora = useAhora(enMarcha);
  if (!hidratado) return <p className="text-muted-foreground">Cargando…</p>;

  const total = RUTA.reduce((s, b) => s + minutosBloque(b, comprimido), 0);
  const hechos = RUTA.filter((b) => bloques[b.id]?.completado);
  const minHechos = hechos.reduce((s, b) => s + minutosBloque(b, comprimido), 0);
  const actual = RUTA.find((b) => !bloques[b.id]?.completado);
  const transcurrido = (id: string) => {
    const b = bloques[id];
    if (!b) return 0;
    return b.acumuladoMs + (b.inicio ? ahora - b.inicio : 0);
  };

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Tu ruta de hoy</h1>
        <p className="text-muted-foreground">Examen: sábado 8:00–9:00. Sigue los bloques en orden; la app decide qué estudiar para que no pierdas tiempo.</p>
        <Barra valor={minHechos / total} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {hechos.length}/{RUTA.length} bloques · {Math.round((minHechos / total) * 100)}% del día
          </span>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={comprimido} onChange={(e) => setComprimido(e.target.checked)} className="accent-[var(--primary)]" />
            Modo comprimido (60% del tiempo, total {Math.round(total / 6) / 10} h)
          </label>
        </div>
      </header>

      <ol className="space-y-3">
        {RUTA.map((b, k) => {
          const st = bloques[b.id];
          const min = minutosBloque(b, comprimido);
          const ms = transcurrido(b.id);
          const restante = min * 60000 - ms;
          const esActual = actual?.id === b.id;
          const href = enlace(b);
          const disp = DISPONIBLE(b);
          return (
            <li key={b.id}>
              <Tarjeta className={`${esActual ? "border-primary ring-2 ring-primary/30" : ""} ${st?.completado ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">Bloque {k + 1}</span>
                      <h2 className="font-semibold">{b.titulo}</h2>
                      <Etiqueta>{min} min</Etiqueta>
                      {st?.completado && <Etiqueta tono="ok">hecho</Etiqueta>}
                      {!disp && <Etiqueta tono="warn">próximamente</Etiqueta>}
                    </div>
                    <p className="text-sm text-muted-foreground">{b.subtemas}</p>
                  </div>
                  {(st?.inicio || ms > 0) && !st?.completado && (
                    <span className={`font-mono text-lg tabular-nums ${restante < 0 ? "text-bad" : ""}`}>
                      {restante < 0 ? "+" : ""}
                      {fmt(Math.abs(restante))}
                    </span>
                  )}
                </div>
                {esActual && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {st?.inicio ? (
                      <Boton variante="secundario" onClick={() => pausarBloque(b.id)}>
                        <Pause /> Pausar
                      </Boton>
                    ) : (
                      <Boton variante="secundario" onClick={() => iniciarBloque(b.id)}>
                        <Play /> {ms > 0 ? "Reanudar" : "Iniciar"} temporizador
                      </Boton>
                    )}
                    {b.tipo === "descanso" ? (
                      <Boton variante="ok" onClick={() => completarBloque(b.id)}>
                        <Coffee /> Descanso terminado
                      </Boton>
                    ) : (
                      <Boton variante="fantasma" onClick={() => completarBloque(b.id)}>
                        Marcar como hecho
                      </Boton>
                    )}
                  </div>
                )}
                {restante < 0 && esActual && b.tipo !== "descanso" && (
                  <p className="mt-2 text-sm text-bad">Se acabó el tiempo del bloque. Termina el paso actual y avanza: lo pendiente queda en «repasar antes de dormir».</p>
                )}
                {st?.completado && (
                  <button className="mt-2 text-xs text-muted-foreground underline" onClick={() => completarBloque(b.id, false)}>
                    Desmarcar
                  </button>
                )}
                {href && disp && !esActual && !st?.completado && (
                  <Link href={href} className="mt-2 inline-block text-sm text-primary underline">
                    Abrir
                  </Link>
                )}
              </Tarjeta>
            </li>
          );
        })}
      </ol>

      {/* Siguiente paso, siempre visible */}
      {actual && (
        <div className="no-print sticky bottom-3 z-30 mt-4 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm">
              <div className="text-muted-foreground">Siguiente paso</div>
              <div className="truncate font-semibold">{actual.titulo}</div>
            </div>
            {enlace(actual) && DISPONIBLE(actual) ? (
              <Link
                href={enlace(actual)!}
                onClick={() => iniciarBloque(actual.id)}
                className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                Empezar →
              </Link>
            ) : actual.tipo === "descanso" ? (
              <Boton onClick={() => iniciarBloque(actual.id)}>Iniciar descanso</Boton>
            ) : (
              <span className="text-sm text-muted-foreground">Se está construyendo; mientras, repasa lo pendiente.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
