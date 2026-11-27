"use client";
import { Check, CircleCheck, CircleDot, CircleHelp, CircleX, Lightbulb, TriangleAlert, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Ejercicio, Paso } from "@/domain/types";
import { verificarEcuaciones, verificarExpr, verificarOpcion, verificarValor, type Resultado } from "@/lib/engine/verificar";
import { useProgreso } from "@/store/progreso";
import { Boton, Etiqueta } from "./ui/basicos";
import { MathInput } from "./ui/MathInput";
import { MathText, Tex } from "./ui/Tex";
import { GraficaRacional } from "./viz/GraficaRacional";

export type Modo = "guiada" | "sinPistas" | "simulacro";

export interface ResultadoEjercicio {
  correcto: boolean;
  pistas: number;
  errores: number;
  /** pasos donde se mostró la solución */
  revelados: number;
}

/** Ejecuta un ejercicio renglón por renglón, verificando cada paso. */
export function StepRunner({ ejercicio, modo, onTerminar }: { ejercicio: Ejercicio; modo: Modo; onTerminar?: (r: ResultadoEjercicio) => void }) {
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [rectas, setRectas] = useState<string[]>([""]);
  const [pista, setPista] = useState(0);
  const [fb, setFb] = useState<Resultado | null>(null);
  const [fallosPaso, setFallosPaso] = useState(0);
  const [noEntendi, setNoEntendi] = useState(0);
  const [hechos, setHechos] = useState<{ paso: Paso; revelado: boolean; respuesta?: string }[]>([]);
  const [tot, setTot] = useState({ pistas: 0, errores: 0, revelados: 0 });
  const registrar = useProgreso((s) => s.registrar);
  const registrarFallo = useProgreso((s) => s.registrarFallo);

  const paso = ejercicio.pasos[i];
  const terminado = i >= ejercicio.pasos.length;
  const conPistas = modo === "guiada";

  function avanzar(revelado: boolean, respuesta?: string) {
    const nuevosHechos = [...hechos, { paso, revelado, respuesta }];
    setHechos(nuevosHechos);
    const nt = { ...tot, revelados: tot.revelados + (revelado ? 1 : 0) };
    setTot(nt);
    setI(i + 1);
    setInput("");
    setRectas([""]);
    setPista(0);
    setFb(null);
    setFallosPaso(0);
    setNoEntendi(0);
    if (i + 1 >= ejercicio.pasos.length) {
      const correcto = nt.revelados === 0 && (modo !== "guiada" || nt.errores <= 2);
      registrar(ejercicio.subtema, { correcto, pistas: nt.pistas, error: nt.errores > 0 });
      onTerminar?.({ correcto, pistas: nt.pistas, errores: nt.errores, revelados: nt.revelados });
    }
  }

  function comprobar(valor?: string) {
    let r: Resultado;
    if (paso.tipo === "expr") r = verificarExpr(input, paso);
    else if (paso.tipo === "valor") r = verificarValor(valor ?? input, paso);
    else if (paso.tipo === "ecuaciones") r = verificarEcuaciones(valor === "ninguna" ? [] : rectas, paso);
    else r = verificarOpcion(valor!, paso);
    setFb(r);
    if (r.estado === "correcto") {
      setTimeout(() => avanzar(false, valor ?? input), paso.tipo === "opcion" ? 900 : 700);
      return;
    }
    if (r.estado === "noEntendi") {
      setNoEntendi((n) => n + 1);
      return;
    }
    if (r.estado === "sinAvanzar") return;
    setFallosPaso((n) => n + 1);
    setTot((t) => ({ ...t, errores: t.errores + 1 }));
    registrarFallo({ subtema: ejercicio.subtema, tex: ejercicio.tex, paso: paso.instruccion, mensaje: r.mensaje });
  }

  function pedirPista() {
    setPista((p) => Math.min(3, p + 1));
    setTot((t) => ({ ...t, pistas: t.pistas + 1 }));
  }

  const puedeRevelar = fallosPaso >= (conPistas ? 3 : 2) || noEntendi >= 2;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <MathText text={ejercicio.enunciado} />
        </p>
        <div className="overflow-x-auto rounded-lg bg-background px-3 py-2 text-lg">
          <Tex display>{ejercicio.tex}</Tex>
        </div>
      </div>

      {/* Renglones ya resueltos, como en el cuaderno */}
      {hechos.length > 0 && (
        <ol className="space-y-2 border-l-2 border-border pl-3">
          {hechos.map((h, k) => (
            <li key={k} className="text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{k + 1}.</span>
                <MathText text={h.paso.instruccion.split(".")[0].replace(/\*\*/g, "")} />
                {h.revelado ? <Etiqueta tono="warn">revelado</Etiqueta> : <Etiqueta tono="ok"><Check className="size-3" /></Etiqueta>}
              </div>
              <div className="overflow-x-auto">
                <Renglon tex={renglon(h.paso, h.respuesta)} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence mode="wait">
        {!terminado ? (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3 rounded-xl border border-primary/40 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Etiqueta tono="accent">
                Paso {i + 1}/{ejercicio.pasos.length}
              </Etiqueta>
              <MathText text={paso.instruccion} className="leading-relaxed" />
            </div>

            <EntradaPaso paso={paso} input={input} setInput={setInput} rectas={rectas} setRectas={setRectas} comprobar={comprobar} />

            {fb && <Feedback r={fb} />}
            {fb?.estado === "correcto" && <MathText text={`**¿Por qué?** ${paso.porQue}`} className="block text-sm text-muted-foreground" />}

            <div className="flex flex-wrap gap-2">
              {paso.tipo !== "opcion" && (
                <Boton onClick={() => comprobar()} disabled={fb?.estado === "correcto"}>
                  Comprobar
                </Boton>
              )}
              {conPistas && pista < 3 && (
                <Boton variante="secundario" onClick={pedirPista}>
                  <Lightbulb /> {["Pista", "Método", "Casi resuelto"][pista]}
                </Boton>
              )}
              {puedeRevelar && (
                <Boton
                  variante="fantasma"
                  onClick={() => {
                    registrarFallo({ subtema: ejercicio.subtema, tex: ejercicio.tex, paso: paso.instruccion, mensaje: "Se reveló la solución del paso." });
                    avanzar(true);
                  }}
                >
                  Ver el paso resuelto
                </Boton>
              )}
            </div>

            {noEntendi >= 2 && paso.tipo !== "opcion" && (
              <div className="rounded-lg border border-warn/50 bg-warn/10 p-3 text-sm">
                <p className="mb-1 font-medium">¿Problemas con el teclado? Autoevalúate:</p>
                <p>Este es el renglón modelo. ¿Lo hiciste igual en tu cuaderno?</p>
                <Renglon tex={renglon(paso)} />
                <div className="mt-2 flex gap-2">
                  <Boton variante="ok" onClick={() => avanzar(false)}>
                    Sí, igual
                  </Boton>
                  <Boton variante="secundario" onClick={() => avanzar(true)}>
                    No
                  </Boton>
                </div>
              </div>
            )}

            {conPistas && pista > 0 && (
              <ul className="space-y-1 text-sm">
                {paso.pistas.slice(0, pista).map((p, k) => (
                  <li key={k} className="rounded-lg bg-warn/10 px-3 py-2">
                    <span className="font-medium">{["Empujón", "Método", "Casi resuelto"][k]}: </span>
                    <MathText text={p} />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : (
          <motion.div key="fin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-xl border border-ok/40 bg-ok/10 p-3">
            <p className="font-semibold">
              Respuesta final: <MathText text={ejercicio.respuesta.includes("$") ? ejercicio.respuesta : `$${ejercicio.respuesta}$`} />
            </p>
            {ejercicio.grafica && <GraficaRacional g={ejercicio.grafica} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Un renglón puede ser LaTeX puro o texto con $LaTeX$ (los pasos de decisión). */
function Renglon({ tex }: { tex: string }) {
  if (tex.includes("$")) return <MathText text={tex} className="block py-1 text-sm" />;
  return <Tex display>{tex}</Tex>;
}

function renglon(p: Paso, respuesta?: string): string {
  if (p.tipo === "expr") return `${p.prefijo ?? ""} ${p.modelo}`;
  if (p.tipo === "valor") return `${p.prefijo ?? ""} \\boxed{${p.esperado === "inf" ? "+\\infty" : p.esperado === "-inf" ? "-\\infty" : p.esperado === "noexiste" ? "\\text{no existe}" : p.esperado}}`;
  if (p.tipo === "ecuaciones") return p.modelo;
  void respuesta;
  return p.modelo;
}

function Feedback({ r }: { r: Resultado }) {
  const estilo = {
    correcto: "border-ok/50 bg-ok/10",
    noEntendi: "border-warn/50 bg-warn/10",
    sinAvanzar: "border-warn/50 bg-warn/10",
    errorTipico: "border-bad/50 bg-bad/10",
    incorrecto: "border-bad/50 bg-bad/10",
  }[r.estado];
  const titulo = { correcto: "", noEntendi: "", sinAvanzar: "Casi: ", errorTipico: "Error típico: ", incorrecto: "" }[r.estado];
  const Icono = { correcto: CircleCheck, noEntendi: CircleHelp, sinAvanzar: CircleDot, errorTipico: TriangleAlert, incorrecto: CircleX }[r.estado];
  return (
    <div role="status" className={`rounded-lg border px-3 py-2 text-sm ${estilo}`}>
      <Icono className="mr-1.5 inline size-4 align-[-3px]" />
      <strong>{titulo}</strong>
      <MathText text={r.mensaje} />
    </div>
  );
}

function EntradaPaso({
  paso,
  input,
  setInput,
  rectas,
  setRectas,
  comprobar,
}: {
  paso: Paso;
  input: string;
  setInput: (s: string) => void;
  rectas: string[];
  setRectas: (r: string[]) => void;
  comprobar: (v?: string) => void;
}) {
  if (paso.tipo === "opcion")
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {paso.opciones.map((o) => (
          <Boton key={o.id} variante="secundario" className="justify-start text-left" onClick={() => comprobar(o.id)}>
            <MathText text={o.texto} />
          </Boton>
        ))}
      </div>
    );
  if (paso.tipo === "ecuaciones")
    return (
      <div className="space-y-2">
        {rectas.map((r, k) => (
          <div key={k} className="flex items-center gap-2">
            <MathInput
              value={r}
              onChange={(v) => setRectas(rectas.map((x, j) => (j === k ? v : x)))}
              onEnter={() => comprobar()}
              placeholder={paso.clase === "vertical" ? "x=" : "y="}
              autoFocus={k === rectas.length - 1}
            />
            {rectas.length > 1 && (
              <Boton variante="fantasma" aria-label="Quitar" onClick={() => setRectas(rectas.filter((_, j) => j !== k))}>
                <X />
              </Boton>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => setRectas([...rectas, ""])}>
            + Otra asíntota
          </Boton>
          <Boton variante="secundario" onClick={() => comprobar("ninguna")}>
            No hay (ninguna)
          </Boton>
        </div>
      </div>
    );
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {paso.prefijo && (
          <span className="shrink-0 text-lg">
            <Tex>{paso.prefijo}</Tex>
          </span>
        )}
        <MathInput value={input} onChange={setInput} onEnter={() => comprobar()} autoFocus />
      </div>
      {paso.tipo === "valor" && (
        <div className="flex flex-wrap gap-2">
          {[
            ["inf", "+∞"],
            ["-inf", "−∞"],
            ["noexiste", "No existe"],
          ].map(([v, t]) => (
            <Boton key={v} variante="secundario" onClick={() => comprobar(v)}>
              {t}
            </Boton>
          ))}
        </div>
      )}
    </div>
  );
}
