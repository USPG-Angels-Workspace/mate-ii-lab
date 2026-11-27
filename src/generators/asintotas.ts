import type { Dificultad, Ejercicio, Generador, Paso } from "@/domain/types";
import { deg, divide, evalPoly, factorTex, fromRoots, lead, numTex, polyTex, trim, type Poly } from "@/lib/math/poly";
import { crearRng, frac } from "./rng";

type Caso = "lineal" | "par" | "oblicua" | "hueco" | "sinAV";

/** Datos de una función racional con sus asíntotas calculadas a partir de su construcción. */
export interface Racional {
  num: Poly;
  den: Poly;
  raicesDen: number[];
}

export function analizar({ num, den, raicesDen }: Racional) {
  const verticales = [...new Set(raicesDen)].filter((r) => Math.abs(evalPoly(num, r)) > 1e-9).sort((a, b) => a - b);
  const huecos = [...new Set(raicesDen)].filter((r) => Math.abs(evalPoly(num, r)) <= 1e-9);
  const n = deg(num);
  const m = deg(den);
  const horizontal = n < m ? 0 : n === m ? lead(num) / lead(den) : null;
  let oblicua: { m: number; b: number } | null = null;
  if (n === m + 1) {
    const { q } = divide(num, den);
    oblicua = { m: q[1] ?? 0, b: q[0] ?? 0 };
  }
  return { verticales, huecos, horizontal, oblicua, n, m };
}

function construir(caso: Caso, r: ReturnType<typeof crearRng>): Racional {
  switch (caso) {
    case "lineal": {
      // (ax+b)/(x−c)  — Lab No. 1, ejercicios 1 y 6
      const c = r.intEx(-5, 5, [0]);
      let num: Poly;
      do num = [r.int(-6, 6), r.intEx(-4, 4, [0])];
      while (evalPoly(num, c) === 0);
      return { num, den: fromRoots([c]), raicesDen: [c] };
    }
    case "par": {
      // kx²/(x²−c²) o k/(c²−x²)  — ejercicios 2, 4 y 5
      const c = r.int(1, 4);
      const k = r.intEx(-3, 3, [0]);
      if (r.next() < 0.5) return { num: [0, 0, k], den: fromRoots([c, -c]), raicesDen: [c, -c] };
      return { num: [k], den: [c * c, 0, -1], raicesDen: [c, -c] };
    }
    case "oblicua": {
      // (ax²+px+q)/(x−c)  — ejercicios 3, 7, 8 y 9
      const c = r.intEx(-4, 4, [0]);
      let num: Poly;
      do num = [r.int(-6, 6), r.int(-5, 5), r.pick([1, 1, 2, 3])];
      while (evalPoly(num, c) === 0);
      return { num, den: fromRoots([c]), raicesDen: [c] };
    }
    case "hueco": {
      const a = r.intEx(-4, 4, [0]);
      const b = r.intEx(-5, 5, [a]);
      const c = r.intEx(-5, 5, [a, b]);
      return { num: fromRoots([a, b]), den: fromRoots([a, c]), raicesDen: [a, c] };
    }
    case "sinAV": {
      // (x²+px+q)/(x²+k)  — ejercicio 10
      const k = r.int(1, 4);
      return { num: [r.int(-5, 5), r.int(-4, 4), r.int(1, 3)], den: [k, 0, 1], raicesDen: [] };
    }
  }
}

const recta = (m: number, b: number) => `y=${polyTex(trim([b, m]))}`;

