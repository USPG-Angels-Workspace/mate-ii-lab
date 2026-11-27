"use client";

/** Alterna claro/oscuro. El tema inicial lo pone el script en <head> (sin parpadeo). */
export function TemaToggle() {
  return (
    <button
      aria-label="Cambiar tema claro/oscuro"
      className="rounded-lg px-2 py-1 text-lg hover:bg-line/50"
      onClick={() => {
        const html = document.documentElement;
        const nuevo = html.dataset.theme === "dark" ? "light" : "dark";
        html.dataset.theme = nuevo;
        try {
          localStorage.setItem("tema", nuevo);
        } catch {
          /* sin almacenamiento */
        }
      }}
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}

export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("tema");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;
