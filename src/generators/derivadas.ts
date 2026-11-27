import type { Dificultad, Ejercicio, Generador, Paso, PasoOpcion } from "@/domain/types";
import { add, derive, evalPoly, mul, polyTex, sub, trim, type Poly } from "@/lib/math/poly";
import { crearRng, frac, type Rng } from "./rng";

const p = (t: string) => `\\left(${t}\\right)`;

/** Polinomio aleatorio de grado g con coeficiente principal ≠ 0. */
function polyAleatorio(r: Rng, g: number, rango = 4): Poly {
  return trim(Array.from({ length: g + 1 }, (_, i) => (i === g ? r.intEx(-rango, rango, [0]) : r.int(-rango, rango))));
}

function pasoDerivar(id: string, nombre: string, f: Poly, porQue: string): Paso {
  const d = derive(f);
  const potenciaMal = trim(f.map((c, i) => (i === 0 ? 0 : c * i)).slice(0)); // n·c·x^n (sin bajar exponente)
  return {
    id,
    tipo: "expr",
    instruccion: `Deriva $${nombre}(x) = ${polyTex(f)}$ (reglas de potencia, constante y suma). Escribe $${nombre}'(x)$.`,
    prefijo: `${nombre}'(x) =`,
    esperado: polyTex(d),
    variable: "x",
    rango: [-3, 3],
    pistas: [
      "Deriva término por término.",
      "Potencia: $(x^n)' = nx^{n-1}$ (baja el exponente y réstale uno). La derivada de una constante es 0.",
      `$${nombre}'(x) = ${polyTex(d)}$`,
    ],
    porQue,
    modelo: polyTex(d),
    errores: [
      { id: "no-baja-exponente", candidato: polyTex(potenciaMal), explicacion: "Multiplicaste por el exponente pero **no le restaste 1**: $(x^n)' = nx^{n-1}$, el exponente baja en uno." },
      ...(f[0] !== 0 ? [{ id: "constante", candidato: polyTex(add(d, [f[0]])), explicacion: "La derivada de una **constante** es 0: ese número desaparece." }] : []),
    ],
  };
}

// ─────────────────────────── Reglas básicas ───────────────────────────
function genReglas(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const f = polyAleatorio(r, dif + 1, 6);
  const d = derive(f);
  return {
    id: `der-reglas:${semilla}:${dif}`,
    tipo: "der-reglas",
    subtema: "der-reglas",
    enunciado: "Calcule la derivada usando las reglas básicas de derivación.",
    tex: `f(x)=${polyTex(f)}`,
    respuesta: `f'(x)=${polyTex(d)}`,
    funcion: polyTex(f),
    derivada: polyTex(d),
    pasos: [pasoDerivar("derivar", "f", f, "Cada término se deriva por separado (regla de la suma); el exponente baja multiplicando y disminuye en uno.")],
  };
}

