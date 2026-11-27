import type { ModuloId, Subtema } from "@/domain/types";

/** Mini-repaso por subtema: la regla en una línea y el error que más se comete. */
export const REPASO_RAPIDO: Record<Subtema, { modulo: ModuloId; regla: string; error: string }> = {
  "lim-directa": { modulo: "limites", regla: "Si al sustituir no hay división entre cero, el límite es el valor sustituido.", error: "Complicarse factorizando cuando bastaba sustituir." },
  "lim-factorizar": { modulo: "limites", regla: "$\\frac{0}{0}$ → factoriza, cancela el factor común $(x-a)$ y evalúa.", error: "Cancelar **términos** (que suman) en vez de **factores** (que multiplican)." },
  "lim-racionalizar": { modulo: "limites", regla: "Con raíces: multiplica por el conjugado; $(\\sqrt{A}-b)(\\sqrt{A}+b)=A-b^2$.", error: "Olvidar elevar al cuadrado el número: es $A-b^2$, no $A-b$." },
  "lim-h": { modulo: "limites", regla: "Desarrolla $(a+h)^n$, cancela lo que no tiene $h$, factoriza $h$, cancela y evalúa en $h=0$.", error: "$(a+h)^2\\neq a^2+h^2$: falta $2ah$." },
  "lim-laterales": { modulo: "limites", regla: "$\\frac{k}{0}$ → mira el signo por izquierda y derecha; si difieren, **no existe**.", error: "Decir que $\\frac{k}{0}$ es 0 o no revisar los signos." },
  "lim-infinito": { modulo: "limites", regla: "Grado arriba menor → 0; iguales → cociente de coeficientes principales; mayor → $\\pm\\infty$.", error: "Usar el cociente de coeficientes cuando los grados no son iguales." },
  "asi-vertical": { modulo: "asintotas", regla: "Iguala el denominador a 0; es A.V. solo si el numerador **no** se anula ahí.", error: "Poner A.V. donde hay un **hueco** ($\\frac{0}{0}$)." },
  "asi-horizontal": { modulo: "asintotas", regla: "Compara grados: $n<m \\Rightarrow y=0$; $n=m \\Rightarrow y=\\frac{a_n}{b_m}$; $n>m$ no hay.", error: "Responder $y=0$ con grados iguales." },
  "asi-oblicua": { modulo: "asintotas", regla: "Si el grado de arriba es uno más: divide, la A.O. es el **cociente**.", error: "Dividir con el signo equivocado en la sintética (usa $c$ para $x-c$)." },
  "der-definicion": { modulo: "derivadas", regla: "$f'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}$: pendiente de la tangente.", error: "Desarrollar mal el binomio $(a+h)^2$." },
  "der-reglas": { modulo: "derivadas", regla: "$(x^n)'=nx^{n-1}$, $(c)'=0$, término por término.", error: "No restar 1 al exponente o dejar la constante." },
  "der-producto": { modulo: "derivadas", regla: "$(fg)'=f'g+fg'$; luego desarrolla, agrupa y escribe $x\\in\\mathbb{R}$.", error: "$(fg)'=f'g'$ (multiplicar las derivadas)." },
  "der-cociente": { modulo: "derivadas", regla: "$\\left(\\frac{f}{g}\\right)'=\\frac{f'g-fg'}{g^2}$.", error: "Invertir la resta u olvidar el $g^2$." },
  "der-cadena": { modulo: "derivadas", regla: "$[f(g(x))]'=f'(g(x))\\cdot g'(x)$.", error: "Olvidar multiplicar por la derivada de adentro." },
  "rep-maxmin": { modulo: "repaso", regla: "$f'(x)=0$ → puntos críticos; $f''<0$ máximo, $f''>0$ mínimo; el valor se calcula en $f$.", error: "Evaluar el máximo en $f'$ en vez de $f$." },
  "rep-recta": { modulo: "repaso", regla: "$m=\\frac{y_2-y_1}{x_2-x_1}$, $y-y_1=m(x-x_1)$, $d=\\sqrt{\\Delta x^2+\\Delta y^2}$.", error: "Poner la pendiente al revés ($x$ sobre $y$)." },
  "rep-parabola": { modulo: "repaso", regla: "$(x-h)^2=4p(y-k)$: $V(h,k)$, $F(h,k+p)$, directriz $y=k-p$, $LR=|4p|$.", error: "Signo del vértice: $(x+2)$ es $h=-2$." },
  "rep-angulos": { modulo: "repaso", regla: "Referencia: agudo con el eje x; coterminal $\\pm360^\\circ$; radianes $\\cdot\\frac{\\pi}{180}$.", error: "Medir la referencia contra el eje y." },
};
