import { describe, expect, it } from "vitest";
import type { Dificultad, PasoEcuaciones, PasoExpr, PasoValor } from "@/domain/types";
import { GENERADORES } from "@/generators";
import { evaluate, parseTex } from "@/lib/math/expr";
import { mismosValores, verificarEcuaciones, verificarExpr, verificarValor } from "@/lib/engine/verificar";
import { analizar } from "@/generators/asintotas";

const SEMILLAS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);
const DIFS: Dificultad[] = [1, 2, 3];

/** Límite numérico de la expresión principal (\lim_{v\to a} f). */
function limiteNumerico(tex: string): number | "inf" | "-inf" | "noexiste" | null {
  const m = tex.match(/^\\lim_\{(\w)\\to (.+?)\} (.+)$/);
  if (!m) return null;
  const [, v, aTex, f] = m;
  const p = parseTex(f);
  if (!p) throw new Error(`No parsea: ${f}`);
  if (aTex === "\\infty") {
    const y = evaluate(p.json, { [v]: 1e7 });
    return Math.abs(y) > 1e4 ? (y > 0 ? "inf" : "-inf") : y;
  }
  const a = evaluate(parseTex(aTex)!.json, {});
  const izq = evaluate(p.json, { [v]: a - 1e-7 });
  const der = evaluate(p.json, { [v]: a + 1e-7 });
  const tipo = (y: number) => (Math.abs(y) > 1e5 ? (y > 0 ? "inf" : "-inf") : y);
  const ti = tipo(izq);
  const td = tipo(der);
  if (typeof ti === "number" && typeof td === "number") return Math.abs(ti - td) < 1e-4 ? (ti + td) / 2 : "noexiste";
  return ti === td ? ti : "noexiste";
}

for (const g of GENERADORES) {
  describe(`generador ${g.tipo}`, () => {
    it("es reproducible con la misma semilla", () => {
      expect(JSON.stringify(g.generar(42, 2))).toBe(JSON.stringify(g.generar(42, 2)));
    });

    it("produce ejercicios válidos y autoconsistentes", () => {
      for (const s of SEMILLAS)
        for (const d of DIFS) {
          const e = g.generar(s, d);
          const ctx = `${e.id} ${e.tex}`;
          expect(e.pasos.length, ctx).toBeGreaterThan(1);
          for (const paso of e.pasos) {
            if (paso.tipo === "expr") {
              // el renglón modelo debe pasar el verificador (equivalente + forma)
              const r = verificarExpr(paso.modelo, paso as PasoExpr);
              expect(r.estado, `${ctx} paso ${paso.id}: ${paso.modelo} → ${r.mensaje}`).toBe("correcto");
              // cada error típico debe distinguirse de la respuesta correcta
              for (const err of paso.errores) {
                const re = verificarExpr(err.candidato, paso as PasoExpr);
                expect(re.estado, `${ctx} error ${err.id} (${err.candidato})`).not.toBe("correcto");
              }
            }
            if (paso.tipo === "valor") {
              expect(verificarValor(paso.esperado, paso as PasoValor).estado, ctx).toBe("correcto");
              for (const err of paso.errores) expect(mismosValores(err.candidato, paso.esperado), `${ctx} ${err.id}`).toBe(false);
            }
            if (paso.tipo === "ecuaciones") {
              const pe = paso as PasoEcuaciones;
              expect(verificarEcuaciones(pe.esperado, pe).estado, `${ctx} ${pe.id}`).toBe("correcto");
              for (const err of pe.errores) expect(verificarEcuaciones([...pe.esperado, err.candidato], pe).estado, `${ctx} ${err.id}`).not.toBe("correcto");
            }
            if (paso.tipo === "opcion") expect(paso.opciones.map((o) => o.id), ctx).toContain(paso.correcta);
          }
          // la respuesta final coincide con el límite numérico
          if (e.tex.startsWith("\\lim")) {
            const num = limiteNumerico(e.tex);
            const final = e.pasos[e.pasos.length - 1];
            const esperado = final.tipo === "valor" ? final.esperado : final.tipo === "opcion" ? final.correcta : null;
            if (esperado && num !== null) {
              if (typeof num === "number") expect(mismosValores(esperado, String(num)) || Math.abs(evaluate(parseTex(esperado)!.json, {}) - num) < 1e-3, `${ctx}: ${esperado} vs ${num}`).toBe(true);
              else expect(esperado, ctx).toBe(num);
            }
          }
        }
    });
  });
}

describe("asíntotas: confirmación numérica", () => {
  it("cerca de cada A.V. |f| crece; lejos f se pega a la A.H./A.O.", () => {
    const g = GENERADORES.find((x) => x.tipo === "asintotas")!;
    for (const s of SEMILLAS)
      for (const d of DIFS) {
        const e = g.generar(s, d);
        const gr = e.grafica!;
        const f = parseTex(gr.f)!;
        const F = (x: number) => evaluate(f.json, { x });
        for (const v of gr.verticales ?? []) expect(Math.abs(F(v + 1e-6)), e.id).toBeGreaterThan(1e4);
        for (const h of gr.huecos ?? []) expect(Number.isFinite(h.y), e.id).toBe(true);
        const X = 1e6;
        if (gr.horizontal !== null && gr.horizontal !== undefined) expect(Math.abs(F(X) - gr.horizontal), e.id).toBeLessThan(1e-3);
        if (gr.oblicua) expect(Math.abs(F(X) - (gr.oblicua.m * X + gr.oblicua.b)), e.id).toBeLessThan(1e-3);
      }
  });

  it("ejercicios reales del Lab No. 1", () => {
    // 3) (x²−4)/(x−1): AV x=1, AO y=x+1
    const r3 = analizar({ num: [-4, 0, 1], den: [-1, 1], raicesDen: [1] });
    expect(r3.verticales).toEqual([1]);
    expect(r3.oblicua).toEqual({ m: 1, b: 1 });
    // 2) x²/(x²−4): AV x=±2, AH y=1
    const r2 = analizar({ num: [0, 0, 1], den: [-4, 0, 1], raicesDen: [2, -2] });
    expect(r2.verticales).toEqual([-2, 2]);
    expect(r2.horizontal).toBe(1);
  });
});
