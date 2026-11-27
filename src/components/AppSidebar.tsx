"use client";
import {
  BookOpenCheck,
  Check,
  Brain,
  CalendarClock,
  ChartSpline,
  FileText,
  Infinity as InfinityIcon,
  ListChecks,
  Sigma,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { RUTA, minutosBloque } from "@/data/ruta";
import type { ModuloId } from "@/domain/types";
import { ETAPAS, useProgreso } from "@/store/progreso";
import { useHidratado } from "./Hidratar";

interface Item {
  href: string;
  titulo: string;
  icono: ReactNode;
  modulo?: ModuloId;
}

const MODULOS_NAV: Item[] = [
  { href: "/modulo/limites", titulo: "Límites", icono: <InfinityIcon />, modulo: "limites" },
  { href: "/modulo/asintotas", titulo: "Asíntotas", icono: <ChartSpline />, modulo: "asintotas" },
  { href: "/modulo/derivadas", titulo: "Derivadas", icono: <TrendingUp />, modulo: "derivadas" },
  { href: "/modulo/repaso", titulo: "Repaso relámpago", icono: <Sparkles />, modulo: "repaso" },
];

export const TITULOS: Record<string, string> = {
  "/": "Ruta del día",
  "/modulo/limites": "Límites",
  "/modulo/asintotas": "Asíntotas",
  "/modulo/derivadas": "Derivadas",
  "/modulo/repaso": "Repaso relámpago",
  "/simulacro": "Simulacro final",
  "/formulas": "Hoja de fórmulas",
  "/progreso": "Progreso",
  "/resumen": "Hoja resumen",
};

export function AppSidebar() {
  const path = usePathname();
  const hidratado = useHidratado();
  const { bloques, modulos, fallos, comprimido, simulacro } = useProgreso();
  const { setOpenMobile } = useSidebar();
  const total = RUTA.reduce((s, b) => s + minutosBloque(b, comprimido), 0);
  const hecho = RUTA.filter((b) => bloques[b.id]?.completado).reduce((s, b) => s + minutosBloque(b, comprimido), 0);
  const pct = Math.round((hecho / total) * 100);

  const enlace = (it: Item, extra?: ReactNode) => (
    <SidebarMenuItem key={it.href}>
      <SidebarMenuButton asChild isActive={path === it.href} tooltip={it.titulo}>
        <Link href={it.href} onClick={() => setOpenMobile(false)}>
          {it.icono}
          <span>{it.titulo}</span>
        </Link>
      </SidebarMenuButton>
      {hidratado && extra}
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Entiende</span>
                  <span className="truncate text-xs text-muted-foreground">Matemática II · Final</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hoy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{enlace({ href: "/", titulo: "Ruta del día", icono: <CalendarClock /> }, <SidebarMenuBadge>{pct}%</SidebarMenuBadge>)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULOS_NAV.map((it) => {
                const m = it.modulo ? modulos[it.modulo] : undefined;
                const n = m?.completadas.length ?? 0;
                return enlace(it, <SidebarMenuBadge>{n === ETAPAS.length ? <Check className="size-3.5 text-ok" /> : `${n}/${ETAPAS.length}`}</SidebarMenuBadge>);
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Práctica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enlace({ href: "/simulacro", titulo: "Simulacro (1 h)", icono: <Timer /> }, simulacro ? <SidebarMenuBadge>{`${simulacro.aciertos}/${simulacro.total}`}</SidebarMenuBadge> : null)}
              {enlace({ href: "/progreso", titulo: "Progreso y errores", icono: <ListChecks /> }, fallos.length ? <SidebarMenuBadge className="text-bad">{fallos.length}</SidebarMenuBadge> : null)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enlace({ href: "/formulas", titulo: "Hoja de fórmulas", icono: <Sigma /> })}
              {enlace({ href: "/resumen", titulo: "Hoja resumen", icono: <FileText /> })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="space-y-2 rounded-lg border border-sidebar-border bg-background/60 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpenCheck className="size-3.5" /> Progreso del día
            </span>
            <Badge variant="secondary">{hidratado ? pct : 0}%</Badge>
          </div>
          <Progress value={hidratado ? pct : 0} />
          <p className="text-muted-foreground">Examen: sábado 8:00–9:00</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
