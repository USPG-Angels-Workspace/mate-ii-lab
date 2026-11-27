import { notFound } from "next/navigation";
import { ModuloView } from "@/components/ModuloView";
import { MODULOS } from "@/content/modulos";
import type { ModuloId } from "@/domain/types";
import LimA from "@/content/limites/explicacion-a.mdx";
import LimB from "@/content/limites/explicacion-b.mdx";
import AsiA from "@/content/asintotas/explicacion-a.mdx";
import AsiB from "@/content/asintotas/explicacion-b.mdx";

const EXPLICACIONES: Partial<Record<ModuloId, [() => React.ReactNode, () => React.ReactNode]>> = {
  limites: [() => <LimA />, () => <LimB />],
  asintotas: [() => <AsiA />, () => <AsiB />],
};

export function generateStaticParams() {
  return Object.keys(EXPLICACIONES).map((id) => ({ id }));
}

export default async function Page({ params }: PageProps<"/modulo/[id]">) {
  const { id } = await params;
  const exp = EXPLICACIONES[id as ModuloId];
  if (!exp || !(id in MODULOS)) notFound();
  return <ModuloView id={id as ModuloId} explicacionA={exp[0]()} explicacionB={exp[1]()} />;
}
