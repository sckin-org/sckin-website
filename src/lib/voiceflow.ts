/**
 * Voiceflow web chat wiring.
 *
 * The chat renders as an always-open inline pane on /sicklecellpedia only —
 * see <VoiceflowEmbed />, which loads the widget bundle after its container
 * div is in the DOM and passes `render: { mode: "embedded", target }`. There
 * is deliberately no site-wide corner launcher.
 *
 * The project/runtime config lives here rather than in page frontmatter:
 * these IDs are wiring an editor should never have to think about. The
 * projectID is the WEB agent. Do NOT swap in 6a1f2795e85b1c323616c71a (the
 * WhatsApp agent) or 6696064d23cb7050aa60577a (dead legacy web agent —
 * unpublished, renders blank).
 */

export const VOICEFLOW_CONFIG = {
  verify: { projectID: "684db2d2921b2a3ad5910594" },
  url: "https://general-runtime.voiceflow.com",
  // The literal string "production" is correct per Voiceflow — not a stage name
  // to substitute.
  versionID: "production",
  voice: { url: "https://runtime-api.voiceflow.com" },
} as const;

export const VOICEFLOW_BUNDLE_URL =
  "https://cdn.voiceflow.com/widget-next/bundle.mjs";

declare global {
  interface Window {
    voiceflow?: {
      chat: {
        load: (config: unknown) => Promise<void>;
        destroy?: () => void;
      };
    };
  }
}
