import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SCRIPT_TEMA, TemaToggle } from "@/components/TemaToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mate II Lab",
  description: "Ruta intensiva de un día para entender Matemática II: límites, asíntotas y derivadas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

const LINKS = [
  ["/", "Ruta"],
  ["/modulo/limites", "Límites"],
  ["/modulo/asintotas", "Asíntotas"],
  ["/formulas", "Fórmulas"],
  ["/progreso", "Progreso"],
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-dvh antialiased">
        <nav className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-3 py-2">
            <Link href="/" className="mr-2 shrink-0 font-bold">
              Mate II Lab
            </Link>
            {LINKS.slice(1).map(([href, t]) => (
              <Link key={href} href={href} className="shrink-0 rounded-lg px-2 py-1 text-sm hover:bg-line/50">
                {t}
              </Link>
            ))}
            <div className="ml-auto shrink-0">
              <TemaToggle />
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-3xl px-4 py-5 pb-28">{children}</main>
      </body>
    </html>
  );
}
