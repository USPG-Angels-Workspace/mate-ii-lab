import type { Dificultad, Ejercicio, Generador, Paso, PasoOpcion } from "@/domain/types";
import { evalPoly, factorTex, fromRoots, numTex, polyTex, type Poly } from "@/lib/math/poly";
import { crearRng, frac } from "./rng";

const lim = (a: string | number, v = "x") => `\\lim_{${v}\\to ${typeof a === "number" ? numTex(a) : a}}`;

/** Paso 1 de todos los límites: sustituir directamente y clasificar lo que sale. */
function pasoSustituir(v: string, a: number | string, correcta: "00" | "k0" | "num", detalle: string): PasoOpcion {
  return {
    id: "sustituir",
    tipo: "opcion",
    instruccion: `Primero, **sustituye** $${v} = ${typeof a === "number" ? numTex(a) : a}$ directamente. ¿Qué obtienes?`,
    opciones: [
      { id: "00", texto: "$\\frac{0}{0}$ (indeterminado)" },
      { id: "k0", texto: "$\\frac{k}{0}$ con $k \\neq 0$" },
      { id: "num", texto: "Un número normal" },
    ],
    correcta,
    explicaciones: {
      "00": "Revisa la sustitución: el numerador **no** da 0.",
      k0: correcta === "00" ? "Sustituye también en el numerador: también da 0, así que es $\\frac{0}{0}$." : "El denominador no da 0.",
      num: "Sustituye en el denominador: da 0, y no se puede dividir entre cero.",
    },
    pistas: [
      "Reemplaza cada letra por el número y calcula arriba y abajo **por separado**.",
      detalle,
      `Resultado de la sustitución: ${correcta === "00" ? "$\\frac{0}{0}$" : correcta === "k0" ? "número entre 0" : "un número"}.`,
    ],
    porQue:
      correcta === "00"
        ? "$\\frac{0}{0}$ no es un número: es una **señal** de que numerador y denominador comparten un factor que vale 0 en ese punto. Hay que quitarlo (factorizar o racionalizar) antes de evaluar."
        : correcta === "k0"
          ? "Un número distinto de 0 entre algo que se acerca a 0 crece sin límite: hay que mirar los **laterales** para ver si va a $+\\infty$ o $-\\infty$."
          : "Si no aparece división entre cero, el límite es simplemente el valor sustituido.",
    modelo: detalle,
  };
}

const ERROR_CERO = {
  id: "00-es-0",
  candidato: "0",
  explicacion: "$\\frac{0}{0}$ **no** es 0: es indeterminado. El 0 de arriba y el de abajo se «pelean»; hay que simplificar primero y luego evaluar.",
};