// ─────────────────────────── Definición (límite) ───────────────────────────
function genDefinicion(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const A = r.intEx(-3, 3, [0]);
  const B = r.int(-5, 5);
  const C = r.int(-5, 5);
  const a = r.intEx(-3, 3, [0]);
  const f: Poly = [C, B, A];
  const fa = evalPoly(f, a);
  const m = 2 * A * a + B;
  // f(a+h) − f(a) = (2Aa+B)h + A h²
  const L = "\\lim_{h\\to 0}";
  const tex = frac(`f(${a}+h)-f(${a})`, "h");
  const fah = polyTex([fa, m, A], "h"); // f(a+h) desarrollado
  const dif1 = polyTex([0, m, A], "h");
  void dif;
  return {
    id: `der-definicion:${semilla}`,
    tipo: "der-definicion",
    subtema: "der-definicion",
    enunciado: `Con la definición de derivada, calcule la pendiente de la recta tangente a $f(x)=${polyTex(f)}$ en $x=${a}$.`,
    tex: `f'(${a}) = ${L} ${tex}`,
    respuesta: `f'(${a}) = ${m}`,
    pasos: [
      {
        id: "fah",
        tipo: "expr",
        instruccion: `Calcula y **desarrolla** $f(${a}+h)$: sustituye $x$ por $(${a}+h)$ en $f(x)=${polyTex(f)}$.`,
        prefijo: `f(${a}+h) =`,
        esperado: fah,
        variable: "h",
        rango: [-3, 3],
        pistas: ["Donde haya $x$, escribe $(" + a + "+h)$.", "$(a+h)^2 = a^2+2ah+h^2$.", `$f(${a}+h) = ${fah}$`],
        porQue: "La definición compara la función en dos puntos muy cercanos: $a$ y $a+h$.",
        modelo: fah,
        errores: [{ id: "binomio", candidato: polyTex([fa, B, A], "h"), explicacion: "$(a+h)^2 \\neq a^2+h^2$: falta el término $2ah$." }],
      },
      {
        id: "resta",
        tipo: "expr",
        instruccion: `Resta $f(${a}) = ${fa}$ y escribe el cociente $\\frac{f(${a}+h)-f(${a})}{h}$ con $h$ **factorizada** arriba.`,
        prefijo: L,
        esperado: frac(dif1, "h"),
        variable: "h",
        forma: ["producto"],
        evitar: [0],
        rango: [-3, 3],
        pistas: ["Al restar $f(a)$ se cancelan los términos sin $h$.", "Todo lo que queda arriba tiene $h$: sácala de factor común.", `$${frac(`h(${m}${A >= 0 ? "+" : ""}${A}h)`, "h")}$`],
        porQue: "Siempre se cancelan los términos sin $h$: por eso aparece el $\\frac{0}{0}$ y por eso se puede factorizar $h$.",
        modelo: frac(`h(${m}${A >= 0 ? "+" : ""}${A}h)`, "h"),
        errores: [],
      },
      {
        id: "simplificar",
        tipo: "expr",
        instruccion: "Cancela $h$.",
        prefijo: L,
        esperado: polyTex([m, A], "h"),
        variable: "h",
        forma: ["finitoEnA"],
        a: 0,
        rango: [-3, 3],
        pistas: ["¿Qué factor está arriba y abajo?", "Cancela la $h$.", `Queda $${polyTex([m, A], "h")}$.`],
        porQue: "$h\\to0$ pero $h\\neq0$.",
        modelo: polyTex([m, A], "h"),
        errores: [],
      },
      {
        id: "valor",
        tipo: "valor",
        instruccion: "Evalúa en $h=0$: esa es la **pendiente de la tangente**.",
        prefijo: `f'(${a}) =`,
        esperado: String(m),
        pistas: ["Los términos con $h$ desaparecen.", `Queda el número que no tiene $h$.`, `$f'(${a}) = ${m}$`],
        porQue: `Comprueba con las reglas: $f'(x) = ${polyTex(derive(f))}$, y en $x=${a}$ da $${m}$. ¡La definición y las reglas coinciden!`,
        modelo: `\\boxed{${m}}`,
        errores: m !== 0 ? [{ id: "cero", candidato: "0", explicacion: "Evalúa la expresión **ya simplificada**: solo se anulan los términos con $h$." }] : [],
      },
    ],
  };
}

// ─────────────────────────── Producto ───────────────────────────
function genProducto(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const f = polyAleatorio(r, dif === 1 ? 1 : 2);
  const g = polyAleatorio(r, dif === 3 ? 3 : 2);
  const fd = derive(f);
  const gd = derive(g);
  const res = add(mul(fd, g), mul(f, gd));
  const regla = `${p(polyTex(fd))}${p(polyTex(g))}+${p(polyTex(f))}${p(polyTex(gd))}`;
  return {
    id: `der-producto:${semilla}:${dif}`,
    tipo: "der-producto",
    subtema: "der-producto",
    enunciado: `Dadas $f(x)=${polyTex(f)}$ y $g(x)=${polyTex(g)}$, calcule $[f(x)\\cdot g(x)]'$. Desarrolle y agrupe términos semejantes.`,
    tex: `[f(x)\\cdot g(x)]' \\quad f(x)=${polyTex(f)},\\ g(x)=${polyTex(g)}`,
    respuesta: `${polyTex(res)},\\ x\\in\\mathbb{R}`,
    funcion: `${p(polyTex(f))}${p(polyTex(g))}`,
    derivada: polyTex(res),
    pasos: [
      pasoDerivar("fd", "f", f, "Primero se derivan las funciones por separado, como en el repaso de la docente."),
      pasoDerivar("gd", "g", g, "Ya tienes los cuatro ingredientes: $f, f', g, g'$."),
      {
        id: "regla",
        tipo: "expr",
        instruccion: "Aplica la **regla del producto** $(fg)' = f'g + fg'$ (sustituye, sin desarrollar todavía).",
        prefijo: "[f\\cdot g]' =",
        esperado: regla,
        variable: "x",
        rango: [-3, 3],
        pistas: ["Son dos sumandos: en cada uno se deriva **solo una** de las funciones.", "$(f')(g) + (f)(g')$", `$${regla}$`],
        porQue: "Si dos cosas cambian a la vez, el cambio total es «lo que cambia la primera por la segunda» más «la primera por lo que cambia la segunda».",
        modelo: regla,
        errores: [{ id: "producto-de-derivadas", candidato: `${p(polyTex(fd))}${p(polyTex(gd))}`, explicacion: "$(fg)' \\neq f'\\cdot g'$. La derivada de un producto **no** es el producto de las derivadas: usa $f'g + fg'$." }],
      },
      {
        id: "desarrollar",
        tipo: "expr",
        instruccion: "**Desarrolla y agrupa** términos semejantes (escribe el polinomio final, ordenado).",
        prefijo: "[f\\cdot g]' =",
        esperado: polyTex(res),
        variable: "x",
        forma: ["expandido"],
        rango: [-3, 3],
        pistas: ["Multiplica cada paréntesis (distributiva) y luego suma los términos con la misma potencia.", "Ordena de mayor a menor exponente.", `$${polyTex(res)}$`],
        porQue: "Así lo pide la docente: resultado desarrollado, agrupado y con dominio $x\\in\\mathbb{R}$ (los polinomios están definidos para todo real).",
        modelo: polyTex(res),
        errores: [],
      },
    ],
  };
}

