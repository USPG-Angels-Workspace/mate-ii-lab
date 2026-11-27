import { GENERADORES, generadorPorTipo } from "@/generators";
import type { Dificultad } from "@/domain/types";

/**
 * GET /api/ejercicios/:tipo?semilla=123&dificultad=2
 * Devuelve un ejercicio generado (JSON). Base para el futuro tutor con IA,
 * que podrá pedir el mismo ejercicio por semilla para dar pistas socráticas.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/ejercicios/[tipo]">) {
  const { tipo } = await ctx.params;
  const g = generadorPorTipo(tipo);
  if (!g) return Response.json({ error: "Tipo desconocido", tipos: GENERADORES.map((x) => x.tipo) }, { status: 404 });
  const url = new URL(request.url);
  const semilla = Number(url.searchParams.get("semilla") ?? Math.floor(Math.random() * 1e6));
  const d = Number(url.searchParams.get("dificultad") ?? 1);
  const dificultad = ([1, 2, 3].includes(d) ? d : 1) as Dificultad;
  if (!Number.isFinite(semilla)) return Response.json({ error: "semilla inválida" }, { status: 400 });
  return Response.json(g.generar(semilla, dificultad));
}
