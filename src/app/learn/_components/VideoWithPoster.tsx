"use client";

import { useState } from "react";

/**
 * VideoWithPoster — shows a poster image + play button. Loads the actual
 * YouTube iframe only when the user clicks play. This avoids YouTube's
 * "Sign in to confirm you're not a bot" detection that fires when
 * autoplay=1 iframes are loaded server-side.
 */
export function VideoWithPoster({
  src,
  thumb,
  title,
}: {
  src: string;
  thumb?: string;
  title?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={src + (src.includes("?") ? "&" : "?") + "autoplay=1"}
        title={title ?? "Embedded video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <button
      type="button"
      className="docs-video-poster"
      onClick={() => setLoaded(true)}
      aria-label={`Play video: ${title ?? "embedded video"}`}
      style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
    >
      <span className="docs-video-play" aria-hidden="true">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {title && <span className="docs-video-poster-title">{title}</span>}
    </button>
  );
}
