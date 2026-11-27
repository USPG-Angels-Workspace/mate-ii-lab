"use client";
import { Mafs } from "mafs";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Rango = [number, number];

/**
 * Plano cartesiano con zoom: botones +/−/restablecer, además de rueda del mouse,
 * pellizco y arrastre (pan) en el celular.
 */
export function Lienzo({ x, y, alto = 280, children }: { x: Rango; y: Rango; alto?: number; children: ReactNode }) {
  const [escala, setEscala] = useState(1);
  const [version, setVersion] = useState(0);
  const centro = (r: Rango) => (r[0] + r[1]) / 2;
  const escalar = (r: Rango): Rango => {
    const c = centro(r);
    const m = ((r[1] - r[0]) / 2) * escala;
    return [c - m, c + m];
  };
  const cambiar = (f: number) => {
    setEscala((e) => Math.min(8, Math.max(0.125, e * f)));
    setVersion((v) => v + 1);
  };
  return (
    <div className="relative">
      <Mafs key={version} height={alto} viewBox={{ x: escalar(x), y: escalar(y) }} preserveAspectRatio={false} pan zoom={{ min: 0.1, max: 10 }}>
        {children}
      </Mafs>
      <div className="absolute top-2 right-2 flex flex-col gap-1 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur">
        <Button size="icon-sm" variant="ghost" aria-label="Acercar" onClick={() => cambiar(0.5)}>
          <Plus />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Alejar" onClick={() => cambiar(2)}>
          <Minus />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Restablecer vista"
          onClick={() => {
            setEscala(1);
            setVersion((v) => v + 1);
          }}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}