// ─────────────────────────── 1. Factorizar ───────────────────────────
function genFactorizar(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  if (dif === 3) return genCubos(semilla);
  const a = r.intEx(-5, 6, [0]);
  const b = r.intEx(-6, 6, [a]);
  const c = dif === 2 ? r.intEx(-6, 6, [a, b]) : null;
  const num = fromRoots([a, b]);
  const den: Poly = c === null ? fromRoots([a]) : fromRoots([a, c]);
  const tex = frac(polyTex(num), polyTex(den));
  const factN = `${factorTex(a)}${factorTex(b)}`;
  const factD = c === null ? factorTex(a) : `${factorTex(a)}${factorTex(c)}`;
  const simp = c === null ? polyTex([-b, 1]) : frac(polyTex([-b, 1]), polyTex([-c, 1]));
  const valor = c === null ? a - b : (a - b) / (a - c);
  const L = lim(a);
  const swapped = frac(polyTex(fromRoots([-a, -b])), polyTex(den));
  // "cancelar términos": quitar el x² de arriba y de abajo
  const sinX2N = polyTex(num.slice(0, 2));
  const sinX2D = polyTex(den.slice(0, 2));
  const pasos: Paso[] = [
    pasoSustituir("x", a, "00", `Numerador en $x=${numTex(a)}$: $${polyTex(num).replace(/x/g, `(${numTex(a)})`)} = 0$; el denominador también da $0$.`),
    {
      id: "factorizar",
      tipo: "expr",
      instruccion: "**Factoriza** el numerador y el denominador (escribe la fracción completa factorizada).",
      prefijo: L,
      esperado: tex,
      variable: "x",
      forma: ["producto"],
      a,
      evitar: c === null ? [a] : [a, c],
      pistas: [
        `Si al sustituir $x=${numTex(a)}$ da 0, entonces $${factorTex(a)}$ **es factor** de ese polinomio.`,
        `Para $x^2+bx+c$ busca dos números que **multiplicados** den $c$ y **sumados** den $b$.`,
        `Numerador: $${factN}$. Denominador: $${factD}$.`,
      ],
      porQue: `Factorizar convierte sumas en **productos**; solo los factores que multiplican a todo se pueden cancelar.`,
      modelo: `${frac(factN, factD)}`,
      errores: [
        {
          id: "signos-factor",
          candidato: swapped,
          explicacion: `Revisa los signos de los factores: si $x=${numTex(a)}$ hace cero al polinomio, el factor es $${factorTex(a)}$ (con el signo contrario al número).`,
        },
      ],
    },
    {
      id: "simplificar",
      tipo: "expr",
      instruccion: `**Simplifica:** cancela el factor común $${factorTex(a)}$ y escribe lo que queda.`,
      prefijo: L,
      esperado: simp,
      variable: "x",
      forma: ["finitoEnA"],
      a,
      evitar: c === null ? [] : [c],
      pistas: [
        "¿Qué factor aparece **arriba y abajo** a la vez?",
        `Como $x\\to${numTex(a)}$ pero $x\\neq ${numTex(a)}$, el factor $${factorTex(a)}$ no es cero y se puede cancelar.`,
        `Queda $${simp}$.`,
      ],
      porQue: `Cancelar $${factorTex(a)}$ es válido porque en un límite $x$ se **acerca** a $${numTex(a)}$ pero nunca vale exactamente eso: ese factor nunca es 0.`,
      modelo: `${simp}`,
      errores:
        c === null
          ? []
          : [
              {
                id: "cancelar-terminos",
                candidato: frac(sinX2N, sinX2D),
                explicacion:
                  "Cancelaste el $x^2$ de arriba con el de abajo, pero son **términos** (están sumando), no factores. Solo se cancela lo que multiplica a **todo** el numerador y a **todo** el denominador.",
              },
            ],
    },
    {
      id: "evaluar",
      tipo: "valor",
      instruccion: `**Evalúa:** sustituye $x=${numTex(a)}$ en la expresión simplificada.`,
      prefijo: `${L} ${simp} =`,
      esperado: numTex(valor),
      pistas: [
        "Ahora el denominador ya no se hace cero: sustituye sin miedo.",
        `Reemplaza $x$ por $${numTex(a)}$ en $${simp}$.`,
        `$${simp.replace(/x/g, `(${numTex(a)})`)} = ${numTex(valor)}$`,
      ],
      porQue: "La función simplificada es igual a la original en todos los puntos cerca de $a$, así que tiene el mismo límite.",
      modelo: `= \\boxed{${numTex(valor)}}`,
      errores: valor !== 0 ? [ERROR_CERO] : [],
    },
  ];
  return {
    id: `lim-factorizar:${semilla}:${dif}`,
    tipo: "lim-factorizar",
    subtema: "lim-factorizar",
    enunciado: "Determine el valor del límite. Recuerde: el DENOMINADOR NO PUEDE QUEDAR CERO; factorice, simplifique y evalúe.",
    tex: `${L} ${tex}`,
    pasos,
    respuesta: numTex(valor),
  };
}

