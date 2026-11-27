"use client";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CadenaViz, SecanteTangente } from "./viz/DerivadasViz";
import { MaxMinViz, ParabolaViz } from "./viz/RepasoViz";
import { useHidratado } from "./Hidratar";

/** Etiquetas cortas para las pestañas (el nombre completo va en el encabezado). */
const CORTO: Record<Etapa, string> = {
  explicacion: "Explicación",
  intuicion: "Intuición",
  guiada: "Guiada",
  sinPistas: "Sin pistas",
  check: "Check",
  explicalo: "Explícalo",
};

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
  derivadas: () => (
    <div className="space-y-6">
      <SecanteTangente />
      <hr className="border-border" />
      <h3 className="font-semibold">Regla de la cadena: engranajes</h3>
      <CadenaViz />
    </div>
  ),
  repaso: () => (
    <div className="space-y-6">
      <MaxMinViz />
      <hr className="border-border" />
      <h3 className="font-semibold">Parábola: vértice, foco y directriz</h3>
      <ParabolaViz />
    </div>
  ),
};

export function ModuloView({ id, explicacionA, explicacionB }: { id: ModuloId; explicacionA: ReactNode; explicacionB: ReactNode }) {
  const mod = MODULOS[id];
  const hidratado = useHidratado();
  const st = useProgreso((s) => estadoModulo(s, id));
  const irEtapa = useProgreso((s) => s.irEtapa);
  const completarEtapa = useProgreso((s) => s.completarEtapa);
  const etapa = st.etapa;

  if (!hidratado) return <p className="text-muted-foreground">Cargando…</p>;

  return (
    <div className="space-y-4">
      <Card className="gap-3 bg-gradient-to-br from-primary/10 via-card to-card py-5">
        <CardHeader>
          <CardTitle className="text-2xl">{mod.titulo}</CardTitle>
          <CardDescription>{mod.resumen}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Etapa {ETAPAS.indexOf(etapa) + 1} de {ETAPAS.length}: <strong className="text-foreground">{NOMBRES[etapa]}</strong>
            </span>
            <span>{st.completadas.length}/{ETAPAS.length} completadas</span>
          </div>
          <Progress value={(st.completadas.length / ETAPAS.length) * 100} />
        </CardContent>
      </Card>

      <Tabs value={etapa} onValueChange={(v) => irEtapa(id, v as Etapa)} className="no-print">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1 sm:grid-cols-6">
          {ETAPAS.map((e, k) => (
            <TabsTrigger
              key={e}
              value={e}
              className="h-9 min-w-0 gap-1.5 px-2 text-xs sm:text-sm data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              {st.completadas.includes(e) ? <CircleCheck className="size-3.5 shrink-0" /> : <span className="shrink-0 text-xs opacity-70">{k + 1}</span>}
              <span className="truncate">{CORTO[e]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {etapa === "explicacion" && (
        <Tarjeta>
          {st.variante === "B" && (
            <p className="mb-3 rounded-lg bg-warn/10 px-3 py-2 text-sm">
              <MathText text={st.checkFallos > 0 ? "El check mostró dudas, así que aquí va **otra forma** de explicarlo, con otra analogía." : "Explicación alternativa."} />
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
        <p className="text-sm text-muted-foreground">Tú escribes cada renglón; la app revisa que sea equivalente y que avances. Usa las pistas sin culpa.</p>
        <div className="flex flex-wrap gap-2">
          {mod.generadores.map((t) => (
            <Button key={t} size="sm" variant={t === tipo ? "default" : "outline"} className="rounded-full" onClick={() => setTipo(t)}>
              {generadorPorTipo(t)!.nombre}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          Dificultad:
          {([1, 2, 3] as Dificultad[]).map((d) => (
            <Button key={d} size="icon-sm" variant={d === dif ? "default" : "outline"} className="rounded-full" onClick={() => setDif(d)}>
              {d}
            </Button>
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
              sel === null ? "border-border hover:bg-muted" : k === p.correcta ? "border-ok bg-ok/15" : k === sel ? "border-bad bg-bad/15" : "border-border opacity-60"
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
      <p className="text-sm text-muted-foreground">Escribir la idea con tus palabras es la mejor prueba de que la entendiste. Luego compara con la respuesta modelo.</p>
      {mod.explicalo.map((q, k) => (
        <div key={k} className="space-y-2">
          <MathText text={q.pregunta} className="block font-medium" />
          <textarea
            value={txt[k] ?? ""}
            onChange={(e) => setTxt({ ...txt, [k]: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-border bg-background p-2 text-sm"
            placeholder="Escribe tu explicación…"
          />
          {ver[k] ? (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm">
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
