# Mate II Lab

App web interactiva para **entender** (no memorizar) Matemática II: una ruta intensiva de un día con explicaciones desde cero, visualizaciones manipulables y práctica guiada paso a paso con verificación automática.

## Qué incluye

- **Ruta del día** (`/`): bloques con temporizador, barra de progreso y botón de "siguiente paso".
- **Módulos** (`/modulo/limites`, `/modulo/asintotas`), cada uno con el ciclo: explicación (A y B, otro enfoque si fallas el check) → intuición (visualización + predicciones) → práctica guiada → 3 ejercicios sin pistas → check de 3 preguntas → explícalo tú.
- **Motor de pasos**: escribes cada renglón con MathLive. La app verifica que sea **equivalente** (evaluación numérica en varios puntos) y que **avances** (que esté factorizado, que ya no dé 0/0, que la raíz salga del numerador), y reconoce **errores típicos**: cancelar términos, signos al factorizar, olvidar el cuadrado en el conjugado, confundir hueco con asíntota.
- **Generadores con semilla**, al estilo de los laboratorios de la docente: factorizar, cubos, racionalizar, límites con *h*, k/0 y laterales, al infinito, y asíntotas (vertical, hueco, horizontal y oblicua por división).
- **Hoja de fórmulas** con buscador (`/formulas`) y **progreso** con mapa de dominio y lista para "repasar antes de dormir" (`/progreso`).
- **API**: `GET /api/ejercicios/:tipo?semilla=&dificultad=` devuelve un ejercicio en JSON. Es la base para el futuro tutor con IA.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript estricto · Tailwind v4 · MDX con remark-math y rehype-katex · KaTeX · MathLive · compute-engine (solo para el parseo) · Mafs · Zustand con persist (localStorage) · motion · Vitest.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # generadores y motor (cientos de semillas por generador)
npm run build
```

## Estructura

```
src/
  app/          rutas (ruta del día, módulos, fórmulas, progreso, API)
  content/      explicaciones MDX (A/B) y datos de cada módulo
  domain/       tipos: Módulo → Generador → Ejercicio → Paso → ErrorTipico
  generators/   generadores puros con semilla
  lib/engine/   verificación de pasos
  lib/math/     polinomios y evaluador de MathJSON
  components/   StepRunner, visualizaciones (Mafs), UI
  store/        progreso local
  tests/        Vitest
```
