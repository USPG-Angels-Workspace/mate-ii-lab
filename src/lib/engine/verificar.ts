import { evaluate, freeVars, parseTex, type MathJson } from "@/lib/math/expr";
import type { ErrorTipico, Paso, PasoEcuaciones, PasoExpr, PasoValor } from "@/domain/types";

export type Resultado =
  | { estado: "correcto"; mensaje: string }
  | { estado: "noEntendi"; mensaje: string }
  | { estado: "sinAvanzar"; mensaje: string }
  | { estado: "errorTipico"; mensaje: string; error: ErrorTipico }
  | { estado: "incorrecto"; mensaje: string };

const TOL = 1e-6;

export function cerca(a: number, b: number, tol = TOL): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Puntos de prueba deterministas dentro del rango, lejos de a y de los ceros a evitar. */
export function puntosPrueba(rango: [number, number] = [-6, 6], evitar: number[] = [], n = 14): number[] {
  const [lo, hi] = rango;
  const pts: number[] = [];
  for (let i = 0; i < n * 3 && pts.length < n; i++) {
    // secuencia de baja discrepancia (razón áurea) para cubrir el intervalo sin aleatoriedad
    const t = (0.137 + i * 0.6180339887) % 1;
    const x = lo + (hi - lo) * t;
    if (evitar.every((e) => Math.abs(x - e) > 0.05)) pts.push(x);
  }
  return pts;
}

/** ¿Son equivalentes como funciones de `v` donde la esperada está definida? */
export function equivalentes(
  a: MathJson,
  b: MathJson,
  v: string,
  rango?: [number, number],
  evitar: number[] = [],
): boolean {
  let comparados = 0;
  for (const x of puntosPrueba(rango, evitar)) {
    const yb = evaluate(b, { [v]: x });
    if (!Number.isFinite(yb)) continue;
    const ya = evaluate(a, { [v]: x });
    if (!cerca(ya, yb)) return false;
    comparados++;
  }
  return comparados >= 4;
}

/** ¿La forma cruda es un producto de factores (al menos uno no trivial)? */
export function estaFactorizado(raw: MathJson): boolean {
  const esFactorNoTrivial = (j: MathJson): boolean =>
    Array.isArray(j) &&
    (j[0] === "Delimiter" || (j[0] === "Power" && Array.isArray(j[1]) && j[1][0] === "Delimiter"));
  const esProducto = (j: MathJson): boolean =>
    Array.isArray(j) &&
    (j[0] === "InvisibleOperator" || j[0] === "Multiply") &&
    j.slice(1).some(esFactorNoTrivial);
  const esPotenciaFactor = (j: MathJson) => esFactorNoTrivial(j);
  if (Array.isArray(raw) && raw[0] === "Divide") {
    return [raw[1], raw[2]].some((t) => esProducto(t) || esPotenciaFactor(t));
  }
  return esProducto(raw) || esPotenciaFactor(raw);
}

const NO_ENTENDI: Resultado = {
  estado: "noEntendi",
  mensaje: "No pude leer la expresión. Revisa paréntesis y fracciones (usa el botón de fracción del teclado).",
};

export function verificarExpr(input: string, paso: PasoExpr): Resultado {
  const p = parseTex(input);
  if (!p) return NO_ENTENDI;
  const extra = [...freeVars(p.json)].filter((s) => s !== paso.variable);
  if (extra.length)
    return {
      estado: "noEntendi",
      mensaje: `Aparece la variable ${extra.join(", ")}; en este ejercicio solo se usa ${paso.variable}.`,
    };
  const esperado = parseTex(paso.esperado);
  if (!esperado) throw new Error(`Paso ${paso.id}: LaTeX esperado inválido: ${paso.esperado}`);
  const evitar = [...(paso.evitar ?? []), ...(paso.a !== undefined ? [paso.a] : [])];
  if (equivalentes(p.json, esperado.json, paso.variable, paso.rango, evitar)) {
    for (const f of paso.forma ?? []) {
      if (f === "producto" && !estaFactorizado(p.raw))
        return {
          estado: "sinAvanzar",
          mensaje: "Es equivalente, pero todavía no está factorizado. Escribe el numerador y/o denominador como producto de factores, por ejemplo $(x-5)(x-1)$.",
        };
      if (f === "sinRaizEnNumerador") {
        const num = Array.isArray(p.raw) && p.raw[0] === "Divide" ? p.raw[1] : p.raw;
        if (JSON.stringify(num).includes('"Sqrt"'))
          return {
            estado: "sinAvanzar",
            mensaje: "Es equivalente, pero el numerador todavía tiene la raíz. Multiplica por el conjugado y desarrolla el numerador con $(a-b)(a+b)=a^2-b^2$.",
          };
      }
      if (f === "finitoEnA" && paso.a !== undefined) {
        const v = evaluate(p.json, { [paso.variable]: paso.a });
        if (!Number.isFinite(v))
          return {
            estado: "sinAvanzar",
            mensaje: `Es equivalente, pero si sustituyes $${paso.variable}=${paso.a}$ el denominador sigue dando 0. Falta cancelar el factor que causa el problema.`,
          };
      }
    }
    return { estado: "correcto", mensaje: "¡Correcto!" };
  }
  for (const e of paso.errores) {
    const c = parseTex(e.candidato);
    if (c && equivalentes(p.json, c.json, paso.variable, paso.rango, evitar))
      return { estado: "errorTipico", mensaje: e.explicacion, error: e };
  }
  return {
    estado: "incorrecto",
    mensaje: "No es equivalente a la expresión anterior. Revisa tu álgebra (prueba sustituyendo un número fácil, como x = 2, en ambas).",
  };
}