function genAsintotas(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const casos: Caso[] = dif === 1 ? ["lineal", "par"] : dif === 2 ? ["oblicua", "par", "lineal", "sinAV"] : ["hueco", "oblicua", "sinAV"];
  const caso = r.pick(casos);
  const rac = construir(caso, r);
  const { verticales, huecos, horizontal, oblicua, n, m } = analizar(rac);
  const { num, den } = rac;
  const tex = `f(x)=${frac(polyTex(num), polyTex(den))}`;
  const avTex = verticales.map((v) => `x=${numTex(v)}`);
  const ahTex = horizontal === null ? [] : [`y=${numTex(horizontal)}`];
  const aoTex = oblicua ? [recta(oblicua.m, oblicua.b)] : [];
  const factD = rac.raicesDen.length ? rac.raicesDen.map((x) => factorTex(x)).join("") : polyTex(den);
  const signoFactor = rac.raicesDen.length === 2 && lead(den) < 0 ? "-" : "";
  const gradoCaso = n < m ? "menor" : n === m ? "igual" : n === m + 1 ? "uno" : "mayor";

  const pasos: Paso[] = [
    {
      id: "av",
      tipo: "ecuaciones",
      clase: "vertical",
      instruccion:
        "**Asíntotas verticales.** Iguala el denominador a cero y resuelve. Luego **verifica** que ese valor NO haga cero también al numerador. Escribe cada asíntota como $x = c$, o marca «ninguna».",
      esperado: avTex,
      pistas: [
        `Denominador: $${polyTex(den)} = 0$.`,
        rac.raicesDen.length
          ? `Factorizado: $${signoFactor}${factD} = 0 \\Rightarrow x = ${rac.raicesDen.map(numTex).join(",\\ x = ")}$. Ahora sustituye cada uno en el numerador.`
          : `$${polyTex(den)}$ nunca vale cero (un cuadrado más un positivo siempre es positivo).`,
        avTex.length ? `Asíntota(s): $${avTex.join(",\\ ")}$.${huecos.length ? ` En $x=${huecos.map(numTex).join(",")}$ hay un **hueco**, no asíntota.` : ""}` : "No hay asíntotas verticales.",
      ],
      porQue:
        "Cerca de un valor que hace 0 al denominador (y no al numerador), la función divide un número entre algo cada vez más pequeño: se dispara a $\\pm\\infty$. Por eso la gráfica nunca toca la recta vertical.",
      modelo: avTex.length ? avTex.join(",\\quad ") : "\\text{No hay A.V.}",
      errores: huecos.map((h) => ({
        id: "hueco-como-av",
        candidato: `x=${numTex(h)}`,
        explicacion: `En $x=${numTex(h)}$ el numerador **también** vale 0: es $\\frac{0}{0}$, no $\\frac{k}{0}$. El factor $${factorTex(h)}$ se cancela y queda un **hueco** (punto vacío), no una asíntota.`,
      })),
    },
    {
      id: "grados",
      tipo: "opcion",
      instruccion: `**Compara grados.** Numerador grado ${n}, denominador grado ${m}. ¿Qué caso es?`,
      opciones: [
        { id: "menor", texto: "Arriba **menor** que abajo" },
        { id: "igual", texto: "Grados **iguales**" },
        { id: "uno", texto: "Arriba mayor **por uno**" },
        { id: "mayor", texto: "Arriba mayor por 2 o más" },
      ],
      correcta: gradoCaso,
      explicaciones: Object.fromEntries(["menor", "igual", "uno", "mayor"].map((k) => [k, `Cuenta de nuevo: arriba el mayor exponente es ${n} y abajo ${m}.`])),
      pistas: ["El grado es el exponente más alto de $x$.", `Arriba ${n}, abajo ${m}.`, `Caso: ${gradoCaso}.`],
      porQue: "Los grados deciden qué pasa cuando $x$ es enorme: si gana abajo → 0; si empatan → cociente de coeficientes; si gana arriba por uno → recta inclinada.",
      modelo: `\\text{gr}(N)=${n},\\ \\text{gr}(D)=${m}`,
    },
    {
      id: "ah",
      tipo: "ecuaciones",
      clase: "horizontal",
      instruccion: "**Asíntota horizontal.** Escribe $y = k$, o marca «ninguna» si no existe.",
      esperado: ahTex,
      pistas: [
        "Regla: arriba menor → $y=0$; iguales → $y=\\frac{\\text{coef. principal de arriba}}{\\text{coef. principal de abajo}}$; arriba mayor → no hay.",
        `Grados: ${n} y ${m}.`,
        ahTex.length ? `$${ahTex[0]}$` : "No hay asíntota horizontal.",
      ],
      porQue:
        horizontal === null
          ? "Si el numerador crece más rápido, la función no se estabiliza en una altura fija: no hay A.H."
          : `Cuando $x\\to\\pm\\infty$, la función se estabiliza en esa altura: $\\lim_{x\\to\\infty} f(x) = ${numTex(horizontal)}$.`,
      modelo: ahTex.length ? ahTex[0] : "\\text{No hay A.H.}",
      errores: [
        ...(n === m ? [{ id: "ah-cero", candidato: "y=0", explicacion: "$y=0$ es solo cuando el grado de arriba es **menor**. Con grados iguales es el cociente de coeficientes principales." }] : []),
        ...(n < m && lead(num) !== 0 ? [{ id: "ah-cociente", candidato: `y=${numTex(lead(num) / lead(den))}`, explicacion: "El cociente de coeficientes solo aplica con grados **iguales**. Aquí abajo gana: $y=0$." }] : []),
        ...(n > m ? [{ id: "ah-mayor", candidato: `y=${numTex(lead(num) / lead(den))}`, explicacion: "Si el grado de arriba es **mayor**, no hay asíntota horizontal." }] : []),
      ],
    },
  ];
  if (oblicua) {
    const { q, r: resto } = divide(num, den);
    pasos.push({
      id: "division",
      tipo: "expr",
      instruccion: `**Divide** $(${polyTex(num)}) \\div (${polyTex(den)})$ y escribe solo el **cociente** (sin el residuo).`,
      esperado: polyTex(q),
      variable: "x",
      pistas: [
        "Divide el primer término de arriba entre el primero de abajo; multiplica y resta; repite.",
        `Primer término: $\\frac{${polyTex([0, 0, num[2]])}}{x} = ${polyTex([0, num[2]])}$.`,
        `Cociente: $${polyTex(q)}$, residuo: $${polyTex(resto)}$.`,
      ],
      porQue: `$f(x) = ${polyTex(q)} + \\frac{${polyTex(resto)}}{${polyTex(den)}}$, y esa fracción se va a 0 cuando $x\\to\\pm\\infty$. Por eso la gráfica se pega a la recta del cociente.`,
      modelo: polyTex(q),
      errores: [
        {
          id: "signo-division",
          candidato: polyTex(divide(num, fromRoots([-rac.raicesDen[0]])).q),
          explicacion: `Dividiste entre $${factorTex(-rac.raicesDen[0])}$. Si usas división sintética con $${factorTex(rac.raicesDen[0])}$, el número que va afuera es $${numTex(rac.raicesDen[0])}$ (signo contrario al del paréntesis).`,
        },
      ],
    });
  }
  pasos.push({
    id: "ao",
    tipo: "ecuaciones",
    clase: "oblicua",
    instruccion: "**Asíntota oblicua.** Escribe $y = mx + b$, o marca «ninguna».",
    esperado: aoTex,
    pistas: [
      "Solo existe si el grado de arriba es **exactamente uno más** que el de abajo (y entonces no hay horizontal).",
      oblicua ? "Es el cociente de la división que acabas de hacer." : "¿Se cumple la condición de grados?",
      aoTex.length ? `$${aoTex[0]}$` : "No hay asíntota oblicua.",
    ],
    porQue: oblicua ? "El cociente de la división es la recta a la que se pega la función lejos del origen." : "Si ya hay asíntota horizontal, no puede haber oblicua (la función ya se estabiliza en una altura).",
    modelo: aoTex.length ? aoTex[0] : "\\text{No hay A.O.}",
    errores: horizontal !== null ? [{ id: "ah-y-ao", candidato: `y=${numTex(horizontal)}`, explicacion: "Esa es la horizontal. Si existe asíntota horizontal, **no** hay oblicua." }] : [],
  });

  const resumen = [
    avTex.length ? `A.V.: $${avTex.join(",\\ ")}$` : "Sin A.V.",
    ahTex.length ? `A.H.: $${ahTex[0]}$` : "Sin A.H.",
    aoTex.length ? `A.O.: $${aoTex[0]}$` : "Sin A.O.",
    ...(huecos.length ? [`Hueco en $x=${huecos.map(numTex).join(",")}$`] : []),
  ].join(" · ");
  const f = frac(polyTex(num), polyTex(den));
  const simpl = (x: number) => {
    // valor del hueco: límite de la función simplificada
    const e = 1e-6;
    return (evalPoly(num, x + e) / evalPoly(den, x + e) + evalPoly(num, x - e) / evalPoly(den, x - e)) / 2;
  };
  return {
    id: `asintotas:${semilla}:${dif}`,
    tipo: "asintotas",
    subtema: oblicua ? "asi-oblicua" : verticales.length ? "asi-vertical" : "asi-horizontal",
    enunciado: "Determine las asíntotas verticales, horizontales u oblicuas según sea el caso. Deje constancia del procedimiento y grafique.",
    tex,
    pasos,
    respuesta: resumen,
    grafica: {
      f,
      verticales,
      huecos: huecos.map((x) => ({ x, y: simpl(x) })),
      horizontal,
      oblicua,
    },
  };
}

export const generadoresAsintotas: Generador[] = [
  { tipo: "asintotas", subtema: "asi-vertical", nombre: "Asíntotas de una función racional", generar: genAsintotas },
];

