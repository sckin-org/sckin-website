"use client";

import { useEffect } from "react";
import { whenVoiceflowReady } from "@/lib/voiceflow";

/**
 * Opens the Voiceflow chat as soon as the widget is ready, rather than leaving
 * it collapsed in the corner.
 *
 * Include this only on pages whose purpose *is* the chat — /sicklecellpedia
 * today, and the SickleCellPedia Pro page when it lands. Everywhere else the
 * launcher stays collapsed until a visitor clicks it.
 *
 * Renders nothing.
 */
export default function VoiceflowAutoOpen() {
  useEffect(() => {
    let cancelled = false;

    whenVoiceflowReady()
      .then(() => {
        if (!cancelled) window.voiceflow?.chat.open();
      })
      .catch(() => {
        // The widget never loaded (blocked CDN, offline, Voiceflow down). The
        // page copy still points to WhatsApp and Messenger, so a collapsed or
        // absent launcher is a degraded page, not a broken one.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
