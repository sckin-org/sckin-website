"use client";

import { useEffect, useRef } from "react";
import { VOICEFLOW_BUNDLE_URL, VOICEFLOW_CONFIG } from "@/lib/voiceflow";

/**
 * Always-open, inline SickleCellPedia chat pane (Voiceflow "embedded" render
 * mode) — visitors can start typing immediately, no launcher click.
 *
 * Load order matters: the widget needs its target div in the DOM before
 * load() runs, so the bundle is injected from useEffect (after mount) rather
 * than via <Script> in the document head.
 *
 * The container's height must be DEFINITE, not a min-height. Voiceflow's pane
 * is `height: 100%`, which against an indefinite parent degenerates to `auto`:
 * the pane then grows with the conversation instead of scrolling internally.
 * Below 768px Voiceflow caps that growth at `max-height: 100vh`, which on iOS
 * is the LARGE viewport — so the pane outgrew the screen and pushed its input
 * row under the Safari toolbar, unreachable at any scroll position on a 390px
 * -wide phone. A definite height gives `height: 100%` something to resolve
 * against and hands the overflow to the widget's own message scroller.
 *
 * The md: breakpoint (768px) is chosen to match Voiceflow's own
 * `@media (max-width: 768px)` rule exactly, so the bounded height applies
 * precisely where their 100vh cap exists. Desktop keeps a flat 600px — which
 * also caps the same unbounded growth there (it had no 100vh backstop at all).
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
      className="w-full h-[min(600px,70svh)] md:h-[600px]"
    />
  );
}
