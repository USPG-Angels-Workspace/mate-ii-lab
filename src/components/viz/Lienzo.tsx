"use client";
import { Coordinates, Mafs } from "mafs";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Rango = [number, number];

/** Paso "bonito" (1, 2, 5 × 10^k) para que los ejes tengan ~10 marcas sin amontonarse. */
export function pasoEje(ancho: number): number {
  const crudo = ancho / 10;
  const pot = Math.pow(10, Math.floor(Math.log10(crudo)));
  for (const m of [1, 2, 5, 10]) if (m * pot >= crudo) return m * pot;
  return 10 * pot;
}

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
  const vx = escalar(x);
  const vy = escalar(y);
  const px = pasoEje(vx[1] - vx[0]);
  const py = pasoEje(vy[1] - vy[0]);
  return (
    <div className="relative">
      <Mafs key={version} height={alto} viewBox={{ x: escalar(x), y: escalar(y) }} preserveAspectRatio={false} pan zoom={{ min: 0.1, max: 10 }}>
        <Coordinates.Cartesian subdivisions={false} xAxis={{ lines: px }} yAxis={{ lines: py }} />
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
