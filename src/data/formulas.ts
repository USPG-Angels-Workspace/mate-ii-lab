export interface Formula {
  id: string;
  tema: "Límites" | "Asíntotas" | "Derivadas" | "Geometría";
  nombre: string;
  tex: string;
  /** Cómo se lee en palabras. */
  lectura: string;
  /** Visualización o módulo donde se practica. */
  href: string;
}

export const FORMULAS: Formula[] = [
  { id: "lim-def", tema: "Límites", nombre: "Idea de límite", tex: "\\lim_{x\\to a} f(x) = L", lectura: "Cuando x se acerca a a (sin llegar), f(x) se acerca a L.", href: "/modulo/limites" },
  { id: "lim-00", tema: "Límites", nombre: "Indeterminación 0/0", tex: "\\frac{0}{0} \\Rightarrow \\text{factorizar o racionalizar, simplificar, evaluar}", lectura: "Cero entre cero no es un número: hay un factor común escondido.", href: "/modulo/limites" },
  { id: "lim-k0", tema: "Límites", nombre: "k entre cero", tex: "\\frac{k}{0},\\ k\\ne0 \\Rightarrow \\pm\\infty \\text{ (revisar laterales)}", lectura: "Un número entre casi cero se dispara; el signo decide la dirección.", href: "/modulo/limites" },
  { id: "lim-lat", tema: "Límites", nombre: "Límites laterales", tex: "\\lim_{x\\to a} f \\text{ existe} \\iff \\lim_{x\\to a^-} f = \\lim_{x\\to a^+} f", lectura: "El límite existe solo si por la izquierda y por la derecha llega al mismo valor.", href: "/modulo/limites" },
  { id: "trinomio", tema: "Límites", nombre: "Factorizar trinomio", tex: "x^2+bx+c=(x+m)(x+n),\\ m\\cdot n=c,\\ m+n=b", lectura: "Busca dos números que multiplicados den c y sumados den b.", href: "/modulo/limites" },
  { id: "dif-cuad", tema: "Límites", nombre: "Diferencia de cuadrados", tex: "a^2-b^2=(a-b)(a+b)", lectura: "Un cuadrado menos otro es (resta)(suma). Es la base del conjugado.", href: "/modulo/limites" },
  { id: "cubos", tema: "Límites", nombre: "Suma y diferencia de cubos", tex: "a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2)", lectura: "Mismo signo en el binomio; en el trinomio el del medio cambia y el último siempre es +.", href: "/modulo/limites" },
  { id: "conjugado", tema: "Límites", nombre: "Conjugado", tex: "(\\sqrt{A}-b)(\\sqrt{A}+b)=A-b^2", lectura: "Raíz por raíz da lo de adentro; se elimina la raíz.", href: "/modulo/limites" },
  { id: "binomio", tema: "Límites", nombre: "Binomio al cuadrado y al cubo", tex: "(a+h)^2=a^2+2ah+h^2,\\quad (a+h)^3=a^3+3a^2h+3ah^2+h^3", lectura: "(a+h)² NO es a²+h²: falta el término del medio.", href: "/modulo/limites" },
  { id: "lim-inf", tema: "Límites", nombre: "Límite al infinito (racional)", tex: "\\lim_{x\\to\\infty}\\frac{a_nx^n+\\cdots}{b_mx^m+\\cdots}=\\begin{cases}0 & n<m\\\\ \\frac{a_n}{b_m} & n=m\\\\ \\pm\\infty & n>m\\end{cases}", lectura: "Lejos solo importan los términos de mayor grado.", href: "/modulo/limites" },
  { id: "av", tema: "Asíntotas", nombre: "Asíntota vertical", tex: "D(k)=0 \\text{ y } N(k)\\ne0 \\Rightarrow x=k", lectura: "Iguala el denominador a cero; si el numerador no se anula ahí, es asíntota vertical.", href: "/modulo/asintotas" },
  { id: "hueco", tema: "Asíntotas", nombre: "Hueco", tex: "D(k)=0 \\text{ y } N(k)=0 \\Rightarrow \\text{hueco en } x=k", lectura: "Si arriba también da cero, el factor se cancela: queda un punto vacío, no asíntota.", href: "/modulo/asintotas" },
  { id: "ah", tema: "Asíntotas", nombre: "Asíntota horizontal", tex: "n<m: y=0;\\quad n=m: y=\\tfrac{a_n}{b_m};\\quad n>m: \\text{no hay}", lectura: "Compara grados: abajo gana → 0; empate → cociente de coeficientes principales.", href: "/modulo/asintotas" },
  { id: "ao", tema: "Asíntotas", nombre: "Asíntota oblicua", tex: "n=m+1:\\ \\frac{N}{D}=q(x)+\\frac{r}{D} \\Rightarrow y=q(x)", lectura: "Si arriba gana por uno, divide: el cociente es la asíntota.", href: "/modulo/asintotas" },
  { id: "der-def", tema: "Derivadas", nombre: "Definición de derivada", tex: "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}", lectura: "Pendiente de la secante cuando el segundo punto se pega al primero.", href: "/modulo/limites" },
  { id: "der-const", tema: "Derivadas", nombre: "Constante", tex: "(c)'=0", lectura: "Lo que no cambia tiene razón de cambio cero.", href: "/formulas" },
  { id: "der-pot", tema: "Derivadas", nombre: "Potencia", tex: "(x^n)'=nx^{n-1}", lectura: "Baja el exponente a multiplicar y réstale uno.", href: "/formulas" },
  { id: "der-suma", tema: "Derivadas", nombre: "Suma o resta", tex: "(f\\pm g)'=f'\\pm g'", lectura: "Se deriva término a término.", href: "/formulas" },
  { id: "der-prod", tema: "Derivadas", nombre: "Producto", tex: "(f\\cdot g)'=f'g+fg'", lectura: "La derivada del primero por el segundo, más el primero por la derivada del segundo.", href: "/formulas" },
  { id: "der-coc", tema: "Derivadas", nombre: "Cociente", tex: "\\left(\\frac{f}{g}\\right)'=\\frac{f'g-fg'}{g^2}", lectura: "Derivada de arriba por abajo, MENOS arriba por derivada de abajo, todo sobre abajo al cuadrado.", href: "/formulas" },
  { id: "der-cad", tema: "Derivadas", nombre: "Regla de la cadena", tex: "[f(g(x))]'=f'(g(x))\\cdot g'(x)", lectura: "Deriva la de afuera (dejando la de adentro igual) y multiplica por la derivada de adentro.", href: "/formulas" },
  { id: "dist", tema: "Geometría", nombre: "Distancia", tex: "d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}", lectura: "Pitágoras entre dos puntos.", href: "/formulas" },
  { id: "pm", tema: "Geometría", nombre: "Punto medio", tex: "M=\\left(\\tfrac{x_1+x_2}{2},\\tfrac{y_1+y_2}{2}\\right)", lectura: "El promedio de las coordenadas.", href: "/formulas" },
  { id: "pend", tema: "Geometría", nombre: "Pendiente y recta", tex: "m=\\frac{y_2-y_1}{x_2-x_1},\\quad y-y_1=m(x-x_1)", lectura: "Cuánto sube por cada unidad que avanza; punto-pendiente.", href: "/formulas" },
  { id: "parab", tema: "Geometría", nombre: "Parábola vertical", tex: "(x-h)^2=4p(y-k):\\ V(h,k),\\ F(h,k+p),\\ y=k-p,\\ LR=|4p|", lectura: "Vértice, foco a p del vértice, directriz al otro lado, lado recto 4p.", href: "/formulas" },
];
