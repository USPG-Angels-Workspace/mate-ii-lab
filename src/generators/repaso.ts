import type { Dificultad, Ejercicio, Generador, Paso } from "@/domain/types";
import { derive, evalPoly, numTex, polyTex, toFraction, type Poly } from "@/lib/math/poly";
import { crearRng } from "./rng";

const valor = (id: string, instruccion: string, prefijo: string, esperado: string, pistas: [string, string, string], porQue: string, errores: { id: string; candidato: string; explicacion: string }[] = []): Paso => ({
  id,
  tipo: "valor",
  instruccion,
  prefijo,
  esperado,
  pistas,
  porQue,
  modelo: `\\boxed{${esperado}}`,
  errores,
});

// ─────────────────────────── Máximos y mínimos ───────────────────────────
function genMaxMin(semilla: number, dif: Dificultad): Ejercicio {
  const r = crearRng(semilla);
  // f'(x) = 3(x-p)(x-q) con p+q par → f(x) = x³ − (3/2)(p+q)x² + 3pq·x + d
  let pp: number, q: number;
  do {
    pp = r.int(-3, 3);
    q = r.int(-3, 3);
  } while (pp >= q || (pp + q) % 2 !== 0);
  const d = r.int(-4, 4);
  const f: Poly = [d, 3 * pp * q, (-3 * (pp + q)) / 2, 1];
  const fd = derive(f);
  void dif;
  return {
    id: `rep-maxmin:${semilla}`,
    tipo: "rep-maxmin",
    subtema: "rep-maxmin",
    enunciado: `Encuentre los puntos críticos de $f(x)=${polyTex(f)}$ y clasifíquelos (máximo o mínimo relativo).`,
    tex: `f(x)=${polyTex(f)}`,
    respuesta: `\\text{máx. en } x=${pp},\\ \\text{mín. en } x=${q}`,
    funcion: polyTex(f),
    derivada: polyTex(fd),
    pasos: [
      {
        id: "derivada",
        tipo: "expr",
        instruccion: "Deriva $f(x)$.",
        prefijo: "f'(x) =",
        esperado: polyTex(fd),
        variable: "x",
        rango: [-3, 3],
        pistas: ["Regla de la potencia término por término.", "$(x^3)'=3x^2$, $(x^2)'=2x$.", `$f'(x) = ${polyTex(fd)}$`],
        porQue: "Los máximos y mínimos están donde la pendiente (la derivada) vale cero: la curva deja de subir o de bajar.",
        modelo: polyTex(fd),
        errores: [],
      },
      {
        id: "criticos",
        tipo: "ecuaciones",
        clase: "vertical",
        instruccion: "Iguala $f'(x)=0$ y resuelve. Escribe cada **punto crítico** como $x = c$.",
        esperado: [`x=${pp}`, `x=${q}`],
        pistas: ["Saca factor común 3.", `$3(x^2 ${-(pp + q) >= 0 ? "+" : "-"} ${Math.abs(pp + q)}x ${pp * q >= 0 ? "+" : "-"} ${Math.abs(pp * q)}) = 0$, factoriza el trinomio.`, `$x=${pp}$ y $x=${q}$.`],
        porQue: "En esos valores la recta tangente es horizontal.",
        modelo: `x=${pp},\\quad x=${q}`,
        errores: [],
      },
      {
        id: "clasificar",
        tipo: "opcion",
        instruccion: `En $x=${pp}$ (el menor), ¿qué hay? Pista: mira el signo de $f'$ antes y después, o usa $f''(x)=${polyTex(derive(fd))}$.`,
        opciones: [
          { id: "max", texto: "Máximo relativo" },
          { id: "min", texto: "Mínimo relativo" },
        ],
        correcta: "max",
        explicaciones: { min: `Calcula $f''(${pp}) = ${evalPoly(derive(fd), pp)}$: si es **negativa** la curva está «boca abajo» → máximo.` },
        pistas: ["Criterio de la 2.ª derivada: $f''<0$ → máximo, $f''>0$ → mínimo.", `$f''(${pp}) = ${evalPoly(derive(fd), pp)}$.`, "Es un máximo."],
        porQue: `Antes de $x=${pp}$ la función sube ($f'>0$) y después baja ($f'<0$): es la cima de una colina. En $x=${q}$ pasa lo contrario: mínimo.`,
        modelo: `x=${pp}: \\text{máximo},\\quad x=${q}: \\text{mínimo}`,
      },
      valor("fmax", `¿Cuánto vale el **máximo**? Calcula $f(${pp})$.`, `f(${pp}) =`, String(evalPoly(f, pp)), ["Sustituye en $f$ (no en $f'$).", `$f(${pp}) = ${polyTex(f).replace(/x/g, `(${pp})`)}$`, `$= ${evalPoly(f, pp)}$`], "El valor del máximo se calcula en la función original.", evalPoly(f, pp) === 0 ? [] : [
        { id: "en-derivada", candidato: "0", explicacion: "Sustituiste en $f'$ (que vale 0 ahí por definición). El valor del máximo se calcula en $f$." },
      ]),
    ],
  };
}