// ─────────────────────────── Cociente ───────────────────────────
function genCociente(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const h = polyAleatorio(r, dif === 1 ? 1 : 2);
  let g: Poly;
  do g = polyAleatorio(r, dif === 3 ? 2 : 1);
  while (g.length < 2 || sub(mul(derive(h), g), mul(h, derive(g))).every((c) => c === 0));
  const hd = derive(h);
  const gd = derive(g);
  const num = sub(mul(hd, g), mul(h, gd));
  const den = `${p(polyTex(g))}^2`;
  const regla = frac(`${p(polyTex(hd))}${p(polyTex(g))}-${p(polyTex(h))}${p(polyTex(gd))}`, den);
  const signoMal = frac(`${p(polyTex(h))}${p(polyTex(gd))}-${p(polyTex(hd))}${p(polyTex(g))}`, den);
  const sinCuadrado = frac(`${p(polyTex(hd))}${p(polyTex(g))}-${p(polyTex(h))}${p(polyTex(gd))}`, p(polyTex(g)));
  const final = frac(polyTex(num), den);
  // ceros de g para no evaluar ahí
  const evitar = g.length === 2 ? [-g[0] / g[1]] : [];
  return {
    id: `der-cociente:${semilla}:${dif}`,
    tipo: "der-cociente",
    subtema: "der-cociente",
    enunciado: `Dadas $h(x)=${polyTex(h)}$ y $g(x)=${polyTex(g)}$, calcule $\\left[\\frac{h(x)}{g(x)}\\right]'$. Desarrolle el numerador.`,
    tex: `\\left[\\frac{h(x)}{g(x)}\\right]' \\quad h(x)=${polyTex(h)},\\ g(x)=${polyTex(g)}`,
    respuesta: final,
    funcion: frac(polyTex(h), polyTex(g)),
    derivada: final,
    pasos: [
      pasoDerivar("hd", "h", h, "Primero los ingredientes: $h'$ y $g'$."),
      pasoDerivar("gd", "g", g, "Ya tienes $h, h', g, g'$."),
      {
        id: "regla",
        tipo: "expr",
        instruccion: "Aplica la **regla del cociente** $\\left(\\frac{h}{g}\\right)' = \\frac{h'g - hg'}{g^2}$ (sin desarrollar todavía).",
        prefijo: "\\left[\\frac{h}{g}\\right]' =",
        esperado: regla,
        variable: "x",
        evitar,
        rango: [-3, 3],
        pistas: ["Arriba va una **resta** y empieza con la derivada de **arriba**.", "«Derivada de arriba por abajo, MENOS arriba por derivada de abajo, sobre abajo al cuadrado».", `$${regla}$`],
        porQue: "El orden importa porque es una resta: si lo inviertes, el resultado cambia de signo.",
        modelo: regla,
        errores: [
          { id: "signo-cociente", candidato: signoMal, explicacion: "Invertiste el orden de la resta: es $h'g - hg'$ (primero la derivada de **arriba**). Con el orden al revés sale el signo contrario." },
          { id: "sin-cuadrado", candidato: sinCuadrado, explicacion: "El denominador va **al cuadrado**: $g^2$." },
        ],
      },
      {
        id: "desarrollar",
        tipo: "expr",
        instruccion: "**Desarrolla y agrupa el numerador**; deja el denominador como $(g)^2$.",
        prefijo: "\\left[\\frac{h}{g}\\right]' =",
        esperado: final,
        variable: "x",
        forma: ["numeradorExpandido"],
        evitar,
        rango: [-3, 3],
        pistas: ["Desarrolla cada producto del numerador; cuidado con el **menos** que afecta a todo el segundo producto.", "Usa paréntesis: $-(\\ldots)$ cambia el signo de cada término.", `$${final}$`],
        porQue: "El error más común es olvidar que el menos afecta a **todos** los términos del segundo producto.",
        modelo: final,
        errores: [],
      },
    ],
  };
}

