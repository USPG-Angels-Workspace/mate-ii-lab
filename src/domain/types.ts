/**
 * Modelo de datos: Tema → Módulo → (explicación, visualización) → Generador → Ejercicio → Pasos → Errores típicos.
 * Todo lo que produce un generador es JSON serializable (se puede servir desde una API route).
 */

export type ModuloId = "limites" | "asintotas" | "derivadas" | "repaso";

/** Subtemas: unidad mínima del mapa de dominio. */
export type Subtema =
  | "lim-directa"
  | "lim-factorizar"
  | "lim-racionalizar"
  | "lim-h"
  | "lim-laterales"
  | "lim-infinito"
  | "asi-vertical"
  | "asi-horizontal"
  | "asi-oblicua"
  | "der-definicion"
  | "der-reglas"
  | "der-producto"
  | "der-cociente"
  | "der-cadena"
  | "rep-maxmin"
  | "rep-recta"
  | "rep-parabola"
  | "rep-angulos";

export interface ErrorTipico {
  id: string;
  /** Expresión/valor (LaTeX) que produce quien comete este error. */
  candidato: string;
  /** Explicación de por qué está mal (texto con $LaTeX$). */
  explicacion: string;
}

/** Tres niveles: empujón → método → paso casi resuelto. */
export type Pistas = [string, string, string];

interface PasoBase {
  id: string;
  /** Qué hay que hacer en este renglón (texto con $LaTeX$). */
  instruccion: string;
  pistas: Pistas;
  /** Explicación del "por qué" que se muestra al acertar. */
  porQue: string;
  /** Renglón modelo, como lo escribiría la docente (LaTeX). */
  modelo: string;
}

/** El estudiante escribe una expresión equivalente a `esperado`. */
export interface PasoExpr extends PasoBase {
  tipo: "expr";
  esperado: string;
  variable: string;
  /** Prefijo fijo que se muestra antes del input, ej. \lim_{x\to 5}. */
  prefijo?: string;
  /** Requisitos de forma (además de ser equivalente). */
  forma?: ("producto" | "finitoEnA" | "sinRaizEnNumerador")[];
  /** Punto del límite (para no evaluar ahí y para el chequeo finitoEnA). */
  a?: number;
  /** Ceros a evitar al evaluar. */
  evitar?: number[];
  /** Intervalo donde tiene sentido evaluar (ej. raíces). */
  rango?: [number, number];
  errores: ErrorTipico[];
}

/** Respuesta final numérica o infinita. */
export interface PasoValor extends PasoBase {
  tipo: "valor";
  /** LaTeX del valor, o "inf" | "-inf" | "noexiste". */
  esperado: string;
  prefijo?: string;
  errores: ErrorTipico[];
}

/** Decisión (¿0/0, k/0 o número?). Botones, no es un paso algebraico. */
export interface PasoOpcion extends PasoBase {
  tipo: "opcion";
  opciones: { id: string; texto: string }[];
  correcta: string;
  /** Explicación específica cuando se elige una opción incorrecta. */
  explicaciones: Record<string, string>;
}

/** Ecuaciones de asíntotas: conjunto de rectas (x=c, y=mx+b) o ninguna. */
export interface PasoEcuaciones extends PasoBase {
  tipo: "ecuaciones";
  /** Ecuaciones en LaTeX, ej. ["x=3", "x=-3"]. Vacío = ninguna. */
  esperado: string[];
  clase: "vertical" | "horizontal" | "oblicua";
  errores: ErrorTipico[];
}

export type Paso = PasoExpr | PasoValor | PasoOpcion | PasoEcuaciones;

export interface Ejercicio {
  /** Identificador reproducible: tipo:semilla:dificultad */
  id: string;
  tipo: string;
  subtema: Subtema;
  /** Enunciado al estilo de la docente. */
  enunciado: string;
  /** Expresión principal (LaTeX). */
  tex: string;
  pasos: Paso[];
  /** Resumen de la respuesta final (LaTeX/texto). */
  respuesta: string;
  /** Datos para graficar (opcional). */
  grafica?: Grafica;
}

export interface Grafica {
  /** f(x) en LaTeX, se evalúa con el evaluador propio. */
  f: string;
  verticales?: number[];
  huecos?: { x: number; y: number }[];
  horizontal?: number | null;
  oblicua?: { m: number; b: number } | null;
}

export type Dificultad = 1 | 2 | 3;

export interface Generador {
  tipo: string;
  subtema: Subtema;
  nombre: string;
  generar: (semilla: number, dificultad: Dificultad) => Ejercicio;
}

/** Pregunta de opción (predicciones y checks de comprensión). */
export interface PreguntaConcepto {
  id: string;
  subtema: Subtema;
  pregunta: string;
  opciones: string[];
  correcta: number;
  /** Por qué es así (y por qué la intuición equivocada falla). */
  porQue: string;
}

export interface Modulo {
  id: ModuloId;
  titulo: string;
  resumen: string;
  subtemas: Subtema[];
  generadores: string[];
  predicciones: PreguntaConcepto[];
  /** Banco de preguntas para el check (se toman 3). */
  check: PreguntaConcepto[];
  explicalo: { pregunta: string; modelo: string }[];
}

export interface Bloque {
  id: string;
  titulo: string;
  minutos: number;
  modulo?: ModuloId;
  tipo: "modulo" | "descanso" | "simulacro" | "cierre" | "repaso";
  subtemas: string;
}