// ─────────────────────────── Recta entre dos puntos ───────────────────────────
function genRecta(semilla: number): Ejercicio {
  const r = crearRng(semilla);
  let x1: number, y1: number, x2: number, y2: number;
  do {
    x1 = r.int(-6, 6);
    y1 = r.int(-6, 6);
    x2 = r.int(-6, 8);
    y2 = r.int(-6, 8);
  } while (x1 === x2 || y1 === y2);
  const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  const dist = Number.isInteger(Math.sqrt(d2)) ? String(Math.sqrt(d2)) : `\\sqrt{${d2}}`;
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - m * x1;
  const xInt = -b / m;
  return {
    id: `rep-recta:${semilla}`,
    tipo: "rep-recta",
    subtema: "rep-recta",
    enunciado: `Dados los puntos $F=(${x1},${y1})$ y $H=(${x2},${y2})$, calcule distancia, punto medio, pendiente, ecuación de la recta y el cero en $x$.`,
    tex: `F=(${x1},${y1}),\\quad H=(${x2},${y2})`,
    respuesta: `d=${dist},\\ m=${numTex(m)},\\ y=${polyTex([b, m])}`,
    pasos: [
      valor("dist", "**Distancia** entre $F$ y $H$ (puedes dejar la raíz).", "d =", dist, ["$d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$", `$(${x2}-(${x1}))^2+(${y2}-(${y1}))^2 = ${d2}$`, `$d=${dist}$`], "Es el teorema de Pitágoras: las diferencias en x y en y son los catetos.", [
        { id: "sin-raiz", candidato: String(d2), explicacion: "Falta sacar la **raíz cuadrada**." },
      ]),
      valor("pmx", "**Punto medio**: coordenada $x$.", "x_M =", numTex((x1 + x2) / 2), ["Promedio de las x.", `$\\frac{${x1}+${x2}}{2}$`, `$${numTex((x1 + x2) / 2)}$`], "El punto medio es el promedio de las coordenadas."),
      valor("pmy", "**Punto medio**: coordenada $y$.", "y_M =", numTex((y1 + y2) / 2), ["Promedio de las y.", `$\\frac{${y1}+${y2}}{2}$`, `$${numTex((y1 + y2) / 2)}$`], "Mismo procedimiento con las y."),
      valor("m", "**Pendiente**.", "m =", numTex(m), ["$m = \\frac{y_2-y_1}{x_2-x_1}$ (cambio en y sobre cambio en x).", `$\\frac{${y2}-(${y1})}{${x2}-(${x1})}$`, `$m=${numTex(m)}$`], "La pendiente dice cuánto sube la recta por cada unidad que avanza.", Math.abs(m) === 1 ? [] : [
        { id: "invertida", candidato: numTex(1 / m), explicacion: "La pusiste al revés: es **y** sobre **x** (subida sobre avance)." },
      ]),
      {
        id: "recta",
        tipo: "ecuaciones",
        clase: "oblicua",
        instruccion: "**Ecuación de la recta** en forma $y = mx + b$.",
        esperado: [`y=${polyTex([b, m])}`],
        pistas: ["Punto-pendiente: $y - y_1 = m(x - x_1)$.", `$y-(${y1}) = ${numTex(m)}(x-(${x1}))$, despeja $y$.`, `$y=${polyTex([b, m])}$`],
        porQue: "Con un punto y la pendiente la recta queda determinada.",
        modelo: `y=${polyTex([b, m])}`,
        errores: [],
      },
      valor("cerox", "**Cero en x** (donde la recta corta el eje x, $y=0$).", "x =", numTex(xInt), ["Haz $y=0$ en la ecuación.", `$0 = ${polyTex([b, m])}$, despeja x.`, `$x=${numTex(xInt)}$`], `El cero en y es $b=${numTex(b)}$ (con $x=0$).`),
    ],
  };
}

