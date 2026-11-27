import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppSidebar } from "@/components/AppSidebar";
import { Encabezado } from "@/components/Encabezado";
import { SCRIPT_TEMA } from "@/components/TemaToggle";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Entiende · Matemática II",
  description: "Entiende: aprende entendiendo, no memorizando. Curso actual: Matemática II (límites, asíntotas y derivadas).",
  applicationName: "Entiende",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#16161a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-dvh antialiased">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Encabezado />
              <main className="mx-auto w-full max-w-3xl px-4 py-5 pb-28">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