export type ValorEspecial = "inf" | "-inf" | "noexiste";

function valorDe(input: string): number | ValorEspecial | null {
  const s = input.trim();
  if (s === "noexiste") return "noexiste";
  if (s === "inf" || /^\+?\\infty$/.test(s)) return "inf";
  if (s === "-inf" || /^-\\infty$/.test(s)) return "-inf";
  const p = parseTex(s);
  if (!p || freeVars(p.json).size) return null;
  const v = evaluate(p.json, {});
  if (v === Infinity) return "inf";
  if (v === -Infinity) return "-inf";
  return Number.isFinite(v) ? v : null;
}

export function mismosValores(a: string, b: string): boolean {
  const va = valorDe(a);
  const vb = valorDe(b);
  if (va === null || vb === null) return false;
  if (typeof va === "number" && typeof vb === "number") return cerca(va, vb);
  return va === vb;
}

export function verificarValor(input: string, paso: PasoValor): Resultado {
  const v = valorDe(input);
  if (v === null)
    return { estado: "noEntendi", mensaje: "Escribe un número (puede ser fracción o raíz), o usa los botones ∞, −∞ o «no existe»." };
  if (mismosValores(input, paso.esperado)) return { estado: "correcto", mensaje: "¡Correcto!" };
  for (const e of paso.errores) if (mismosValores(input, e.candidato)) return { estado: "errorTipico", mensaje: e.explicacion, error: e };
  return { estado: "incorrecto", mensaje: "Ese no es el valor. Revisa el renglón anterior y sustituye con cuidado." };
}

/** Recta: vertical x=c, o y=f(x) (constante u oblicua). */
type Recta = { tipo: "x"; c: number } | { tipo: "y"; f: MathJson };

export function parseRecta(input: string): Recta | null {
  const p = parseTex(input);
  if (!p || !Array.isArray(p.json) || p.json[0] !== "Equal") return null;
  const [, l, r] = p.json;
  const lado = (s: MathJson, otro: MathJson): Recta | null => {
    if (s === "x" && freeVars(otro).size === 0) {
      const c = evaluate(otro, {});
      return Number.isFinite(c) ? { tipo: "x", c } : null;
    }
    if (s === "y" && [...freeVars(otro)].every((v) => v === "x")) return { tipo: "y", f: otro };
    return null;
  };
  return lado(l, r) ?? lado(r, l);
}

function mismaRecta(a: Recta, b: Recta): boolean {
  if (a.tipo === "x" && b.tipo === "x") return cerca(a.c, b.c);
  if (a.tipo === "y" && b.tipo === "y") return equivalentes(a.f, b.f, "x", [-10, 10]);
  return false;
}

export function verificarEcuaciones(inputs: string[], paso: PasoEcuaciones): Resultado {
  const llenos = inputs.filter((s) => s.trim() && s.trim() !== "ninguna");
  const rectas: Recta[] = [];
  for (const s of llenos) {
    const r = parseRecta(s);
    if (!r)
      return {
        estado: "noEntendi",
        mensaje: `No pude leer «${s}». Escribe ecuaciones como $x=3$ (vertical) o $y=2$, $y=x+1$ (horizontal u oblicua).`,
      };
    rectas.push(r);
  }
  const claseOk = rectas.every((r) => (paso.clase === "vertical" ? r.tipo === "x" : r.tipo === "y"));
  if (!claseOk)
    return {
      estado: "incorrecto",
      mensaje:
        paso.clase === "vertical"
          ? "Una asíntota vertical se escribe $x = c$ (una recta de pie)."
          : "Las asíntotas horizontales y oblicuas se escriben $y = \\ldots$",
    };
  const esperadas = paso.esperado.map((e) => parseRecta(e)!);
  // errores típicos: alguna recta del estudiante coincide con un candidato erróneo
  for (const r of rectas)
    if (!esperadas.some((e) => mismaRecta(r, e)))
      for (const err of paso.errores) {
        const c = parseRecta(err.candidato);
        if (c && mismaRecta(r, c)) return { estado: "errorTipico", mensaje: err.explicacion, error: err };
      }
  const faltan = esperadas.filter((e) => !rectas.some((r) => mismaRecta(r, e)));
  const sobran = rectas.filter((r) => !esperadas.some((e) => mismaRecta(r, e)));
  if (!faltan.length && !sobran.length) return { estado: "correcto", mensaje: "¡Correcto!" };
  if (esperadas.length === 0)
    return { estado: "incorrecto", mensaje: "Revisa: en este caso **no hay** asíntota de este tipo." };
  if (sobran.length) return { estado: "incorrecto", mensaje: "Alguna de tus rectas no es asíntota. Revisa cada valor." };
  return { estado: "incorrecto", mensaje: `Te ${faltan.length === 1 ? "falta 1 asíntota" : `faltan ${faltan.length} asíntotas`}.` };
}

export function verificarOpcion(id: string, paso: Extract<Paso, { tipo: "opcion" }>): Resultado {
  if (id === paso.correcta) return { estado: "correcto", mensaje: "¡Correcto!" };
  return { estado: "incorrecto", mensaje: paso.explicaciones[id] ?? "No es la opción correcta." };
}
