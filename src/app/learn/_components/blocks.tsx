import type { ReactNode } from "react";

/**
 * Building blocks for learn page content.
 * These keep the page bodies short and consistent.
 */

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="learn-section">
      <h2 className="learn-section-title">{title}</h2>
      <div className="learn-section-body">{children}</div>
    </section>
  );
}

export function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="learn-subsection">
      <h3 className="learn-subsection-title">{title}</h3>
      <div className="learn-subsection-body">{children}</div>
    </div>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="learn-tip">
      <div className="learn-tip-label">Tip</div>
      <div className="learn-tip-body">{children}</div>
    </div>
  );
}

export function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="learn-callout">
      {title && <div className="learn-callout-title">{title}</div>}
      <div className="learn-callout-body">{children}</div>
    </div>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="learn-step">
      <div className="learn-step-num">{n}</div>
      <div className="learn-step-body">
        <h4 className="learn-step-title">{title}</h4>
        <div className="learn-step-content">{children}</div>
      </div>
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="learn-code">{children}</code>;
}

export function CodeBlock({ lang, children }: { lang?: string; children: ReactNode }) {
  return (
    <pre className="learn-code-block">
      {lang && <div className="learn-code-lang">{lang}</div>}
      <code>{children}</code>
    </pre>
  );
}
