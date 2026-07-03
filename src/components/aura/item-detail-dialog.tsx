"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ManifestItem } from "@/lib/aura-library";

interface Props {
  item: ManifestItem | null;
  onClose: () => void;
}

export function ItemDetailDialog({ item, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"preview" | "design" | "prompt" | "code">("preview");

  const { data: fullItem, isLoading } = useQuery({
    queryKey: ["item", item?.type, item?.id],
    queryFn: async () => {
      if (!item) return null;
      const r = await fetch(`/api/item/${item.type}/${item.id}`);
      if (!r.ok) throw new Error("Failed to fetch item");
      return r.json();
    },
    enabled: !!item,
  });

  if (!item) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ position: "relative" }}>
          <div className="dialog-title">
            <span className="line-clamp-1">{item.title}</span>
            {item.premium && <span className="badge badge-pro">Pro</span>}
            {item.featured && <span className="badge badge-featured">★</span>}
            <span className="badge badge-outline" style={{ textTransform: "capitalize" }}>
              {item.type}
            </span>
          </div>
          {item.desc && <p className="dialog-desc">{item.desc}</p>}
          <div className="dialog-meta">
            <span className="dialog-meta-item">👁 {item.views.toLocaleString()}</span>
            {item.forks > 0 && (
              <span className="dialog-meta-item">⑂ {item.forks.toLocaleString()}</span>
            )}
            <span className="dialog-meta-item">📝 {item.code_chars.toLocaleString()} chars</span>
            {item.username && (
              <span className="dialog-meta-item">by {item.username.slice(0, 16)}</span>
            )}
            {item.created_at && (
              <span className="dialog-meta-item">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="dialog-body">
          <div className="tabs-list">
            <button
              className={`tab ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              👁 Preview
            </button>
            <button
              className={`tab ${activeTab === "design" ? "active" : ""}`}
              onClick={() => setActiveTab("design")}
            >
              📄 DESIGN.md
            </button>
            <button
              className={`tab ${activeTab === "prompt" ? "active" : ""}`}
              onClick={() => setActiveTab("prompt")}
            >
              ✨ Copy Prompt
            </button>
            <button
              className={`tab ${activeTab === "code" ? "active" : ""}`}
              onClick={() => setActiveTab("code")}
            >
              {"</>"} Code
            </button>
          </div>

          <div className="tab-panel">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            ) : (
              <>
                {activeTab === "preview" && (
                  <iframe
                    srcDoc={fullItem?.code || ""}
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    className="preview-pane"
                  />
                )}
                {activeTab === "design" && (
                  <ArtifactPane
                    type={item.type}
                    file={item.file}
                    artifact="design_md"
                    language="markdown"
                  />
                )}
                {activeTab === "prompt" && (
                  <ArtifactPane
                    type={item.type}
                    file={item.file}
                    artifact="recreation_prompt"
                    language="text"
                  />
                )}
                {activeTab === "code" && <CodePane code={fullItem?.code || ""} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodePane({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="code-pane-wrap">
      <button className="copy-btn" onClick={copy}>
        {copied ? "✓ Copied!" : "Copy HTML"}
      </button>
      <pre className="code-pane">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ArtifactPane({
  type,
  file,
  artifact,
  language,
}: {
  type: "component" | "template";
  file: string;
  artifact: "design_md" | "recreation_prompt";
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["artifact", type, file, artifact],
    queryFn: async () => {
      const r = await fetch(
        `/api/item-file?type=${type}&file=${encodeURIComponent(file)}&artifact=${artifact}`,
      );
      if (r.status === 404) {
        return { available: false, content: "" };
      }
      if (!r.ok) throw new Error("Failed to fetch artifact");
      const content = await r.text();
      return { available: true, content };
    },
    staleTime: 10 * 60 * 1000,
  });

  const copy = async () => {
    if (!data?.content) return;
    try {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="artifact-empty">
        <div className="artifact-empty-content">
          <p>Failed to load artifact.</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            {(error as Error)?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data.available) {
    return (
      <div className="artifact-empty">
        <div className="artifact-empty-content">
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h3>Artifact not generated yet</h3>
          <p>
            This <code>{artifact}</code> needs to be generated via Aura&apos;s Edge
            Function. Once generated, it will appear here automatically.
          </p>
          <p style={{ fontSize: 12, marginTop: 12 }}>
            File expected at:{" "}
            <code>
              {type}s/{file}.{artifact === "design_md" ? "design.md" : "prompt.md"}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-pane-wrap">
      <button className="copy-btn" onClick={copy}>
        {copied
          ? "✓ Copied!"
          : `Copy ${artifact === "design_md" ? "DESIGN.md" : "Prompt"}`}
      </button>
      {language === "markdown" ? (
        <div className="markdown code-pane" style={{ background: "#0a0a0a" }}>
          <MarkdownLite content={data.content} />
        </div>
      ) : (
        <pre className="code-pane">
          <code>{data.content}</code>
        </pre>
      )}
    </div>
  );
}

// Lightweight markdown renderer
function MarkdownLite({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`}>
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(<h1 key={i}>{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<li key={i}>{renderInline(line.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(<li key={i}>{renderInline(line.replace(/^\d+\.\s/, ""))}</li>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i}>{renderInline(line.slice(2))}</blockquote>,
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 12 }} />);
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>);
    }
  });

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key="code-final">
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
  }

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const patterns: Array<[RegExp, (m: RegExpExecArray) => React.ReactNode]> = [
    [/\*\*([^*]+)\*\*/, (m) => <strong key={key++}>{m[1]}</strong>],
    [
      /`([^`]+)`/,
      (m) => <code key={key++}>{m[1]}</code>,
    ],
    [
      /\[([^\]]+)\]\(([^)]+)\)/,
      (m) => (
        <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      ),
    ],
    [/\*([^*]+)\*/, (m) => <em key={key++}>{m[1]}</em>],
  ];

  while (remaining.length > 0) {
    let earliestIdx = -1;
    let earliestMatch: RegExpExecArray | null = null;
    let earliestRender: ((m: RegExpExecArray) => React.ReactNode) | null = null;

    for (const [pattern, render] of patterns) {
      const m = pattern.exec(remaining);
      if (m && (earliestIdx === -1 || m.index < earliestIdx)) {
        earliestIdx = m.index;
        earliestMatch = m;
        earliestRender = render;
      }
    }

    if (earliestIdx === -1 || !earliestMatch || !earliestRender) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.slice(0, earliestIdx));
    }
    parts.push(earliestRender(earliestMatch));
    remaining = remaining.slice(earliestIdx + earliestMatch[0].length);
  }

  return <>{parts}</>;
}
