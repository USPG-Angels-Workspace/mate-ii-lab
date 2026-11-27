/**
 * Polinomios con coeficientes en orden ascendente: [c0, c1, c2, ...] = c0 + c1·x + c2·x² ...
 * Funciones puras usadas por los generadores para construir ejercicios con solución conocida.
 */
export type Poly = number[];

export function trim(p: Poly): Poly {
  const r = [...p];
  while (r.length > 1 && Math.abs(r[r.length - 1]) < 1e-12) r.pop();
  return r;
}

export const deg = (p: Poly): number => trim(p).length - 1;
export const lead = (p: Poly): number => trim(p)[deg(p)];

export function add(a: Poly, b: Poly): Poly {
  const n = Math.max(a.length, b.length);
  return trim(Array.from({ length: n }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0)));
}

export const scale = (a: Poly, k: number): Poly => trim(a.map((c) => c * k));
export const sub = (a: Poly, b: Poly): Poly => add(a, scale(b, -1));

export function mul(a: Poly, b: Poly): Poly {
  const r = new Array(a.length + b.length - 1).fill(0);
  a.forEach((ai, i) => b.forEach((bj, j) => (r[i + j] += ai * bj)));
  return trim(r);
}

/** (x - r1)(x - r2)... */
export const fromRoots = (roots: number[]): Poly =>
  roots.reduce<Poly>((acc, r) => mul(acc, [-r, 1]), [1]);

export function evalPoly(p: Poly, x: number): number {
  let s = 0;
  for (let i = p.length - 1; i >= 0; i--) s = s * x + p[i];
  return s;
}

export function derive(p: Poly): Poly {
  if (p.length <= 1) return [0];
  return trim(p.slice(1).map((c, i) => c * (i + 1)));
}

/** División larga: n = q·d + r */
export function divide(n: Poly, d: Poly): { q: Poly; r: Poly } {
  let r = trim(n);
  const dd = trim(d);
  const dn = deg(dd);
  if (deg(r) < dn) return { q: [0], r };
  const q = new Array(deg(r) - dn + 1).fill(0);
  while (deg(r) >= dn && !(deg(r) === 0 && Math.abs(r[0]) < 1e-12)) {
    const k = deg(r) - dn;
    const c = lead(r) / lead(dd);
    q[k] = c;
    const t = new Array(k + 1).fill(0);
    t[k] = c;
    r = sub(r, mul(t, dd));
    if (deg(r) < dn) break;
  }
  return { q: trim(q), r };
}

/** Formatea un número como LaTeX (enteros o fracciones simples). */
export function numTex(v: number): string {
  if (Number.isInteger(v)) return String(v);
  const f = toFraction(v);
  if (f) {
    const [n, d] = f;
    return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
  }
  return String(Math.round(v * 1000) / 1000);
}

export function toFraction(v: number, maxDen = 200): [number, number] | null {
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9) return [n, d];
  }
  return null;
}

/** Polinomio a LaTeX, de mayor a menor grado: 2x^{2}-3x+2 */
export function polyTex(p: Poly, v = "x"): string {
  const t = trim(p);
  const parts: string[] = [];
  for (let i = t.length - 1; i >= 0; i--) {
    const c = t[i];
    if (Math.abs(c) < 1e-12) continue;
    const abs = Math.abs(c);
    const sign = c < 0 ? "-" : parts.length ? "+" : "";
    let coef = numTex(abs);
    if (i > 0 && abs === 1) coef = "";
    const pow = i === 0 ? "" : i === 1 ? v : `${v}^{${i}}`;
    parts.push(`${sign}${coef}${pow}`);
  }
  return parts.length ? parts.join("") : "0";
}

/** (x-3) o (x+2) */
export function factorTex(r: number, v = "x"): string {
  if (r === 0) return v;
  return r > 0 ? `(${v}-${numTex(r)})` : `(${v}+${numTex(-r)})`;
}

export function polyFn(p: Poly): (x: number) => number {
  return (x) => evalPoly(p, x);
}
