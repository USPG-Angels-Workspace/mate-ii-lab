import type { Metadata } from "next";
import { Progreso } from "@/components/Progreso";

export const metadata: Metadata = { title: "Progreso · Entiende" };

export default function Page() {
  return <Progreso />;
}
