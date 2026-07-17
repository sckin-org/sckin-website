"use client";

import Script from "next/script";
import { VOICEFLOW_BUNDLE_URL, VOICEFLOW_CONFIG } from "@/lib/voiceflow";

/**
 * Loads the Voiceflow web chat widget site-wide, rendering the collapsed
 * launcher in the bottom-right corner of every page. Mounted once, in the root
 * layout.
 *
 * load() resolves when the chat is ready to be driven, so the promise is
 * published on window for whenVoiceflowReady() consumers (e.g.
 * <VoiceflowAutoOpen />) to chain on. Publishing it here — synchronously with
 * the load() call — is what keeps those consumers from racing the widget.
 */
export default function VoiceflowWidget() {
  return (
    <Script
      src={VOICEFLOW_BUNDLE_URL}
      strategy="afterInteractive"
      onLoad={() => {
        window.__voiceflowReady = window.voiceflow?.chat.load(VOICEFLOW_CONFIG);
      }}
    />
  );
}
