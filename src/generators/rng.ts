/** Generador pseudoaleatorio con semilla (mulberry32): mismo número → mismo ejercicio. */
export function crearRng(semilla: number) {
  let s = semilla >>> 0 || 1;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)];
  /** Entero en [min,max] que no esté en `excluir`. */
  const intEx = (min: number, max: number, excluir: number[]) => {
    for (let i = 0; i < 200; i++) {
      const v = int(min, max);
      if (!excluir.includes(v)) return v;
    }
    throw new Error("intEx: rango agotado");
  };
  return { next, int, pick, intEx };
}

export type Rng = ReturnType<typeof crearRng>;

export const frac = (n: string, d: string) => `\\frac{${n}}{${d}}`;
