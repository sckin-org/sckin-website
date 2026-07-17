/**
 * Voiceflow web chat wiring.
 *
 * <VoiceflowWidget /> loads the widget once, site-wide, from the root layout —
 * that is what puts the collapsed launcher in the bottom-right corner of every
 * page. Anything that needs to *drive* the chat (opening it, say) must wait for
 * load() to resolve first, which is what whenVoiceflowReady() below is for.
 *
 * The project/runtime config lives here rather than in page frontmatter: the
 * widget is global, so it is not any one page's content, and these IDs are
 * wiring an editor should never have to think about.
 */

export const VOICEFLOW_CONFIG = {
  verify: { projectID: "684db2d2921b2a3ad5910594" },
  url: "https://general-runtime.voiceflow.com",
  versionID: "production",
} as const;

export const VOICEFLOW_BUNDLE_URL =
  "https://cdn.voiceflow.com/widget-next/bundle.mjs";

declare global {
  interface Window {
    voiceflow?: {
      chat: {
        load: (config: unknown) => Promise<void>;
        open: () => void;
      };
    };
    /** The load() promise, published by <VoiceflowWidget /> as soon as it calls load(). */
    __voiceflowReady?: Promise<void>;
  }
}

/**
 * Resolve once the chat widget is loaded and safe to drive.
 *
 * There are two distinct races here, and both bite in practice:
 *  1. load() is async — calling open() before it resolves silently does nothing.
 *  2. A consumer's effect can run *before* the widget script's onLoad has
 *     published __voiceflowReady, so we poll for the promise itself instead of
 *     reading it once and giving up on undefined.
 *
 * Rejects after `timeoutMs` so a blocked CDN or offline visitor fails quietly
 * rather than polling forever.
 */
export function whenVoiceflowReady(timeoutMs = 15_000): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Voiceflow is browser-only"));
  }

  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const poll = () => {
      const ready = window.__voiceflowReady;
      if (ready) {
        ready.then(resolve, reject);
        return;
      }
      if (Date.now() >= deadline) {
        reject(new Error("Voiceflow widget did not load in time"));
        return;
      }
      window.setTimeout(poll, 100);
    };
    poll();
  });
}
