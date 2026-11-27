import katex from "katex";
import { Fragment } from "react";

/** Macros compartidas entre todos los renders. */
export const MACROS = {
  "\\dx": "\\,dx",
  "\\R": "\\mathbb{R}",
};

export function texToHtml(tex: string, display = false): string {
  return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, macros: { ...MACROS } });
}

export function Tex({ children, display = false, className }: { children: string; display?: boolean; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: texToHtml(children, display) }} />;
}

/**
 * Texto con $LaTeX$ en línea, $$bloques$$ y **negritas**.
 * Se usa para todo el contenido generado (instrucciones, pistas, explicaciones).
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const partes = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  return (
    <span className={className}>
      {partes.map((p, i) => {
        if (p.startsWith("$$")) return <Tex key={i} display>{p.slice(2, -2)}</Tex>;
        if (p.startsWith("$") && p.length > 1) return <Tex key={i}>{p.slice(1, -1)}</Tex>;
        return (
          <Fragment key={i}>
            {p.split(/(\*\*[^*]+\*\*)/g).map((q, j) =>
              q.startsWith("**") ? <strong key={j}>{q.slice(2, -2)}</strong> : <Fragment key={j}>{q}</Fragment>,
            )}
          </Fragment>
        );
      })}
    </span>
  );
}
