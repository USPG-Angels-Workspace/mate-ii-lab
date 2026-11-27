"use client";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TITULOS } from "./AppSidebar";
import { TemaToggle } from "./TemaToggle";

export function Encabezado() {
  const path = usePathname();
  return (
    <header className="no-print sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur">
      <SidebarTrigger aria-label="Abrir menú" />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{TITULOS[path] ?? "Entiende"}</p>
      </div>
      <TemaToggle />
    </header>
  );
}
