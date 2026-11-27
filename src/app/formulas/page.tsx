import type { Metadata } from "next";
import { HojaFormulas } from "@/components/HojaFormulas";

export const metadata: Metadata = { title: "Fórmulas · Entiende" };

export default function Page() {
  return <HojaFormulas />;
}
