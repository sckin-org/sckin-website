"use client";

import { useEffect, useImperativeHandle, useRef } from "react";

/**
 * Cloudflare Turnstile widget, shared by every site form.
 *
 * Rendered inside a <form>, Turnstile injects a hidden `cf-turnstile-response`
 * input into its container, so the form's existing
 * `Object.fromEntries(new FormData(form))` payload carries the token to the
 * route with no extra plumbing. Verification happens server-side in
 * src/lib/turnstile.ts.
 *
 * `appearance: "interaction-only"` keeps the widget invisible for nearly
 * everyone (the "SCKIN website forms" widget is in Managed mode); a visible
 * checkbox only appears when Cloudflare wants an interaction.
 *
 * Tokens are single-use and expire after 5 minutes: callers must `reset()`
 * after any submit that did not end in the success state, and should keep
 * submit disabled until `onTokenChange` reports a token (`turnstileEnabled`
 * false — no site key, e.g. bare `next dev` — means no token is required).
 *
 * Deliberately no npm dependency: the official script is loaded once on
 * demand, in explicit-render mode.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: Record<string, unknown>
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window !== "undefined" && window.turnstile) {
    return Promise.resolve(window.turnstile);
  }
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("Turnstile loaded without its API"));
    script.onerror = () => {
      scriptPromise = null; // allow a later mount to retry
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Discard the current token and fetch a fresh one. */
  reset: () => void;
}

interface Props {
  ref?: React.Ref<TurnstileHandle>;
  /** "dark" on the dark footer surface; "light" on page surfaces. */
  theme?: "light" | "dark" | "auto";
  /** Called with the token when issued, and with null when it expires or errors. */
  onTokenChange: (token: string | null) => void;
}

export default function TurnstileWidget({
  ref,
  theme = "light",
  onTokenChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  // Keep the latest callback without re-rendering the widget when it changes.
  const onTokenChangeRef = useRef(onTokenChange);
  onTokenChangeRef.current = onTokenChange;

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenChangeRef.current(null);
      if (widgetIdRef.current !== undefined) {
        window.turnstile?.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          appearance: "interaction-only",
          callback: (token: string) => onTokenChangeRef.current(token),
          "expired-callback": () => onTokenChangeRef.current(null),
          "timeout-callback": () => onTokenChangeRef.current(null),
          "error-callback": () => {
            onTokenChangeRef.current(null);
            // Returning nothing lets Turnstile's built-in retry run.
          },
        });
      })
      .catch((error) => {
        console.error("[turnstile]", error);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== undefined) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, [theme]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={containerRef} data-role="turnstile" />;
}
