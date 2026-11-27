"use client";
import Link from "next/link";
import { useState } from "react";
import { FORMULAS } from "@/data/formulas";
import { Tex } from "./ui/Tex";

const normal = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function HojaFormulas() {
  const [q, setQ] = useState("");
  const lista = FORMULAS.filter((f) => normal(`${f.tema} ${f.nombre} ${f.lectura}`).includes(normal(q)));
  const temas = [...new Set(lista.map((f) => f.tema))];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hoja de fórmulas</h1>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar: cociente, hueco, conjugado…"
        className="w-full rounded-lg border border-line bg-card px-3 py-2"
        aria-label="Buscar fórmula"
      />
      {temas.map((t) => (
        <section key={t} className="space-y-2">
          <h2 className="text-lg font-semibold">{t}</h2>
          {lista
            .filter((f) => f.tema === t)
            .map((f) => (
              <article key={f.id} className="rounded-xl border border-line bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{f.nombre}</h3>
                  {f.href !== "/formulas" && (
                    <Link href={f.href} className="shrink-0 text-xs text-accent underline">
                      Practicar →
                    </Link>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <Tex display>{f.tex}</Tex>
                </div>
                <p className="text-sm text-muted">{f.lectura}</p>
              </article>
            ))}
        </section>
      ))}
      {lista.length === 0 && <p className="text-muted">Nada coincide con «{q}».</p>}
    </div>
  );
}
