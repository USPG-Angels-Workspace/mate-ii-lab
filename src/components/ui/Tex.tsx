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
 * Texto con $LaTeX$ en línea, $$bloques$$ y **negritas** (que pueden contener fórmulas).
 * Se usa para todo el contenido generado (instrucciones, pistas, explicaciones).
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  // primero las negritas, luego las fórmulas dentro de cada trozo
  const trozos = text.split(/(\*\*[\s\S]+?\*\*)/g);
  return (
    <span className={className}>
      {trozos.map((t, i) =>
        t.startsWith("**") && t.endsWith("**") && t.length > 4 ? (
          <strong key={i}>
            <Formulas text={t.slice(2, -2)} />
          </strong>
        ) : (
          <Formulas key={i} text={t} />
        ),
      )}
    </span>
  );
}

/** Texto con $LaTeX$ en línea y $$bloques$$. */
function Formulas({ text }: { text: string }) {
  const partes = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith("$$")) return <Tex key={i} display>{p.slice(2, -2)}</Tex>;
        // displaystyle: fracciones y límites a tamaño completo dentro del texto
        if (p.startsWith("$") && p.length > 1) return <Tex key={i}>{`\\displaystyle ${p.slice(1, -1)}`}</Tex>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
