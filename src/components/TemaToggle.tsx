"use client";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Alterna claro/oscuro (clase .dark de shadcn). El tema inicial lo pone el script en <head>. */
export function TemaToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema claro/oscuro"
      onClick={() => {
        const html = document.documentElement;
        const oscuro = !html.classList.contains("dark");
        html.classList.toggle("dark", oscuro);
        try {
          localStorage.setItem("tema", oscuro ? "dark" : "light");
        } catch {
          /* sin almacenamiento */
        }
      }}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}

export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("tema");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`;