// ─────────────────────────── Cadena ───────────────────────────
function genCadena(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  const raiz = dif === 3 && r.next() < 0.5;
  const u: Poly = dif === 1 ? [r.int(-5, 5), r.intEx(-4, 4, [0, 1])] : [r.int(1, 6), 0, r.int(1, 3)];
  const ud = derive(u);
  const n = r.int(2, 5);
  const uT = polyTex(u);
  const udT = polyTex(ud);
  const f = raiz ? `\\sqrt{${uT}}` : `${p(uT)}^{${n}}`;
  const d = raiz ? frac(udT, `2\\sqrt{${uT}}`) : `${n}${p(uT)}^{${n - 1}}${p(udT)}`;
  const sinInterna = raiz ? frac("1", `2\\sqrt{${uT}}`) : `${n}${p(uT)}^{${n - 1}}`;
  const sinBajar = `${n}${p(uT)}^{${n}}${p(udT)}`;
  const rango: [number, number] = raiz ? [-3, 3] : [-3, 3];
  const pasoU: Paso = {
    id: "interna",
    tipo: "expr",
    instruccion: `Identifica la función **de adentro** $u = ${uT}$ y escribe su derivada $u'$.`,
    prefijo: "u' =",
    esperado: udT,
    variable: "x",
    rango,
    pistas: ["La de adentro es lo que está dentro del paréntesis (o de la raíz).", `Deriva $${uT}$.`, `$u' = ${udT}$`],
    porQue: "La cadena multiplica dos velocidades: la de la función de afuera y la de la de adentro.",
    modelo: udT,
    errores: [],
  };
  const pasoTipo: PasoOpcion = {
    id: "afuera",
    tipo: "opcion",
    instruccion: "¿Cuál es la función **de afuera**?",
    opciones: [
      { id: "pot", texto: "Una potencia $u^n$" },
      { id: "raiz", texto: "Una raíz $\\sqrt{u}$" },
      { id: "poli", texto: "No hay función de afuera" },
    ],
    correcta: raiz ? "raiz" : "pot",
    explicaciones: { poli: "Sí la hay: algo está envolviendo al paréntesis.", pot: "Mira bien: es una raíz.", raiz: "Mira bien: es una potencia." },
    pistas: ["¿Qué envuelve al paréntesis?", "Lo último que harías al calcular con una calculadora.", raiz ? "Raíz." : `Potencia ${n}.`],
    porQue: raiz ? "$\\sqrt{u} = u^{1/2}$, su derivada es $\\frac{1}{2\\sqrt{u}}$." : `La derivada de $u^${n}$ respecto de $u$ es $${n}u^${n - 1}$.`,
    modelo: raiz ? "\\text{afuera: } \\sqrt{u}" : `\\text{afuera: } u^{${n}}`,
  };
  return {
    id: `der-cadena:${semilla}:${dif}`,
    tipo: "der-cadena",
    subtema: "der-cadena",
    enunciado: "Calcule la derivada aplicando la regla de la cadena.",
    tex: `f(x) = ${f}`,
    respuesta: `f'(x)=${d}`,
    funcion: f,
    derivada: d,
    pasos: [
      pasoTipo,
      pasoU,
      {
        id: "cadena",
        tipo: "expr",
        instruccion: "Aplica la **cadena**: deriva la de afuera (dejando la de adentro igual) y **multiplica por $u'$**.",
        prefijo: "f'(x) =",
        esperado: d,
        variable: "x",
        rango,
        pistas: [
          "$[f(u)]' = f'(u)\\cdot u'$",
          raiz ? "$(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}$" : `Baja el ${n}, el exponente queda ${n - 1}, y multiplica por $u'$.`,
          `$f'(x) = ${d}$`,
        ],
        porQue: "Si $u$ cambia $u'$ veces más rápido que $x$, y $f$ cambia $f'(u)$ veces más rápido que $u$, entonces $f$ cambia $f'(u)\\cdot u'$ veces más rápido que $x$.",
        modelo: d,
        errores: [
          { id: "sin-interna", candidato: sinInterna, explicacion: `Olvidaste multiplicar por la **derivada interna** $u' = ${udT}$. Es el error más común de la regla de la cadena.` },
          ...(raiz ? [] : [{ id: "no-baja", candidato: sinBajar, explicacion: `Bajaste el ${n} pero el exponente debe quedar en ${n - 1}.` }]),
        ],
      },
    ],
  };
}

export const generadoresDerivadas: Generador[] = [
  { tipo: "der-definicion", subtema: "der-definicion", nombre: "Definición (límite con h)", generar: genDefinicion },
  { tipo: "der-reglas", subtema: "der-reglas", nombre: "Reglas básicas", generar: genReglas },
  { tipo: "der-producto", subtema: "der-producto", nombre: "Producto", generar: genProducto },
  { tipo: "der-cociente", subtema: "der-cociente", nombre: "Cociente", generar: genCociente },
  { tipo: "der-cadena", subtema: "der-cadena", nombre: "Cadena", generar: genCadena },
];


