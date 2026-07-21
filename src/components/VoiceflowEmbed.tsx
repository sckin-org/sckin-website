"use client";

import { useEffect, useRef } from "react";
import { VOICEFLOW_BUNDLE_URL, VOICEFLOW_CONFIG } from "@/lib/voiceflow";

/**
 * Always-open, inline SickleCellPedia chat pane (Voiceflow "embedded" render
 * mode) — visitors can start typing immediately, no launcher click.
 *
 * Load order matters: the widget needs its target div in the DOM before
 * load() runs, so the bundle is injected from useEffect (after mount) rather
 * than via <Script> in the document head. The container carries an explicit
 * min-height — without one the embedded pane collapses to zero.
 *
 * If the CDN is blocked or Voiceflow is down the pane stays empty; the page
 * copy below it still points to WhatsApp and Messenger, so that is a degraded
 * page, not a broken one.
 */
export default function VoiceflowEmbed() {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    let cancelled = false;

    const boot = () => {
      if (cancelled) return;
      window.voiceflow?.chat.load({
        ...VOICEFLOW_CONFIG,
        render: { mode: "embedded", target },
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${VOICEFLOW_BUNDLE_URL}"]`
    );
    if (window.voiceflow?.chat) {
      // Bundle already loaded (client-side re-navigation) — attach directly.
      boot();
    } else if (existing) {
      // Script tag injected by a previous mount but not loaded yet.
      existing.addEventListener("load", boot);
    } else {
      const script = document.createElement("script");
      script.src = VOICEFLOW_BUNDLE_URL;
      script.type = "text/javascript";
      script.onload = boot;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      existing?.removeEventListener("load", boot);
      // Tear the chat down so a later mount can load() cleanly.
      window.voiceflow?.chat.destroy?.();
    };
  }, []);

  return (
    <div
      ref={targetRef}
      data-role="voiceflow-embed"
      style={{ width: "100%", minHeight: 600 }}
    />
  );
}
