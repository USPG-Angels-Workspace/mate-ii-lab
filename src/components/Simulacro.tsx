"use client";
import { CircleCheck, CircleX, Play, SkipForward, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RUTA, minutosBloque } from "@/data/ruta";
import { REPASO_RAPIDO } from "@/data/repasoRapido";
import type { Dificultad, Ejercicio } from "@/domain/types";
import { generadorPorTipo } from "@/generators";
import { puntosDebiles } from "@/lib/debiles";
import { useProgreso, type ResultadoSimulacro } from "@/store/progreso";
import { useHidratado } from "./Hidratar";
import { NOMBRE_SUBTEMA } from "./Progreso";
import { StepRunner } from "./StepRunner";
import { Barra, Boton, Etiqueta, Tarjeta } from "./ui/basicos";
import { MathText, Tex } from "./ui/Tex";

/** Composición del simulacro: como el examen real de 1 hora. */
const PLAN: [string, Dificultad][] = [
  ["lim-factorizar", 2],
  ["lim-racionalizar", 2],
  ["asintotas", 2],
  ["der-producto", 2],
  ["der-cociente", 1],
  ["der-cadena", 2],
];

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function Simulacro() {
  const hidratado = useHidratado();
  const { semilla, nuevaSemilla, comprimido, simulacro, setSimulacro, completarBloque, dominio, fallos } = useProgreso();
  const minutos = minutosBloque(RUTA.find((b) => b.tipo === "simulacro")!, comprimido);
  const [fase, setFase] = useState<"inicio" | "curso" | "fin">("inicio");
  const [inicio, setInicio] = useState(0);
  const [ahora, setAhora] = useState(0);
  const [k, setK] = useState(0);
  const [res, setRes] = useState<ResultadoSimulacro["ejercicios"]>([]);
  const [terminadoActual, setTerminadoActual] = useState(false);
  const [sem, setSem] = useState(semilla);

  const ejercicios: Ejercicio[] = useMemo(() => PLAN.map(([t, d], i) => generadorPorTipo(t)!.generar(sem * 13 + i * 101, d)), [sem]);

  const restante = minutos * 60000 - (ahora - inicio);

  useEffect(() => {
    if (fase !== "curso") return;
    const i = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(i);
  }, [fase]);

  function terminar(lista: ResultadoSimulacro["ejercicios"]) {
    // los no intentados cuentan como saltados
    const completa = ejercicios.map(
      (e, i) => lista[i] ?? { tipo: e.tipo, subtema: e.subtema, tex: e.tex, correcto: false, saltado: true },
    );
    const r: ResultadoSimulacro = {
      fecha: Date.now(),
      aciertos: completa.filter((x) => x.correcto).length,
      total: completa.length,
      minutos: Math.round((Date.now() - inicio) / 60000),
      ejercicios: completa,
    };
    setSimulacro(r);
    const bloque = RUTA.find((b) => b.tipo === "simulacro");
    if (bloque) completarBloque(bloque.id);
    setFase("fin");
  }

  useEffect(() => {
    if (fase === "curso" && restante <= 0) terminar(res);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante, fase]);

  if (!hidratado) return <p className="text-muted-foreground">Cargando…</p>;

  if (fase === "inicio")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Simulacro final</h1>
        <Tarjeta className="space-y-3">
          <p>
            <strong>{PLAN.length} ejercicios en {minutos} minutos</strong>, como el examen real: 2 límites, 1 asíntotas con gráfica, 3 derivadas (producto, cociente y cadena).
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Sin pistas. Si fallas 2 veces un paso, puedes ver ese paso resuelto (cuenta como fallo).</li>
            <li>Puedes saltar un ejercicio; al final verás tus 3 puntos débiles con un mini-repaso de cada uno.</li>
            <li>Hazlo también en papel, como en el examen, y usa la app para comprobar renglón por renglón.</li>
          </ul>
          <Boton
            onClick={() => {
              const t = Date.now();
              setInicio(t);
              setAhora(t);
              setK(0);
              setRes([]);
              setTerminadoActual(false);
              setFase("curso");
            }}
          >
            <Play /> Empezar ({minutos} min)
          </Boton>
          {simulacro && (
            <p className="text-sm text-muted-foreground">
              Último intento: {simulacro.aciertos}/{simulacro.total}.{" "}
              <button className="underline" onClick={() => setFase("fin")}>
                Ver reporte
              </button>
            </p>
          )}
        </Tarjeta>
      </div>
    );

  if (fase === "curso") {
    const e = ejercicios[k];
    const registrar = (correcto: boolean, saltado: boolean) => {
      const nueva = [...res];
      nueva[k] = { tipo: e.tipo, subtema: e.subtema, tex: e.tex, correcto, saltado };
      setRes(nueva);
      return nueva;
    };
    const siguiente = (lista: ResultadoSimulacro["ejercicios"]) => {
      setTerminadoActual(false);
      if (k + 1 >= ejercicios.length) terminar(lista);
      else setK(k + 1);
    };
    return (
      <div className="space-y-4">
        <div className="sticky top-12 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Etiqueta tono="accent">
              Ejercicio {k + 1}/{ejercicios.length}
            </Etiqueta>
            <span className={`font-mono text-lg tabular-nums ${restante < 5 * 60000 ? "text-bad" : ""}`}><Timer className="mr-1 inline size-4 align-[-2px]" />{fmt(restante)}</span>
          </div>
          <Barra valor={k / ejercicios.length} className="mt-2" />
        </div>
        <Tarjeta>
          <StepRunner
            key={e.id}
            ejercicio={e}
            modo="simulacro"
            onTerminar={(r) => {
              registrar(r.correcto, false);
              setTerminadoActual(true);
            }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {terminadoActual ? (
              <Boton onClick={() => siguiente(res)}>{k + 1 < ejercicios.length ? "Siguiente ejercicio →" : "Terminar y ver reporte"}</Boton>
            ) : (
              <Boton variante="secundario" onClick={() => siguiente(registrar(false, true))}>
                Saltar ejercicio
              </Boton>
            )}
            <Boton variante="fantasma" onClick={() => terminar(res)}>
              Entregar ya
            </Boton>
          </div>
        </Tarjeta>
      </div>
    );
  }

  // ─── Reporte ───
  const r = simulacro;
  const debiles = puntosDebiles(r, dominio, fallos);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reporte del simulacro</h1>
      {r && (
        <Tarjeta className="space-y-3">
          <p className="text-3xl font-bold">
            {r.aciertos}/{r.total}{" "}
            <span className="text-base font-normal text-muted-foreground">
              ({Math.round((r.aciertos / r.total) * 100)}%) en {r.minutos} min
            </span>
          </p>
          <ul className="space-y-1 text-sm">
            {r.ejercicios.map((x, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                {x.correcto ? <CircleCheck className="size-4 text-ok" /> : x.saltado ? <SkipForward className="size-4 text-muted-foreground" /> : <CircleX className="size-4 text-bad" />}
                <span className="text-muted-foreground">{NOMBRE_SUBTEMA[x.subtema]}</span>
                <Tex>{x.tex}</Tex>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}
      <Tarjeta className="space-y-3">
        <h2 className="text-lg font-semibold">Tus 3 puntos débiles y un mini-repaso</h2>
        {debiles.length === 0 && <p className="text-muted-foreground">¡Sin puntos débiles detectados! Repasa la hoja de fórmulas y descansa.</p>}
        {debiles.map((s) => {
          const rr = REPASO_RAPIDO[s];
          return (
            <div key={s} className="rounded-lg border border-border p-3 text-sm">
              <h3 className="font-semibold">{NOMBRE_SUBTEMA[s]}</h3>
              <p>
                <strong>Regla: </strong>
                <MathText text={rr.regla} />
              </p>
              <p className="text-bad">
                <strong>Cuidado: </strong>
                <MathText text={rr.error} />
              </p>
              <Link href={`/modulo/${rr.modulo}`} className="mt-1 inline-block text-primary underline">
                Practicar este tema →
              </Link>
            </div>
          );
        })}
      </Tarjeta>
      <div className="flex flex-wrap gap-2">
        <Link href="/resumen" className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          Ir a la hoja resumen →
        </Link>
        <Boton
          variante="secundario"
          onClick={() => {
            setSem(nuevaSemilla());
            setFase("inicio");
          }}
        >
          Otro simulacro
        </Boton>
      </div>
    </div>
  );
}