// ─────────────────────────── Parábola ───────────────────────────
function genParabola(semilla: number): Ejercicio {
  const r = crearRng(semilla);
  const h = r.int(-4, 4);
  const k = r.int(-4, 4);
  const cuatroP = r.pick([4, 8, 12, 16, -4, -8, -12]);
  const pp = cuatroP / 4;
  const xh = h === 0 ? "x^2" : `(x${h > 0 ? "-" : "+"}${Math.abs(h)})^2`;
  const yk = k === 0 ? "y" : `(y${k > 0 ? "-" : "+"}${Math.abs(k)})`;
  return {
    id: `rep-parabola:${semilla}`,
    tipo: "rep-parabola",
    subtema: "rep-parabola",
    enunciado: `Dada la parábola $${xh} = ${cuatroP}${yk}$, calcule vértice, foco, directriz y lado recto.`,
    tex: `${xh} = ${cuatroP}${yk}`,
    respuesta: `V(${h},${k}),\\ F(${h},${k + pp}),\\ y=${k - pp},\\ LR=${Math.abs(cuatroP)}`,
    pasos: [
      valor("vx", "**Vértice**: coordenada $h$ (la $x$ del vértice).", "h =", String(h), ["Forma $(x-h)^2 = 4p(y-k)$.", "Ojo con el signo: $(x+2)$ significa $h=-2$.", `$h=${h}$`], "El vértice es el punto donde la parábola da la vuelta.", h !== 0 ? [{ id: "signo-h", candidato: String(-h), explicacion: "Signo contrario: en $(x-h)$, si ves $(x+2)$ entonces $h=-2$." }] : []),
      valor("vy", "**Vértice**: coordenada $k$.", "k =", String(k), ["Lo que se resta a $y$.", "Mismo cuidado con el signo.", `$k=${k}$`], "Vértice $V(h,k)$.", k !== 0 ? [{ id: "signo-k", candidato: String(-k), explicacion: "Signo contrario: $(y+3)$ significa $k=-3$." }] : []),
      valor("p", "Calcula $p$ (de $4p = $ el número que multiplica).", "p =", numTex(pp), [`$4p=${cuatroP}$`, "Divide entre 4.", `$p=${numTex(pp)}$`], pp > 0 ? "Como $p>0$ abre hacia **arriba**." : "Como $p<0$ abre hacia **abajo**.", [{ id: "4p", candidato: String(cuatroP), explicacion: `Ese es $4p$; $p$ es la cuarta parte: $${cuatroP}\\div 4$.` }]),
      valor("fy", `**Foco** $F(h, k+p)$: escribe la coordenada $y$ del foco (la $x$ es ${h}).`, "y_F =", String(k + pp), ["El foco está **dentro** de la parábola, a distancia $p$ del vértice.", "$k + p$", `$${k + pp}$`], "El foco está sobre el eje de simetría."),
      {
        id: "directriz",
        tipo: "ecuaciones",
        clase: "horizontal",
        instruccion: "**Directriz** (recta horizontal $y = k - p$).",
        esperado: [`y=${k - pp}`],
        pistas: ["Está **fuera**, al otro lado del vértice, a distancia $p$.", "$y = k - p$", `$y=${k - pp}$`],
        porQue: "Cada punto de la parábola está a la misma distancia del foco y de la directriz.",
        modelo: `y=${k - pp}`,
        errores: [{ id: "directriz-foco", candidato: `y=${k + pp}`, explicacion: "Esa es la altura del **foco**. La directriz va del otro lado: $y=k-p$." }],
      },
      valor("lr", "**Lado recto** (longitud).", "LR =", String(Math.abs(cuatroP)), ["$LR = |4p|$", "Es el ancho de la parábola a la altura del foco.", `$${Math.abs(cuatroP)}$`], "Sirve para dibujar: desde el foco, $2|p|$ a cada lado."),
    ],
  };
}

