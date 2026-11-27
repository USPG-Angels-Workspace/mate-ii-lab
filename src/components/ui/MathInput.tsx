"use client";
import { useEffect, useRef } from "react";

type MF = HTMLElement & { value: string; focus: () => void; executeCommand?: (c: string) => void };

/**
 * Entrada matemática con MathLive (teclado virtual en el celular).
 * Se monta solo en el cliente; produce LaTeX.
 */
export function MathInput({
  value,
  onChange,
  onEnter,
  placeholder,
  autoFocus,
  disabled,
}: {
  value: string;
  onChange: (latex: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mf = useRef<MF | null>(null);
  const cb = useRef({ onChange, onEnter });
  useEffect(() => {
    cb.current = { onChange, onEnter };
  });

  useEffect(() => {
    let vivo = true;
    import("mathlive").then(({ MathfieldElement }) => {
      if (!vivo || !host.current) return;
      MathfieldElement.fontsDirectory = "/mathlive/fonts";
      MathfieldElement.soundsDirectory = null;
      const el = new MathfieldElement() as unknown as MF & {
        smartFence: boolean;
        mathVirtualKeyboardPolicy: string;
        placeholder: string;
        defaultMode: string;
        inlineShortcuts: Record<string, string>;
      };
      el.smartFence = true;
      el.mathVirtualKeyboardPolicy = "auto";
      el.defaultMode = "math";
      if (placeholder) el.setAttribute("placeholder", placeholder);
      el.value = value;
      el.addEventListener("input", () => cb.current.onChange(el.value));
      el.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Enter") {
          e.preventDefault();
          cb.current.onEnter?.();
        }
      });
      host.current.replaceChildren(el);
      mf.current = el;
      if (autoFocus) setTimeout(() => el.focus(), 50);
    });
    return () => {
      vivo = false;
    };
    // se monta una sola vez; el valor externo se sincroniza abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mf.current && mf.current.value !== value) mf.current.value = value;
  }, [value]);

  useEffect(() => {
    if (mf.current) mf.current.toggleAttribute("read-only", !!disabled);
  }, [disabled]);

  return <div ref={host} className="min-h-[3rem] w-full" aria-label="Entrada matemática" />;
}
