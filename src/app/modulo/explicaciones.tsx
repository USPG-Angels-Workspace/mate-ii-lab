import { ModuloView } from "@/components/ModuloView";
import type { ModuloId } from "@/domain/types";
import LimA from "@/content/limites/explicacion-a.mdx";
import LimB from "@/content/limites/explicacion-b.mdx";
import AsiA from "@/content/asintotas/explicacion-a.mdx";
import AsiB from "@/content/asintotas/explicacion-b.mdx";
import DerA from "@/content/derivadas/explicacion-a.mdx";
import DerB from "@/content/derivadas/explicacion-b.mdx";
import RepA from "@/content/repaso/explicacion-a.mdx";
import RepB from "@/content/repaso/explicacion-b.mdx";

const EXPLICACIONES: Record<ModuloId, [() => React.ReactNode, () => React.ReactNode]> = {
  limites: [() => <LimA />, () => <LimB />],
  asintotas: [() => <AsiA />, () => <AsiB />],
  derivadas: [() => <DerA />, () => <DerB />],
  repaso: [() => <RepA />, () => <RepB />],
};

/** Página de módulo (rutas estáticas: no lee params, así el shell es instantáneo). */
export function PaginaModulo({ id }: { id: ModuloId }) {
  const [a, b] = EXPLICACIONES[id];
  return <ModuloView id={id} explicacionA={a()} explicacionB={b()} />;
}
