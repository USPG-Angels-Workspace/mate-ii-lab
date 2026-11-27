import { describe, expect, it } from "vitest";
import type { PasoExpr, PasoValor } from "@/domain/types";
import { estaFactorizado, parseRecta, verificarExpr, verificarValor } from "@/lib/engine/verificar";
import { parseTex } from "@/lib/math/expr";

const base = { id: "t", instruccion: "", pistas: ["", "", ""] as [string, string, string], porQue: "", modelo: "" };

describe("motor de pasos con ejercicios de la docente", () => {
  // Lab 7/nov #11: lim x→5 (x²−6x+5)/(x−5)
  const factorizar: PasoExpr = {
    ...base,
    tipo: "expr",
    esperado: "\\frac{x^2-6x+5}{x-5}",
    variable: "x",
    forma: ["producto"],
    a: 5,
    evitar: [5],
    errores: [{ id: "signos", candidato: "\\frac{(x+5)(x+1)}{x-5}", explicacion: "signos" }],
  };

  it("acepta la factorización correcta", () => {
    expect(verificarExpr("\\frac{(x-5)(x-1)}{x-5}", factorizar).estado).toBe("correcto");
    expect(verificarExpr("\\frac{\\left(x-1\\right)\\left(x-5\\right)}{x-5}", factorizar).estado).toBe("correcto");
  });
  it("detecta que no factorizó", () => {
    expect(verificarExpr("\\frac{x^2-6x+5}{x-5}", factorizar).estado).toBe("sinAvanzar");
  });
  it("clasifica el error de signos", () => {
    expect(verificarExpr("\\frac{(x+5)(x+1)}{x-5}", factorizar).estado).toBe("errorTipico");
  });
  it("rechaza álgebra incorrecta", () => {
    expect(verificarExpr("\\frac{(x-5)(x+1)}{x-5}", factorizar).estado).toBe("incorrecto");
  });

  const simplificar: PasoExpr = { ...base, tipo: "expr", esperado: "x-1", variable: "x", forma: ["finitoEnA"], a: 5, errores: [] };
  it("simplificar: exige que ya no dé 0/0", () => {
    expect(verificarExpr("x-1", simplificar).estado).toBe("correcto");
    expect(verificarExpr("\\frac{(x-5)(x-1)}{x-5}", simplificar).estado).toBe("sinAvanzar");
  });

  // Lab No. 2 #4: (√(x+1)−2)/(x−3)
  const racionalizar: PasoExpr = {
    ...base,
    tipo: "expr",
    esperado: "\\frac{\\sqrt{x+1}-2}{x-3}",
    variable: "x",
    forma: ["sinRaizEnNumerador"],
    rango: [-0.8, 20],
    evitar: [3],
    errores: [],
  };
  it("racionalizar: acepta (x−3)/((x−3)(√(x+1)+2)) y pide quitar la raíz de arriba", () => {
    expect(verificarExpr("\\frac{x-3}{(x-3)(\\sqrt{x+1}+2)}", racionalizar).estado).toBe("correcto");
    expect(verificarExpr("\\frac{\\sqrt{x+1}-2}{x-3}", racionalizar).estado).toBe("sinAvanzar");
  });

  const valor: PasoValor = { ...base, tipo: "valor", esperado: "\\frac{1}{4}", errores: [{ id: "0", candidato: "0", explicacion: "" }] };
  it("valores equivalentes y errores", () => {
    expect(verificarValor("0.25", valor).estado).toBe("correcto");
    expect(verificarValor("\\frac{2}{8}", valor).estado).toBe("correcto");
    expect(verificarValor("0", valor).estado).toBe("errorTipico");
    expect(verificarValor("\\frac{1}{2\\sqrt{3}}", { ...valor, esperado: "\\frac{\\sqrt3}{6}" }).estado).toBe("correcto");
    expect(verificarValor("\\infty", { ...valor, esperado: "inf" }).estado).toBe("correcto");
  });

  it("rectas", () => {
    expect(parseRecta("x=3")).toEqual({ tipo: "x", c: 3 });
    expect(parseRecta("y=x+1")?.tipo).toBe("y");
    expect(parseRecta("x+1")).toBeNull();
  });

  it("factorizado", () => {
    expect(estaFactorizado(parseTex("x(x-4)")!.raw)).toBe(true);
    expect(estaFactorizado(parseTex("x^2-4x")!.raw)).toBe(false);
  });
});
