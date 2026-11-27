"use client";
import { useEffect, useState } from "react";
import { useProgreso } from "@/store/progreso";

/** Carga el progreso guardado (localStorage) solo en el cliente, para evitar desajustes con el HTML del servidor. */
export function useHidratado() {
  // siempre false en el primer render (igual que en el servidor); se activa tras montar
  const [h, setH] = useState(false);
  useEffect(() => {
    const unsub = useProgreso.persist.onFinishHydration(() => {
      // primera visita: semilla aleatoria para que los ejercicios varíen
      if (useProgreso.getState().semilla === 1) useProgreso.setState({ semilla: Math.floor(Math.random() * 1e6) });
      setH(true);
    });
    if (useProgreso.persist.hasHydrated()) setH(true);
    else void useProgreso.persist.rehydrate();
    return unsub;
  }, []);
  return h;
}
