import type { Metadata } from "next";
import { HojaResumen } from "@/components/HojaResumen";

export const metadata: Metadata = { title: "Hoja resumen · Entiende" };

export default function Page() {
  return <HojaResumen />;
}
