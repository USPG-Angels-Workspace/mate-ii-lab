import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: (p) => <h2 className="mt-6 mb-2 text-xl font-semibold" {...p} />,
  h3: (p) => <h3 className="mt-4 mb-1 text-lg font-semibold" {...p} />,
  p: (p) => <p className="my-2 leading-relaxed" {...p} />,
  ul: (p) => <ul className="my-2 list-disc space-y-1 pl-6" {...p} />,
  ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-6" {...p} />,
  blockquote: (p) => <blockquote className="my-3 rounded-r-lg border-l-4 border-accent bg-accent/10 px-4 py-2" {...p} />,
  table: (p) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-sm" {...p} />
    </div>
  ),
  th: (p) => <th className="border-b border-line px-2 py-1 text-left" {...p} />,
  td: (p) => <td className="border-b border-line px-2 py-1" {...p} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
