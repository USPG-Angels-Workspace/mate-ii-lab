import type { Dificultad, Ejercicio, Generador } from "@/domain/types";
import { generadoresAsintotas } from "./asintotas";
import { generadoresDerivadas } from "./derivadas";
import { generadoresLimites } from "./limites";
import { generadoresRepaso } from "./repaso";

export const GENERADORES: Generador[] = [...generadoresLimites, ...generadoresAsintotas, ...generadoresDerivadas, ...generadoresRepaso];

export const generadorPorTipo = (tipo: string) => GENERADORES.find((g) => g.tipo === tipo);

export function generar(tipo: string, semilla: number, dif: Dificultad): Ejercicio {
  const g = generadorPorTipo(tipo);
  if (!g) throw new Error(`Generador desconocido: ${tipo}`);
  return g.generar(semilla, dif);
}