/** Diferencia/suma de cubos sobre diferencia de cuadrados (Lab No. 2, ejercicios 1 y 2). */
function genCubos(semilla: number): Ejercicio {
  const r = crearRng(semilla);
  const k = r.int(1, 3);
  const suma = r.next() < 0.5;
  const a = suma ? -k : k;
  const num: Poly = suma ? [k ** 3, 0, 0, 1] : [-(k ** 3), 0, 0, 1];
  const den: Poly = [-(k * k), 0, 1];
  const tex = frac(polyTex(num), polyTex(den));
  const trin = suma ? polyTex([k * k, -k, 1]) : polyTex([k * k, k, 1]);
  const fN = suma ? `${factorTex(-k)}(${trin})` : `${factorTex(k)}(${trin})`;
  const fD = `${factorTex(k)}${factorTex(-k)}`;
  const otro = suma ? factorTex(k) : factorTex(-k);
  const simp = frac(trin, otro.slice(1, -1));
  const valor = (3 * k * k) / (suma ? -2 * k : 2 * k);
  const L = lim(a);
  return {
    id: `lim-factorizar:${semilla}:3`,
    tipo: "lim-factorizar",
    subtema: "lim-factorizar",
    enunciado: "Determine el valor del límite. Factorice (suma/diferencia de cubos y diferencia de cuadrados), simplifique y evalúe.",
    tex: `${L} ${tex}`,
    respuesta: numTex(valor),
    pasos: [
      pasoSustituir("x", a, "00", `Numerador: $(${a})^3 ${suma ? "+" : "-"} ${k ** 3} = 0$; denominador: $(${a})^2 - ${k * k} = 0$.`),
      {
        id: "factorizar",
        tipo: "expr",
        instruccion: "**Factoriza** el numerador (cubos) y el denominador (diferencia de cuadrados).",
        prefijo: L,
        esperado: tex,
        variable: "x",
        forma: ["producto"],
        a,
        evitar: [k, -k],
        pistas: [
          suma ? "Suma de cubos: $a^3+b^3=(a+b)(a^2-ab+b^2)$." : "Diferencia de cubos: $a^3-b^3=(a-b)(a^2+ab+b^2)$.",
          "Diferencia de cuadrados: $a^2-b^2=(a-b)(a+b)$.",
          `Queda $${frac(fN, fD)}$.`,
        ],
        porQue: "Las fórmulas de cubos y cuadrados son productos notables: convierten la expresión en factores que se pueden cancelar.",
        modelo: `${frac(fN, fD)}`,
        errores: [],
      },
      {
        id: "simplificar",
        tipo: "expr",
        instruccion: `**Simplifica:** cancela $${factorTex(a)}$.`,
        prefijo: L,
        esperado: simp,
        variable: "x",
        forma: ["finitoEnA"],
        a,
        evitar: [-a],
        pistas: ["¿Qué factor está arriba y abajo?", `Cancela $${factorTex(a)}$.`, `Queda $${simp}$.`],
        porQue: "Ese factor era el que producía el $\\frac{0}{0}$.",
        modelo: `${simp}`,
        errores: [],
      },
      {
        id: "evaluar",
        tipo: "valor",
        instruccion: `**Evalúa** en $x=${a}$.`,
        prefijo: `${L} ${simp} =`,
        esperado: numTex(valor),
        pistas: ["Sustituye en la expresión simplificada.", `Arriba: $${3 * k * k}$.`, `Abajo: $${suma ? -2 * k : 2 * k}$.`],
        porQue: "Ya no hay división entre cero.",
        modelo: `= \\boxed{${numTex(valor)}}`,
        errores: [ERROR_CERO],
      },
    ],
  };
}

