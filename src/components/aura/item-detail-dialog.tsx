"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { ManifestItem } from "@/lib/aura-library";

interface Props {
  item: ManifestItem | null;
  onClose: () => void;
}

export function ItemDetailDialog({ item, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<
    "preview" | "design" | "prompt" | "code"
  >("preview");

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
            <span
              className="badge badge-outline"
              style={{ textTransform: "capitalize" }}
            >
              {item.type}
            </span>
          </div>
          {item.desc && <p className="dialog-desc">{item.desc}</p>}
          <div className="dialog-meta">
            <span className="dialog-meta-item">
              👁 {item.views.toLocaleString()}
            </span>
            {item.forks > 0 && (
              <span className="dialog-meta-item">
                ⑂ {item.forks.toLocaleString()}
              </span>
            )}
            <span className="dialog-meta-item">
              📝 {item.code_chars.toLocaleString()} chars
            </span>
            {item.username && (
              <span className="dialog-meta-item">
                by {item.username.slice(0, 16)}
              </span>
            )}
            {item.created_at && (
              <span className="dialog-meta-item">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
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
                    // SECURITY: NO allow-same-origin — content is user-controlled
                    sandbox="allow-scripts allow-popups"
                    className="preview-pane"
                  />
                )}
                {activeTab === "design" && (
                  <ArtifactPane
                    type={item.type as "component" | "template"}
                    file={item.file}
                    artifact="design_md"
                  />
                )}
                {activeTab === "prompt" && (
                  <ArtifactPane
                    type={item.type as "component" | "template"}
                    file={item.file}
                    artifact="recreation_prompt"
                  />
                )}
                {activeTab === "code" && (
                  <CodePane code={fullItem?.code || ""} />
                )}
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
      console.error("Clipboard error:", e);
      alert("Copy failed. Please select text and copy manually.");
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
}: {
  type: "component" | "template";
  file: string;
  artifact: "design_md" | "recreation_prompt";
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
      console.error("Clipboard error:", e);
      alert("Copy failed. Please select text and copy manually.");
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
            This <code>{artifact}</code> needs to be generated via Aura&apos;s
            Edge Function. Once generated, it will appear here automatically.
          </p>
          <p style={{ fontSize: 12, marginTop: 12 }}>
            File expected at:{" "}
            <code>
              {type}s/
              {file}
              .{artifact === "design_md" ? "design.md" : "prompt.md"}
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
      <div className="markdown code-pane" style={{ background: "#0a0a0a" }}>
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </div>
    </div>
  );
}
