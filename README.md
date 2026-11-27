# Entiende

Plataforma para **entender** (no memorizar) cursos de matemática. El primer curso es **Matemática II** (USPG, 2do semestre 2026): una ruta intensiva de un día para el examen final, con explicaciones desde cero, visualizaciones manipulables y práctica guiada paso a paso con verificación automática.

Producción: https://entiende.kaled.dev

## Qué incluye

- **Ruta del día** (`/`): bloques con temporizador, progreso del día, botón de "siguiente paso" y modo comprimido.
- **Módulos**: Límites, Asíntotas, Derivadas y Repaso relámpago. Cada uno sigue el ciclo explicación (A y B; si fallas el check te muestra otro enfoque) → intuición (visualización + predicciones) → práctica guiada → 3 ejercicios sin pistas → check → explícalo tú.
- **Motor de pasos**: escribes cada renglón con MathLive y la app comprueba tres cosas:
  - que el renglón sea **equivalente** al anterior (lo evalúa numéricamente);
  - que **avances**: que esté factorizado, que ya no dé 0/0, que la raíz haya salido del numerador, que esté desarrollado;
  - que no sea un **error típico**: cancelar términos, signos al factorizar, el conjugado, un hueco tomado por asíntota, (fg)' = f'g', el signo en el cociente, la derivada interna en la cadena.
- **Generadores con semilla** al estilo de la docente: límites (factorizar, cubos, racionalizar, con h, laterales, al infinito), asíntotas, derivadas (definición, reglas, producto, cociente, cadena) y repaso (máximos y mínimos, recta, parábola, ángulos).
- **Simulacro** de 1 hora con reporte de los 3 puntos débiles y un mini-repaso de cada uno, y **hoja resumen** imprimible.
- **Hoja de fórmulas** con buscador, **progreso** con mapa de dominio y lista para "repasar antes de dormir".
- **API**: `GET /api/ejercicios/:tipo?semilla=&dificultad=` (base para el futuro tutor con IA).

## Stack

Next.js 16 (App Router) · TypeScript estricto · Tailwind v4 · shadcn/ui (Sidebar, Card, Tabs, Badge, Progress…) · lucide · MDX con remark-gfm, remark-math y rehype-katex · KaTeX · MathLive · compute-engine (para parsear) · Mafs · Zustand con persist · motion · Vitest.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # generadores, motor y derivadas por diferencias finitas
npm run build
```
