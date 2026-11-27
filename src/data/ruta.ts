import type { Bloque } from "@/domain/types";

/** Ruta del día. Las duraciones se editan aquí; el «modo comprimido» las multiplica por 0.6. */
export const RUTA: Bloque[] = [
  {
    id: "b1",
    titulo: "Límites",
    minutos: 90,
    modulo: "limites",
    tipo: "modulo",
    subtemas: "Sustitución directa · 0/0 factorizando · racionalizar · límites con h · k/0 y laterales · al infinito",
  },
  {
    id: "b2",
    titulo: "Asíntotas y funciones racionales",
    minutos: 75,
    modulo: "asintotas",
    tipo: "modulo",
    subtemas: "A.V. (y huecos) · A.H. por grados · A.O. por división · graficar",
  },
  { id: "d1", titulo: "Descanso", minutos: 15, tipo: "descanso", subtemas: "Agua, estírate, sin pantalla. El cerebro consolida lo aprendido." },
  {
    id: "b3",
    titulo: "Derivadas",
    minutos: 105,
    modulo: "derivadas",
    tipo: "modulo",
    subtemas: "Definición por límite · reglas básicas · producto · cociente · cadena",
  },
  {
    id: "b4",
    titulo: "Repaso relámpago",
    minutos: 30,
    modulo: "repaso",
    tipo: "repaso",
    subtemas: "Máximos y mínimos (lo esencial) · recta y parábola · ángulos coterminales",
  },
  { id: "b5", titulo: "Simulacro final", minutos: 60, tipo: "simulacro", subtemas: "Como el examen real (1 h): límites, asíntotas y derivadas, sin pistas" },
  { id: "b6", titulo: "Cierre", minutos: 15, tipo: "cierre", subtemas: "Hoja resumen imprimible con tus puntos débiles. Luego, a dormir." },
];

export const minutosBloque = (b: Bloque, comprimido: boolean) => Math.round(b.minutos * (comprimido ? 0.6 : 1));
