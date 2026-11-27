import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "fantasma" | "ok" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-accent text-white hover:brightness-110",
  secundario: "border border-line bg-card hover:bg-line/40",
  fantasma: "hover:bg-line/50",
  ok: "bg-ok text-white hover:brightness-110",
  peligro: "bg-bad text-white hover:brightness-110",
};

export function Boton({ variante = "primario", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...p}
    />
  );
}

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-card p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>;
}

export function Barra({ valor, className = "" }: { valor: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-line ${className}`} role="progressbar" aria-valuenow={Math.round(valor * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, Math.max(0, valor * 100))}%` }} />
    </div>
  );
}

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: "neutro" | "ok" | "bad" | "warn" | "accent" }) {
  const t = { neutro: "bg-line/60", ok: "bg-ok/15 text-ok", bad: "bg-bad/15 text-bad", warn: "bg-warn/15 text-warn", accent: "bg-accent/15 text-accent" }[tono];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
}
