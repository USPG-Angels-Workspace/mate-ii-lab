"use client";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { MODULOS } from "@/content/modulos";
import type { Dificultad, ModuloId, PreguntaConcepto } from "@/domain/types";
import { generadorPorTipo } from "@/generators";
import { crearRng } from "@/generators/rng";
import { RUTA } from "@/data/ruta";
import { ETAPAS, estadoModulo, useProgreso, type Etapa } from "@/store/progreso";
import { StepRunner } from "./StepRunner";
import { Boton, Etiqueta, Tarjeta } from "./ui/basicos";
import { MathText } from "./ui/Tex";
import { AsintotasSliders } from "./viz/AsintotasSliders";
import { LimiteAcercamiento } from "./viz/LimiteAcercamiento";
import { useHidratado } from "./Hidratar";

const NOMBRES: Record<Etapa, string> = {
  explicacion: "Explicación",
  intuicion: "Intuición",
  guiada: "Práctica guiada",
  sinPistas: "Sin pistas",
  check: "Check",
  explicalo: "Explícalo tú",
};

const VIZ: Partial<Record<ModuloId, () => ReactNode>> = {
  limites: () => <LimiteAcercamiento />,
  asintotas: () => <AsintotasSliders />,
};

export function ModuloView({ id, explicacionA, explicacionB }: { id: ModuloId; explicacionA: ReactNode; explicacionB: ReactNode }) {
  const mod = MODULOS[id];
  const hidratado = useHidratado();
  const st = useProgreso((s) => estadoModulo(s, id));
  const irEtapa = useProgreso((s) => s.irEtapa);
  const completarEtapa = useProgreso((s) => s.completarEtapa);
  const etapa = st.etapa;

  if (!hidratado) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{mod.titulo}</h1>
        <p className="text-muted">{mod.resumen}</p>
      </header>

      <nav className="no-print -mx-1 flex gap-1 overflow-x-auto pb-1" aria-label="Etapas del módulo">
        {ETAPAS.map((e, k) => (
          <button
            key={e}
            onClick={() => irEtapa(id, e)}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm ${e === etapa ? "border-accent bg-accent text-white" : st.completadas.includes(e) ? "border-ok/50 bg-ok/10" : "border-line"}`}
          >
            {k + 1}. {NOMBRES[e]} {st.completadas.includes(e) && e !== etapa ? "✓" : ""}
          </button>
        ))}
      </nav>

      {etapa === "explicacion" && (
        <Tarjeta>
          {st.variante === "B" && (
            <p className="mb-3 rounded-lg bg-warn/10 px-3 py-2 text-sm">
              {st.checkFallos > 0 ? "El check mostró dudas, así que aquí va **otra forma** de explicarlo, con otra analogía." : "Explicación alternativa."}
            </p>
          )}
          <article className="max-w-none">{st.variante === "A" ? explicacionA : explicacionB}</article>
          <div className="mt-4 flex flex-wrap gap-2">
            <Boton onClick={() => completarEtapa(id, "explicacion")}>Entendido → Intuición</Boton>
          </div>
        </Tarjeta>
      )}

      {etapa === "intuicion" && (
        <div className="space-y-4">
          <Tarjeta>
            <h2 className="mb-2 text-lg font-semibold">Juega con la idea</h2>
            {VIZ[id]?.()}
          </Tarjeta>
          <Tarjeta>
            <h2 className="mb-2 text-lg font-semibold">Predice antes de ver</h2>
            <div className="space-y-4">
              {mod.predicciones.map((p) => (
                <Pregunta key={p.id} p={p} modo="prediccion" />
              ))}
            </div>
            <Boton className="mt-4" onClick={() => completarEtapa(id, "intuicion")}>
              Continuar → Práctica guiada
            </Boton>
          </Tarjeta>
        </div>
      )}

      {etapa === "guiada" && <Guiada id={id} onListo={() => completarEtapa(id, "guiada")} />}
      {etapa === "sinPistas" && <SinPistas id={id} onListo={() => completarEtapa(id, "sinPistas")} />}
      {etapa === "check" && <Check id={id} />}
      {etapa === "explicalo" && <Explicalo id={id} />}
    </div>
  );
}

function Guiada({ id, onListo }: { id: ModuloId; onListo: () => void }) {
  const mod = MODULOS[id];
  const semillaBase = useProgreso((s) => s.semilla);
  const nuevaSemilla = useProgreso((s) => s.nuevaSemilla);
  const [tipo, setTipo] = useState(mod.generadores[0]);
  const [dif, setDif] = useState<Dificultad>(1);
  const [semilla, setSemilla] = useState(semillaBase);
  const [hechos, setHechos] = useState(0);
  const g = generadorPorTipo(tipo)!;
  const ej = useMemo(() => g.generar(semilla, dif), [g, semilla, dif]);
  return (
    <Tarjeta className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted">Tú escribes cada renglón; la app revisa que sea equivalente y que avances. Usa las pistas sin culpa.</p>
        <div className="flex flex-wrap gap-2">
          {mod.generadores.map((t) => (
            <button key={t} onClick={() => setTipo(t)} className={`rounded-full border px-3 py-1 text-sm ${t === tipo ? "border-accent bg-accent/15" : "border-line"}`}>
              {generadorPorTipo(t)!.nombre}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          Dificultad:
          {([1, 2, 3] as Dificultad[]).map((d) => (
            <button key={d} onClick={() => setDif(d)} className={`h-8 w-8 rounded-full border ${d === dif ? "border-accent bg-accent text-white" : "border-line"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <StepRunner key={ej.id} ejercicio={ej} modo="guiada" onTerminar={() => setHechos((h) => h + 1)} />
      <div className="flex flex-wrap gap-2">
        <Boton variante="secundario" onClick={() => setSemilla(nuevaSemilla())}>
          Otro ejercicio
        </Boton>
        <Boton variante={hechos >= 2 ? "primario" : "secundario"} onClick={onListo}>
          Pasar a «sin pistas» {hechos < 2 && "(recomendado: 2+ ejercicios)"}
        </Boton>
      </div>
    </Tarjeta>
  );
}

function SinPistas({ id, onListo }: { id: ModuloId; onListo: () => void }) {
  const mod = MODULOS[id];
  const semillaBase = useProgreso((s) => s.semilla);
  const ejercicios = useMemo(() => {
    const r = crearRng(semillaBase * 31 + 7);
    return [0, 1, 2].map((k) => generadorPorTipo(mod.generadores[(k + r.int(0, 9)) % mod.generadores.length])!.generar(semillaBase + 1000 + k, 2));
  }, [mod, semillaBase]);
  const [k, setK] = useState(0);
  const [res, setRes] = useState<boolean[]>([]);
  const fin = res.length === 3;
  return (
    <Tarjeta className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">3 ejercicios sin pistas</h2>
        <Etiqueta>{Math.min(k + 1, 3)}/3</Etiqueta>
      </div>
      {!fin ? (
        <>
          <StepRunner key={ejercicios[k].id} ejercicio={ejercicios[k]} modo="sinPistas" onTerminar={(r) => setRes((x) => [...x, r.correcto])} />
          {res.length > k && (
            <Boton onClick={() => setK(k + 1)}>{k < 2 ? "Siguiente ejercicio" : "Ver resultado"}</Boton>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <p>
            Resultado: <strong>{res.filter(Boolean).length}/3</strong> sin ayuda.{" "}
            {res.filter(Boolean).length < 2 ? "Vuelve a la práctica guiada con el tipo que fallaste, o continúa y repásalo antes de dormir." : "¡Bien!"}
          </p>
          <Boton onClick={onListo}>Continuar → Check</Boton>
        </div>
      )}
    </Tarjeta>
  );
}

function Pregunta({ p, modo, onRespuesta }: { p: PreguntaConcepto; modo: "prediccion" | "check"; onRespuesta?: (ok: boolean) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const ok = sel === p.correcta;
  return (
    <div className="space-y-2">
      <MathText text={p.pregunta} className="block font-medium" />
      <div className="grid gap-2 sm:grid-cols-2">
        {p.opciones.map((o, k) => (
          <button
            key={k}
            disabled={sel !== null}
            onClick={() => {
              setSel(k);
              onRespuesta?.(k === p.correcta);
            }}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              sel === null ? "border-line hover:bg-line/40" : k === p.correcta ? "border-ok bg-ok/15" : k === sel ? "border-bad bg-bad/15" : "border-line opacity-60"
            }`}
          >
            <MathText text={o} />
          </button>
        ))}
      </div>
      {sel !== null && (
        <p className={`rounded-lg px-3 py-2 text-sm ${ok ? "bg-ok/10" : "bg-bad/10"}`}>
          <strong>{ok ? "¡Bien! " : modo === "prediccion" ? "Tu intuición falló aquí, y está bien: " : "No. "}</strong>
          <MathText text={p.porQue} />
        </p>
      )}
    </div>
  );
}

function Check({ id }: { id: ModuloId }) {
  const mod = MODULOS[id];
  const st = useProgreso((s) => estadoModulo(s, id));
  const registrarCheck = useProgreso((s) => s.registrarCheck);
  const registrarFallo = useProgreso((s) => s.registrarFallo);
  const preguntas = useMemo(() => {
    const r = crearRng(st.checkFallos * 97 + 3);
    const banco = [...mod.check];
    for (let i = banco.length - 1; i > 0; i--) {
      const j = r.int(0, i);
      [banco[i], banco[j]] = [banco[j], banco[i]];
    }
    return banco.slice(0, 3);
  }, [mod, st.checkFallos]);
  const [resp, setResp] = useState<Record<string, boolean>>({});
  const fallos = Object.values(resp).filter((v) => !v).length;
  const listo = Object.keys(resp).length === 3;
  return (
    <Tarjeta className="space-y-4">
      <h2 className="text-lg font-semibold">Check de comprensión (3 preguntas)</h2>
      {preguntas.map((p) => (
        <Pregunta
          key={`${st.checkFallos}-${p.id}`}
          p={p}
          modo="check"
          onRespuesta={(ok) => {
            setResp((r) => ({ ...r, [p.id]: ok }));
            if (!ok) registrarFallo({ subtema: p.subtema, tex: "", paso: p.pregunta, mensaje: p.porQue });
          }}
        />
      ))}
      {listo && (
        <div className={`rounded-lg p-3 ${fallos >= 2 ? "bg-warn/10" : "bg-ok/10"}`}>
          {fallos >= 2 ? (
            <>
              <p className="mb-2">Fallaste {fallos} de 3. Te regreso a la explicación, pero **con otro enfoque** (otra analogía y otro ejemplo).</p>
              <Boton
                onClick={() => {
                  setResp({});
                  registrarCheck(id, fallos);
                }}
              >
                Ver la otra explicación
              </Boton>
            </>
          ) : (
            <>
              <p className="mb-2">¡Check superado! ({3 - fallos}/3)</p>
              <Boton onClick={() => registrarCheck(id, fallos)}>Continuar → Explícalo tú</Boton>
            </>
          )}
        </div>
      )}
    </Tarjeta>
  );
}

function Explicalo({ id }: { id: ModuloId }) {
  const mod = MODULOS[id];
  const completarEtapa = useProgreso((s) => s.completarEtapa);
  const completarBloque = useProgreso((s) => s.completarBloque);
  const [ver, setVer] = useState<Record<number, boolean>>({});
  const [txt, setTxt] = useState<Record<number, string>>({});
  const bloque = RUTA.find((b) => b.modulo === id);
  return (
    <Tarjeta className="space-y-5">
      <h2 className="text-lg font-semibold">Explícalo tú</h2>
      <p className="text-sm text-muted">Escribir la idea con tus palabras es la mejor prueba de que la entendiste. Luego compara con la respuesta modelo.</p>
      {mod.explicalo.map((q, k) => (
        <div key={k} className="space-y-2">
          <MathText text={q.pregunta} className="block font-medium" />
          <textarea
            value={txt[k] ?? ""}
            onChange={(e) => setTxt({ ...txt, [k]: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-line bg-bg p-2 text-sm"
            placeholder="Escribe tu explicación…"
          />
          {ver[k] ? (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm">
              <strong>Respuesta modelo: </strong>
              <MathText text={q.modelo} />
            </p>
          ) : (
            <Boton variante="secundario" onClick={() => setVer({ ...ver, [k]: true })}>
              Ver respuesta modelo
            </Boton>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          onClick={() => {
            completarEtapa(id, "explicalo");
            if (bloque) completarBloque(bloque.id);
          }}
          className="inline-flex min-h-10 items-center rounded-lg bg-ok px-4 py-2 text-sm font-medium text-white"
        >
          Terminar bloque y volver a la ruta
        </Link>
      </div>
    </Tarjeta>
  );
}