// ─────────────────────────── Ángulos ───────────────────────────
function genAngulos(semilla: number): Ejercicio {
  const r = crearRng(semilla);
  let t = r.int(10, 350);
  if (t % 90 === 0) t += 7;
  const ref = t <= 90 ? t : t <= 180 ? 180 - t : t <= 270 ? t - 180 : 360 - t;
  const cuad = t < 90 ? "I" : t < 180 ? "II" : t < 270 ? "III" : "IV";
  const f = toFraction(t / 180, 400)!;
  const rad = `\\frac{${f[0] === 1 ? "" : f[0]}\\pi}{${f[1]}}`;
  return {
    id: `rep-angulos:${semilla}`,
    tipo: "rep-angulos",
    subtema: "rep-angulos",
    enunciado: `Para el ángulo $${t}^\\circ$: ángulo de referencia, coterminales y conversión a radianes.`,
    tex: `\\theta = ${t}^\\circ`,
    respuesta: `\\theta_R=${ref}^\\circ,\\ ${t + 360}^\\circ,\\ ${t - 360}^\\circ,\\ ${rad}`,
    pasos: [
      valor("ref", `**Ángulo de referencia** (está en el cuadrante ${cuad}). Escribe solo el número de grados.`, "\\theta_R =", String(ref), ["Es el ángulo agudo con el **eje x**.", "II: $180-\\theta$; III: $\\theta-180$; IV: $360-\\theta$.", `$${ref}$`], "Siempre está entre 0° y 90°, medido hasta el eje x."),
      valor("cotp", "**Coterminal positivo** (suma 360°).", "\\theta + 360 =", String(t + 360), ["Coterminales: terminan en el mismo lado.", "Suma 360.", `$${t + 360}$`], "Dar una vuelta completa no cambia dónde termina el ángulo."),
      valor("cotn", "**Coterminal negativo** (resta 360°).", "\\theta - 360 =", String(t - 360), ["Resta 360.", `$${t} - 360$`, `$${t - 360}$`], "Negativo = medido en sentido horario."),
      valor("rad", "**En radianes** (puedes usar $\\pi$).", "\\theta =", rad, ["Multiplica por $\\frac{\\pi}{180}$.", `$${t}\\cdot\\frac{\\pi}{180}$ y simplifica la fracción.`, `$${rad}$`], "$180^\\circ = \\pi$ radianes.", [{ id: "inverso", candidato: String((t * 180) / Math.PI), explicacion: "Multiplicaste por $\\frac{180}{\\pi}$; para pasar a radianes es $\\frac{\\pi}{180}$." }]),
    ],
  };
}

export const generadoresRepaso: Generador[] = [
  { tipo: "rep-maxmin", subtema: "rep-maxmin", nombre: "Máximos y mínimos", generar: genMaxMin },
  { tipo: "rep-recta", subtema: "rep-recta", nombre: "Recta entre dos puntos", generar: (s) => genRecta(s) },
  { tipo: "rep-parabola", subtema: "rep-parabola", nombre: "Parábola", generar: (s) => genParabola(s) },
  { tipo: "rep-angulos", subtema: "rep-angulos", nombre: "Ángulos", generar: (s) => genAngulos(s) },
];
