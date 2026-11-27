import { ComputeEngine } from "@cortex-js/compute-engine";

/**
 * Capa delgada sobre compute-engine: solo se usa para PARSEAR LaTeX a MathJSON.
 * La evaluación numérica la hace `evaluate` (propia), para no depender de la API
 * de compilación de compute-engine, que cambia entre versiones.
 */
export type MathJson = number | string | { num: string } | MathJson[];

let ce: ComputeEngine | null = null;
const engine = () => (ce ??= new ComputeEngine());

export interface Parsed {
  /** Forma canónica (para evaluar). */
  json: MathJson;
  /** Forma cruda (para revisar la "forma": ¿está factorizado?). */
  raw: MathJson;
}

export function parseTex(latex: string): Parsed | null {
  const clean = normalizeTex(latex);
  if (!clean.trim()) return null;
  try {
    const c = engine().parse(clean);
    const json = c.json as MathJson;
    if (!c.isValid || containsError(json)) return null;
    const raw = engine().parse(clean, { form: "raw" }).json as MathJson;
    return { json, raw };
  } catch {
    return null;
  }
}

/** Limpia detalles que MathLive agrega y que no cambian el significado. */
export function normalizeTex(latex: string): string {
  return latex
    .replace(/\\placeholder\{[^}]*\}/g, "")
    .replace(/\\mathrm\{([a-zA-Z])\}/g, "$1")
    .replace(/\\operatorname\{(sen)\}/g, "\\sin")
    .replace(/\\sen/g, "\\sin")
    .replace(/\\,|\\;|\\!|\\ /g, " ")
    .trim();
}

function containsError(j: MathJson): boolean {
  if (Array.isArray(j)) return j[0] === "Error" || j.some((x) => containsError(x));
  return false;
}

export type Vars = Record<string, number>;

const CONSTS: Record<string, number> = {
  Pi: Math.PI,
  ExponentialE: Math.E,
  e: Math.E,
  Half: 0.5,
  PositiveInfinity: Infinity,
  NegativeInfinity: -Infinity,
};

/** Evalúa MathJSON con números reales. Devuelve NaN si algo no está definido. */
export function evaluate(j: MathJson, vars: Vars): number {
  if (typeof j === "number") return j;
  if (typeof j === "string") {
    if (j in vars) return vars[j];
    if (j in CONSTS) return CONSTS[j];
    return NaN;
  }
  if (!Array.isArray(j)) return Number(j.num);
  const [head, ...args] = j;
  const ev = (k: number) => evaluate(args[k], vars);
  const all = () => args.map((a) => evaluate(a, vars));
  switch (head) {
    case "Add":
      return all().reduce((s, v) => s + v, 0);
    case "Subtract":
      return args.length === 1 ? -ev(0) : ev(0) - ev(1);
    case "Negate":
      return -ev(0);
    case "Multiply":
    case "InvisibleOperator":
      return all().reduce((s, v) => s * v, 1);
    case "Divide":
    case "Rational":
      return ev(0) / ev(1);
    case "Power": {
      const b = ev(0);
      const e = ev(1);
      // raíces impares de negativos: (-8)^(1/3) = -2
      if (b < 0 && !Number.isInteger(e)) {
        const inv = 1 / e;
        if (Number.isInteger(Math.round(inv)) && Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0)
          return -Math.pow(-b, e);
      }
      return Math.pow(b, e);
    }
    case "Square":
      return ev(0) ** 2;
    case "Sqrt":
      return Math.sqrt(ev(0));
    case "Root": {
      const b = ev(0);
      const n = ev(1);
      return b < 0 && n % 2 === 1 ? -Math.pow(-b, 1 / n) : Math.pow(b, 1 / n);
    }
    case "Abs":
      return Math.abs(ev(0));
    case "Sin":
      return Math.sin(ev(0));
    case "Cos":
      return Math.cos(ev(0));
    case "Tan":
      return Math.tan(ev(0));
    case "Exp":
      return Math.exp(ev(0));
    case "Ln":
      return Math.log(ev(0));
    case "Log":
      return args.length > 1 ? Math.log(ev(0)) / Math.log(ev(1)) : Math.log10(ev(0));
    case "Delimiter":
    case "Sequence":
    case "Hold":
      return args.length === 1 ? ev(0) : NaN;
    default:
      return NaN;
  }
}

/** Variables libres (símbolos que no son constantes conocidas). */
export function freeVars(j: MathJson, out = new Set<string>()): Set<string> {
  if (typeof j === "string") {
    if (!(j in CONSTS) && !j.startsWith("'")) out.add(j);
  } else if (Array.isArray(j)) j.slice(1).forEach((a) => freeVars(a, out));
  return out;
}

export function texToFn(latex: string, v = "x"): ((x: number) => number) | null {
  const p = parseTex(latex);
  if (!p) return null;
  return (x) => evaluate(p.json, { [v]: x });
}
