import type { Metadata } from "next";
import { Simulacro } from "@/components/Simulacro";

export const metadata: Metadata = { title: "Simulacro · Entiende" };

export default function Page() {
  return <Simulacro />;
}