// ─────────────────────────── 2. Racionalizar ───────────────────────────
function genRacionalizar(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  if (dif === 3) {
    // (√(x+p) − √p)/x, x→0  (Lab No. 2, ejercicio 5)
    const p = r.pick([2, 3, 5, 6, 7]);
    const raiz = `\\sqrt{x+${p}}`;
    const tex = frac(`${raiz}-\\sqrt{${p}}`, "x");
    const L = lim(0);
    const conj = `${raiz}+\\sqrt{${p}}`;
    const resp = `\\frac{1}{2\\sqrt{${p}}}`;
    return {
      id: `lim-racionalizar:${semilla}:3`,
      tipo: "lim-racionalizar",
      subtema: "lim-racionalizar",
      enunciado: "Determine el valor del límite. Racionalice, simplifique y evalúe.",
      tex: `${L} ${tex}`,
      respuesta: resp,
      pasos: [
        pasoSustituir("x", 0, "00", `Numerador: $\\sqrt{${p}}-\\sqrt{${p}}=0$; denominador: $0$.`),
        {
          id: "racionalizar",
          tipo: "expr",
          instruccion: `**Racionaliza:** multiplica arriba y abajo por el conjugado $${conj}$. Desarrolla el numerador y deja el denominador factorizado.`,
          prefijo: L,
          esperado: tex,
          variable: "x",
          forma: ["sinRaizEnNumerador"],
          rango: [-p + 0.2, 10],
          evitar: [0],
          pistas: [
            "El conjugado de $\\sqrt{A}-\\sqrt{B}$ es $\\sqrt{A}+\\sqrt{B}$.",
            "Arriba usa $(\\sqrt{A}-\\sqrt{B})(\\sqrt{A}+\\sqrt{B}) = A - B$.",
            `Queda $${frac(`x`, `x(${conj})`)}$.`,
          ],
          porQue: "Multiplicar por el conjugado es multiplicar por 1 (lo mismo arriba y abajo), y elimina la raíz del numerador, que era la que «escondía» el factor $x$.",
          modelo: `${frac("x", `x(${conj})`)}`,
          errores: [],
        },
        {
          id: "simplificar",
          tipo: "expr",
          instruccion: "**Simplifica:** cancela $x$.",
          prefijo: L,
          esperado: frac("1", conj),
          variable: "x",
          forma: ["finitoEnA"],
          a: 0,
          rango: [-p + 0.2, 10],
          pistas: ["¿Qué factor está arriba y abajo?", "Cancela la $x$.", `Queda $${frac("1", conj)}$.`],
          porQue: "Como $x\\to 0$ pero $x\\neq 0$, se puede cancelar.",
          modelo: `${frac("1", conj)}`,
          errores: [],
        },
        {
          id: "evaluar",
          tipo: "valor",
          instruccion: "**Evalúa** en $x = 0$.",
          prefijo: `${L} ${frac("1", conj)} =`,
          esperado: resp,
          pistas: ["Sustituye $x=0$.", `Abajo queda $\\sqrt{${p}}+\\sqrt{${p}}$.`, `$= ${resp}$`],
          porQue: "Ya no hay división entre cero.",
          modelo: `= \\boxed{${resp}}`,
          errores: [ERROR_CERO, { id: "sin-doble", candidato: `\\frac{1}{\\sqrt{${p}}}`, explicacion: `Abajo hay **dos** raíces: $\\sqrt{${p}}+\\sqrt{${p}} = 2\\sqrt{${p}}$.` }],
        },
      ],
    };
  }
  // (√(x+p) − q)/(x − a)  (Lab No. 2, ejercicio 4)
  const q = r.int(2, 4);
  const a = r.intEx(-3, 7, [0]);
  const p = q * q - a;
  const pTex = p >= 0 ? `+${p}` : `${p}`;
  const raiz = `\\sqrt{x${pTex}}`;
  const tex = frac(`${raiz}-${q}`, polyTex([-a, 1]));
  const L = lim(a);
  const conj = `${raiz}+${q}`;
  const resp = numTex(1 / (2 * q));
  const rango: [number, number] = [-p + 0.2, -p + 25];
  return {
    id: `lim-racionalizar:${semilla}:${dif}`,
    tipo: "lim-racionalizar",
    subtema: "lim-racionalizar",
    enunciado: "Determine el valor del límite. Racionalice, simplifique y evalúe.",
    tex: `${L} ${tex}`,
    respuesta: resp,
    pasos: [
      pasoSustituir("x", a, "00", `Numerador: $\\sqrt{${a}${pTex}}-${q}=\\sqrt{${q * q}}-${q}=0$; denominador: $${a}-${a}=0$.`),
      {
        id: "racionalizar",
        tipo: "expr",
        instruccion: `**Racionaliza:** multiplica arriba y abajo por el conjugado $${conj}$. Desarrolla el numerador y deja el denominador factorizado.`,
        prefijo: L,
        esperado: tex,
        variable: "x",
        forma: ["sinRaizEnNumerador"],
        rango,
        evitar: [a],
        pistas: [
          `El conjugado de $${raiz}-${q}$ es $${conj}$ (mismo par, signo del medio contrario).`,
          `Arriba: $(${raiz}-${q})(${conj}) = (x${pTex}) - ${q}^2$.`,
          `Queda $${frac(polyTex([-a, 1]), `${factorTex(a)}(${conj})`)}$.`,
        ],
        porQue: "Multiplicar por el conjugado es multiplicar por 1, y $(\\sqrt{A}-q)(\\sqrt{A}+q)=A-q^2$ quita la raíz: así aparece el factor escondido.",
        modelo: `${frac(polyTex([-a, 1]), `${factorTex(a)}(${conj})`)}`,
        errores: [
          {
            id: "olvido-cuadrado",
            candidato: frac(`x${pTex}-${q}`, `${factorTex(a)}(${conj})`),
            explicacion: `$(\\sqrt{A}-${q})(\\sqrt{A}+${q}) = A - ${q}^2 = A - ${q * q}$: te faltó **elevar al cuadrado** el ${q}.`,
          },
        ],
      },
      {
        id: "simplificar",
        tipo: "expr",
        instruccion: `**Simplifica:** cancela $${factorTex(a)}$.`,
        prefijo: L,
        esperado: frac("1", conj),
        variable: "x",
        forma: ["finitoEnA"],
        a,
        rango,
        pistas: ["¿Qué factor está arriba y abajo?", `Arriba quedó $${polyTex([-a, 1])}$, que es el mismo factor de abajo.`, `Queda $${frac("1", conj)}$.`],
        porQue: `Como $x\\neq ${a}$ en el límite, $${factorTex(a)}\\neq 0$ y se puede cancelar.`,
        modelo: `${frac("1", conj)}`,
        errores: [],
      },
      {
        id: "evaluar",
        tipo: "valor",
        instruccion: `**Evalúa** en $x=${a}$.`,
        prefijo: `${L} ${frac("1", conj)} =`,
        esperado: resp,
        pistas: ["Sustituye en la expresión simplificada.", `Abajo: $\\sqrt{${q * q}}+${q} = ${2 * q}$.`, `$= ${resp}$`],
        porQue: "Ya no hay división entre cero.",
        modelo: `= \\boxed{${resp}}`,
        errores: [ERROR_CERO, { id: "sin-doble", candidato: numTex(1 / q), explicacion: `Abajo: $\\sqrt{${q * q}}+${q} = ${q}+${q} = ${2 * q}$, no ${q}.` }],
      },
    ],
  };
}

