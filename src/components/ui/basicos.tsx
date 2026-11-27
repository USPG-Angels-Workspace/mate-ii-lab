import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/** Capa fina sobre shadcn/ui con los nombres usados en toda la app. */

type Variante = "primario" | "secundario" | "fantasma" | "ok" | "peligro";

const MAPA: Record<Variante, { variant: ComponentProps<typeof Button>["variant"]; extra?: string }> = {
  primario: { variant: "default" },
  secundario: { variant: "outline" },
  fantasma: { variant: "ghost" },
  ok: { variant: "default", extra: "bg-ok text-white hover:bg-ok/90" },
  peligro: { variant: "destructive" },
};

export function Boton({ variante = "primario", className, ...p }: ComponentProps<"button"> & { variante?: Variante }) {
  const m = MAPA[variante];
  return <Button variant={m.variant} size="lg" className={cn("h-auto min-h-10 px-4 py-2 whitespace-normal", m.extra, className)} {...p} />;
}

export function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return <Card className={cn("gap-0 px-4 py-4 sm:px-5 sm:py-5", className)}>{children}</Card>;
}

export function Barra({ valor, className }: { valor: number; className?: string }) {
  return <Progress value={Math.min(100, Math.max(0, valor * 100))} className={className} />;
}

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: "neutro" | "ok" | "bad" | "warn" | "accent" }) {
  const t = { neutro: "", ok: "bg-ok/15 text-ok", bad: "bg-bad/15 text-bad", warn: "bg-warn/15 text-warn", accent: "bg-primary/15 text-primary" }[tono];
  return (
    <Badge variant="secondary" className={cn("shrink-0", t)}>
      {children}
    </Badge>
  );
}
