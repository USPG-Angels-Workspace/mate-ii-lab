"use client";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { ModuloId, Subtema } from "@/domain/types";

/** localStorage envuelto en try/catch (modo privado, almacenamiento bloqueado, etc.). */
const almacenSeguro: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* sin almacenamiento: la app sigue funcionando en memoria */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* nada */
    }
  },
};

export type Etapa = "explicacion" | "intuicion" | "guiada" | "sinPistas" | "check" | "explicalo";
export const ETAPAS: Etapa[] = ["explicacion", "intuicion", "guiada", "sinPistas", "check", "explicalo"];

export interface Dominio {
  intentos: number;
  aciertos: number;
  pistas: number;
  errores: number;
}

export interface Fallo {
  subtema: Subtema;
  tex: string;
  paso: string;
  mensaje: string;
  fecha: number;
}

interface EstadoModulo {
  etapa: Etapa;
  completadas: Etapa[];
  variante: "A" | "B";
  checkFallos: number;
}

interface EstadoBloque {
  acumuladoMs: number;
  inicio: number | null;
  completado: boolean;
}

interface Store {
  comprimido: boolean;
  bloques: Record<string, EstadoBloque>;
  modulos: Partial<Record<ModuloId, EstadoModulo>>;
  dominio: Partial<Record<Subtema, Dominio>>;
  fallos: Fallo[];
  semilla: number;
  setComprimido: (v: boolean) => void;
  iniciarBloque: (id: string) => void;
  pausarBloque: (id: string) => void;
  completarBloque: (id: string, v?: boolean) => void;
  irEtapa: (m: ModuloId, e: Etapa) => void;
  completarEtapa: (m: ModuloId, e: Etapa) => void;
  registrarCheck: (m: ModuloId, fallos: number) => void;
  registrar: (s: Subtema, r: { correcto: boolean; pistas?: number; error?: boolean }) => void;
  registrarFallo: (f: Omit<Fallo, "fecha">) => void;
  quitarFallo: (i: number) => void;
  nuevaSemilla: () => number;
  reiniciar: () => void;
}

const modDefault = (): EstadoModulo => ({ etapa: "explicacion", completadas: [], variante: "A", checkFallos: 0 });

export const useProgreso = create<Store>()(
  persist(
    (set, get) => ({
      comprimido: false,
      bloques: {},
      modulos: {},
      dominio: {},
      fallos: [],
      semilla: 1,
      setComprimido: (v) => set({ comprimido: v }),
      iniciarBloque: (id) =>
        set((s) => {
          const bloques = { ...s.bloques };
          // pausa cualquier otro bloque en marcha
          for (const [k, b] of Object.entries(bloques))
            if (b.inicio && k !== id) bloques[k] = { ...b, acumuladoMs: b.acumuladoMs + Date.now() - b.inicio, inicio: null };
          const b = bloques[id] ?? { acumuladoMs: 0, inicio: null, completado: false };
          bloques[id] = { ...b, inicio: b.inicio ?? Date.now() };
          return { bloques };
        }),
      pausarBloque: (id) =>
        set((s) => {
          const b = s.bloques[id];
          if (!b?.inicio) return s;
          return { bloques: { ...s.bloques, [id]: { ...b, acumuladoMs: b.acumuladoMs + Date.now() - b.inicio, inicio: null } } };
        }),
      completarBloque: (id, v = true) =>
        set((s) => {
          const b = s.bloques[id] ?? { acumuladoMs: 0, inicio: null, completado: false };
          const acumuladoMs = b.inicio ? b.acumuladoMs + Date.now() - b.inicio : b.acumuladoMs;
          return { bloques: { ...s.bloques, [id]: { acumuladoMs, inicio: null, completado: v } } };
        }),
      irEtapa: (m, e) => set((s) => ({ modulos: { ...s.modulos, [m]: { ...(s.modulos[m] ?? modDefault()), etapa: e } } })),
      completarEtapa: (m, e) =>
        set((s) => {
          const mod = s.modulos[m] ?? modDefault();
          const completadas = mod.completadas.includes(e) ? mod.completadas : [...mod.completadas, e];
          const sig = ETAPAS[ETAPAS.indexOf(e) + 1] ?? e;
          return { modulos: { ...s.modulos, [m]: { ...mod, completadas, etapa: sig } } };
        }),
      registrarCheck: (m, fallos) =>
        set((s) => {
          const mod = s.modulos[m] ?? modDefault();
          if (fallos >= 2)
            return {
              modulos: {
                ...s.modulos,
                [m]: { ...mod, checkFallos: mod.checkFallos + 1, variante: mod.variante === "A" ? "B" : "A", etapa: "explicacion" },
              },
            };
          const completadas = mod.completadas.includes("check") ? mod.completadas : [...mod.completadas, "check" as Etapa];
          return { modulos: { ...s.modulos, [m]: { ...mod, completadas, etapa: "explicalo" } } };
        }),
      registrar: (sub, { correcto, pistas = 0, error = false }) =>
        set((s) => {
          const d = s.dominio[sub] ?? { intentos: 0, aciertos: 0, pistas: 0, errores: 0 };
          return {
            dominio: {
              ...s.dominio,
              [sub]: { intentos: d.intentos + 1, aciertos: d.aciertos + (correcto ? 1 : 0), pistas: d.pistas + pistas, errores: d.errores + (error ? 1 : 0) },
            },
          };
        }),
      registrarFallo: (f) => set((s) => ({ fallos: [...s.fallos.slice(-49), { ...f, fecha: Date.now() }] })),
      quitarFallo: (i) => set((s) => ({ fallos: s.fallos.filter((_, j) => j !== i) })),
      nuevaSemilla: () => {
        const v = get().semilla + 1;
        set({ semilla: v });
        return v;
      },
      reiniciar: () => set({ bloques: {}, modulos: {}, dominio: {}, fallos: [] }),
    }),
    { name: "mate-ii-lab", storage: createJSONStorage(() => almacenSeguro), skipHydration: true },
  ),
);

export const estadoModulo = (s: Store, m: ModuloId): EstadoModulo => s.modulos[m] ?? modDefault();

/** Puntaje de dominio 0..1 (las pistas y los errores restan). */
export function puntaje(d?: Dominio): number | null {
  if (!d || d.intentos === 0) return null;
  return Math.max(0, (d.aciertos - 0.25 * d.pistas - 0.25 * d.errores) / d.intentos);
}