// ─────────────────────────── 3. Límites con h ───────────────────────────
function genH(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const a = r.intEx(-5, 5, [0]);
  const aT = a < 0 ? `(${a})` : `${a}`;
  const L = lim(0, "h");
  const tipo = dif === 1 ? "cuadrado" : dif === 2 ? r.pick(["cuadrado", "cubo"] as const) : r.pick(["cubo", "reciproco"] as const);
  const ah = a < 0 ? `(${a}+h)` : `(${a}+h)`;
  let tex: string, factor: string, simp: string, valor: number, errSuma: string | null, porQue: string;
  if (tipo === "cuadrado") {
    tex = frac(`${ah}^2-${a * a}`, "h");
    factor = frac(`h(${2 * a}+h)`, "h");
    simp = `${2 * a}+h`;
    valor = 2 * a;
    errSuma = "h";
    porQue = `$${ah}^2 = ${aT}^2 + 2${aT}h + h^2$`;
  } else if (tipo === "cubo") {
    tex = frac(`${ah}^3-${aT}^3`, "h");
    factor = frac(`h(${3 * a * a}+${3 * a}h+h^2)`, "h");
    simp = `${3 * a * a}+${3 * a}h+h^2`;
    valor = 3 * a * a;
    errSuma = "h^2";
    porQue = `$${ah}^3 = a^3 + 3a^2h + 3ah^2 + h^3$ con $a=${a}$`;
  } else {
    tex = frac(`\\frac{1}{${a}+h}-\\frac{1}{${a}}`, "h");
    factor = frac("-h", `${a}(${a}+h)h`);
    simp = frac("-1", `${a}(${a}+h)`);
    valor = -1 / (a * a);
    errSuma = null;
    porQue = "Para restar fracciones usa común denominador: $\\frac{1}{A}-\\frac{1}{B}=\\frac{B-A}{AB}$";
  }
  simp = simp.replace(/\+-/g, "-");
  factor = factor.replace(/\+-/g, "-");
  return {
    id: `lim-h:${semilla}:${dif}`,
    tipo: "lim-h",
    subtema: "lim-h",
    enunciado: "Determine el valor del límite (desarrolle, simplifique y evalúe). Este tipo es exactamente la definición de derivada.",
    tex: `${L} ${tex}`,
    respuesta: numTex(valor),
    pasos: [
      pasoSustituir("h", 0, "00", `Con $h=0$ el numerador queda $${a}^{\\ldots}-${a}^{\\ldots}=0$ y el denominador $0$.`),
      {
        id: "factorizar",
        tipo: "expr",
        instruccion: tipo === "reciproco" ? "Resta las fracciones de arriba (común denominador) y escribe todo como **una** fracción factorizada." : "**Desarrolla** el numerador, reduce, y **saca $h$ como factor común**.",
        prefijo: L,
        esperado: tex,
        variable: "h",
        forma: ["producto"],
        evitar: [0, -a],
        rango: [-3, 3],
        pistas: [porQue + ".", "Después de reducir, todos los términos del numerador tienen $h$: sácala de factor común.", `Queda $${factor}$.`],
        porQue: "Al desarrollar se cancelan los términos sin $h$; lo que queda tiene $h$ como factor, y ese es el factor que produce el $\\frac{0}{0}$.",
        modelo: `${factor}`,
        errores: errSuma
          ? [{ id: "binomio", candidato: errSuma, explicacion: "$(a+h)^n \\neq a^n + h^n$. Desarrolla el binomio completo: faltan los términos cruzados." }]
          : [],
      },
      {
        id: "simplificar",
        tipo: "expr",
        instruccion: "**Simplifica:** cancela $h$.",
        prefijo: L,
        esperado: simp,
        variable: "h",
        forma: ["finitoEnA"],
        a: 0,
        evitar: [-a],
        rango: [-3, 3],
        pistas: ["¿Qué factor aparece arriba y abajo?", "Cancela la $h$.", `Queda $${simp}$.`],
        porQue: "$h\\to 0$ pero $h\\neq 0$, así que se puede cancelar.",
        modelo: `${simp}`,
        errores: [],
      },
      {
        id: "evaluar",
        tipo: "valor",
        instruccion: "**Evalúa** en $h = 0$.",
        prefijo: `${L} ${simp} =`,
        esperado: numTex(valor),
        pistas: ["Sustituye $h=0$.", "Los términos con $h$ desaparecen.", `$= ${numTex(valor)}$`],
        porQue: "Sin $h$ en el denominador, ya se puede sustituir.",
        modelo: `= \\boxed{${numTex(valor)}}`,
        errores: [ERROR_CERO],
      },
    ],
  };
}

// ─────────────────────────── 4. k/0 y laterales ───────────────────────────
function genLaterales(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const a = r.intEx(-5, 6, [0]);
  let num: Poly;
  do {
    num = fromRoots([r.intEx(-6, 6, [a]), r.intEx(-6, 6, [a])]);
  } while (evalPoly(num, a) === 0);
  const doble = dif === 2;
  const den: Poly = doble ? fromRoots([a, a]) : dif === 3 ? fromRoots([a, r.intEx(-6, 6, [a])]) : fromRoots([a]);
  const f = (x: number) => evalPoly(num, x) / evalPoly(den, x);
  const signo = (x: number) => (f(x) > 0 ? "inf" : "-inf");
  const izq = signo(a - 1e-6);
  const der = signo(a + 1e-6);
  const final = izq === der ? izq : "noexiste";
  const tex = frac(polyTex(num), doble ? `${factorTex(a)}^2` : polyTex(den));
  const L = lim(a);
  const k = evalPoly(num, a);
  const opts = [
    { id: "inf", texto: "$+\\infty$" },
    { id: "-inf", texto: "$-\\infty$" },
  ];
  const txt = (s: string) => (s === "inf" ? "+\\infty" : s === "-inf" ? "-\\infty" : "\\text{no existe}");
  return {
    id: `lim-laterales:${semilla}:${dif}`,
    tipo: "lim-laterales",
    subtema: "lim-laterales",
    enunciado: "Determine el valor del límite. Si el denominador queda en cero y el numerador no, analice los límites laterales.",
    tex: `${L} ${tex}`,
    respuesta: txt(final),
    pasos: [
      pasoSustituir("x", a, "k0", `Numerador: $${k}$; denominador: $0$. Es $\\frac{${k}}{0}$.`),
      {
        id: "izq",
        tipo: "opcion",
        instruccion: `**Límite por la izquierda** ($x\\to ${a}^-$, por ejemplo $x=${a - 0.01}$): ¿hacia dónde va?`,
        opciones: opts,
        correcta: izq,
        explicaciones: { [izq === "inf" ? "-inf" : "inf"]: "Revisa los signos: con $x$ un poquito **menor** que $a$, ¿el denominador es positivo o negativo?" },
        pistas: [
          `Sustituye un número muy cercano por la izquierda, como $x=${a - 0.01}$.`,
          `El numerador vale aprox. $${k}$ (signo ${k > 0 ? "+" : "−"}). Mira el signo del denominador.`,
          `${k > 0 ? "Positivo" : "Negativo"} entre ${f(a - 1e-6) / k > 0 ? "positivo" : "negativo"} pequeño → $${txt(izq)}$.`,
        ],
        porQue: "Dividir entre un número cada vez más pequeño da resultados cada vez más grandes; el **signo** decide si es $+\\infty$ o $-\\infty$.",
        modelo: `\\lim_{x\\to ${a}^-} = ${txt(izq)}`,
      },
      {
        id: "der",
        tipo: "opcion",
        instruccion: `**Límite por la derecha** ($x\\to ${a}^+$, por ejemplo $x=${a + 0.01}$): ¿hacia dónde va?`,
        opciones: opts,
        correcta: der,
        explicaciones: { [der === "inf" ? "-inf" : "inf"]: "Revisa los signos: con $x$ un poquito **mayor** que $a$, ¿el denominador es positivo o negativo?" },
        pistas: [
          `Sustituye $x=${a + 0.01}$.`,
          `El numerador sigue cerca de $${k}$. ¿Qué signo tiene ahora el denominador?`,
          `${k > 0 ? "Positivo" : "Negativo"} entre ${f(a + 1e-6) / k > 0 ? "positivo" : "negativo"} pequeño → $${txt(der)}$.`,
        ],
        porQue: doble ? "Con $(x-a)^2$ abajo, el denominador es positivo por ambos lados." : "El factor $(x-a)$ cambia de signo al cruzar $a$.",
        modelo: `\\lim_{x\\to ${a}^+} = ${txt(der)}`,
      },
      {
        id: "conclusion",
        tipo: "opcion",
        instruccion: "**Conclusión:** ¿cuál es el límite bilateral?",
        opciones: [...opts, { id: "noexiste", texto: "No existe" }],
        correcta: final,
        explicaciones: {
          noexiste: "Si ambos laterales van al **mismo** infinito, el límite se escribe como ese infinito (la gráfica sube o baja por los dos lados).",
          inf: final === "noexiste" ? "Los laterales son **distintos**; el límite bilateral solo existe si coinciden." : "Revisa el signo.",
          "-inf": final === "noexiste" ? "Los laterales son **distintos**; el límite bilateral solo existe si coinciden." : "Revisa el signo.",
        },
        pistas: ["Compara los dos laterales.", "Si son iguales, ese es el límite; si no, no existe.", `Izquierda $${txt(izq)}$, derecha $${txt(der)}$.`],
        porQue: "El límite existe solo si **ambos lados** llegan al mismo lugar. Además, hay una asíntota vertical en ese $x$.",
        modelo: `${L} ${tex} = \\boxed{${txt(final)}}`,
      },
    ],
  };
}

// ─────────────────────────── 5. Límites al infinito ───────────────────────────
function genInfinito(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const m = r.int(1, 2);
  const n = dif === 1 ? m : r.pick([m - 1, m, m + 1].filter((v) => v >= 0));
  const coefs = (g: number): Poly => Array.from({ length: g + 1 }, (_, i) => (i === g ? r.intEx(-5, 6, [0]) : r.int(-6, 6)));
  const num = coefs(n);
  const den = coefs(m);
  const caso = n < m ? "menor" : n === m ? "igual" : "mayor";
  const ratio = num[n] / den[m];
  const esperado = caso === "menor" ? "0" : caso === "igual" ? numTex(ratio) : ratio > 0 ? "inf" : "-inf";
  const L = lim("\\infty");
  const tex = frac(polyTex(num), polyTex(den));
  return {
    id: `lim-infinito:${semilla}:${dif}`,
    tipo: "lim-infinito",
    subtema: "lim-infinito",
    enunciado: "Determine el límite cuando $x$ tiende a infinito.",
    tex: `${L} ${tex}`,
    respuesta: esperado === "inf" ? "+\\infty" : esperado === "-inf" ? "-\\infty" : esperado,
    pasos: [
      {
        id: "grados",
        tipo: "opcion",
        instruccion: "Compara el **grado** (mayor exponente) del numerador con el del denominador.",
        opciones: [
          { id: "menor", texto: "Grado de arriba **menor**" },
          { id: "igual", texto: "Grados **iguales**" },
          { id: "mayor", texto: "Grado de arriba **mayor**" },
        ],
        correcta: caso,
        explicaciones: { menor: "Revisa: busca la potencia más alta de cada polinomio.", igual: "Revisa: busca la potencia más alta de cada polinomio.", mayor: "Revisa: busca la potencia más alta de cada polinomio." },
        pistas: ["El grado es el exponente más grande de $x$.", `Arriba: grado ${n}. Abajo: grado ${m}.`, `Es «${caso}».`],
        porQue: "Cuando $x$ es enorme, solo importa el término de mayor grado: los demás son insignificantes en comparación.",
        modelo: `\\text{grado}_{num}=${n},\\ \\text{grado}_{den}=${m}`,
      },
      {
        id: "valor",
        tipo: "valor",
        instruccion: "¿Cuál es el límite?",
        prefijo: `${L} ${tex} =`,
        esperado,
        pistas: [
          "Divide todo entre la potencia más alta del denominador y piensa que $\\frac{1}{x}\\to 0$.",
          "Menor → 0; iguales → cociente de coeficientes principales; mayor → $\\pm\\infty$.",
          caso === "igual" ? `$${frac(String(num[n]), String(den[m]))} = ${numTex(ratio)}$` : `Es $${esperado === "0" ? "0" : esperado === "inf" ? "+\\infty" : "-\\infty"}$.`,
        ],
        porQue: "Dividiendo entre $x^{m}$, cada término $\\frac{c}{x^k}$ se va a 0 y solo sobreviven los coeficientes principales.",
        modelo: `= \\boxed{${esperado === "inf" ? "+\\infty" : esperado === "-inf" ? "-\\infty" : esperado}}`,
        errores:
          caso === "igual"
            ? [{ id: "grado-igual-0", candidato: "0", explicacion: "Con grados **iguales** el límite es el cociente de los coeficientes principales, no 0." }]
            : caso === "menor"
              ? [{ id: "menor-ratio", candidato: numTex(ratio), explicacion: "Ese cociente solo vale cuando los grados son iguales. Si abajo crece más rápido, el límite es 0." }]
              : [],
      },
    ],
  };
}

export const generadoresLimites: Generador[] = [
  { tipo: "lim-factorizar", subtema: "lim-factorizar", nombre: "Factorizar y simplificar (0/0)", generar: genFactorizar },
  { tipo: "lim-racionalizar", subtema: "lim-racionalizar", nombre: "Racionalizar (raíces)", generar: genRacionalizar },
  { tipo: "lim-h", subtema: "lim-h", nombre: "Límites con h (antesala de la derivada)", generar: genH },
  { tipo: "lim-laterales", subtema: "lim-laterales", nombre: "k/0 y límites laterales", generar: genLaterales },
  { tipo: "lim-infinito", subtema: "lim-infinito", nombre: "Límites al infinito", generar: genInfinito },
];
