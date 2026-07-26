"use client";

import { useState } from "react";

/**
 * The donate widget from the locked design — one shared component for the
 * homepage donate band and /donate (design annex: mechanics must match).
 * Styled white-on-red for the band surface; /donate hosts it inside a red
 * card so the look is identical.
 *
 * Mechanics (2026-07-22 decisions):
 *  - One-time is the default, $25 pre-selected; presets swap with the
 *    frequency toggle (one-time $25/$50/$100 · monthly $10/$20/$50, $20
 *    pre-selected when toggled). Matches the Stripe lookup keys.
 *  - Monthly carries the "most impactful" tag but is never pre-selected.
 *  - "Add a note (optional)" collapses to a text link; the value lands in
 *    Checkout Session metadata (see /api/checkout).
 *
 * The comp's per-amount impact-equivalence line is deliberately not rendered
 * until real unit costs exist (requirements checklist, Donate).
 */

type Frequency = "one-time" | "monthly";

const CONFIG: Record<Frequency, { presets: number[]; preselect: number }> = {
  "one-time": { presets: [25, 50, 100], preselect: 25 },
  monthly: { presets: [10, 20, 50], preselect: 20 },
};

const MIN_USD = 1;
const MAX_USD = 25000;
const MAX_NOTE_LENGTH = 500;

export default function DonateWidget() {
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = CONFIG[frequency];
  const customAmount = custom ? parseInt(custom, 10) : null;
  const amount = customAmount ?? selected ?? cfg.preselect;
  const customOutOfRange =
    customAmount !== null && (customAmount < MIN_USD || customAmount > MAX_USD);

  function switchFrequency(next: Frequency) {
    setFrequency(next);
    setSelected(null);
    setCustom("");
    setError(null);
  }

  function pickPreset(value: number) {
    setSelected(value);
    setCustom("");
    setError(null);
  }

  async function checkout() {
    if (customOutOfRange) return;
    setSubmitting(true);
    setError(null);
    const apiFrequency = frequency === "monthly" ? "monthly" : "once";
    const trimmedNote = note.trim().slice(0, MAX_NOTE_LENGTH);
    const body = {
      frequency: apiFrequency,
      ...(customAmount !== null
        ? { customAmount }
        : { lookupKey: `${apiFrequency}_${amount}` }),
      ...(trimmedNote ? { note: trimmedNote } : {}),
    };
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const segment =
    "flex-1 cursor-pointer rounded-pill py-2.5 text-center text-[15px] font-semibold transition-colors";
  const chip =
    "cursor-pointer rounded-pill border py-3 text-center text-[16px] font-semibold transition-colors";

  return (
    <div data-component="donate-widget">
      <div
        role="group"
        aria-label="Donation frequency"
        className="flex gap-1.5 rounded-pill border border-white/45 p-1"
      >
        <button
          type="button"
          aria-pressed={frequency === "one-time"}
          onClick={() => switchFrequency("one-time")}
          className={`${segment} ${frequency === "one-time" ? "bg-white text-heading-accent" : "text-on-band"}`}
        >
          One-time
        </button>
        <button
          type="button"
          aria-pressed={frequency === "monthly"}
          onClick={() => switchFrequency("monthly")}
          className={`${segment} ${frequency === "monthly" ? "bg-white text-heading-accent" : "text-on-band"}`}
        >
          Monthly{" "}
          <span className="text-[12px] font-normal opacity-75">
            · most impactful
          </span>
        </button>
      </div>

      <div
        role="group"
        aria-label="Donation amount"
        className="mt-4 grid grid-cols-3 gap-2"
      >
        {cfg.presets.map((value) => {
          const active = customAmount === null && amount === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => pickPreset(value)}
              className={`${chip} ${active ? "border-white bg-white text-heading-accent" : "border-white/45 bg-transparent text-on-band"}`}
            >
              ${value}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        inputMode="numeric"
        placeholder="Custom amount ($)"
        aria-label="Custom donation amount in dollars"
        value={custom}
        onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
        className="mt-2 w-full rounded-pill border border-white/45 bg-transparent px-5 py-3 text-[16px] text-on-band outline-none placeholder:text-white/60 focus:border-white"
      />
      {customOutOfRange ? (
        <p className="mt-2 text-[14px] font-semibold text-on-band" role="alert">
          Enter an amount between $1 and $25,000.
        </p>
      ) : null}

      {noteOpen ? (
        <input
          type="text"
          placeholder="Add a note (optional)"
          aria-label="Add a note (optional)"
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- opened by an
          // explicit click on the toggle right above this input
          autoFocus
          className="mt-2 w-full rounded-pill border border-white/45 bg-transparent px-5 py-3 text-[16px] text-on-band outline-none placeholder:text-white/60 focus:border-white"
        />
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="mt-3 text-[15px] font-semibold text-white/85 transition-colors hover:text-on-band"
        >
          + Add a note (optional)
        </button>
      )}

      {error ? (
        <p className="mt-3 text-center text-[14px] font-semibold text-on-band" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={submitting || customOutOfRange}
        onClick={checkout}
        className="mt-6 w-full rounded-pill bg-white py-3.5 text-[17px] font-semibold text-heading-accent transition-colors hover:bg-(--red-100) disabled:opacity-60"
      >
        {submitting
          ? "Redirecting…"
          : `Donate $${amount}${frequency === "monthly" ? " monthly" : ""}`}
      </button>

      <p className="mt-3.5 text-center text-[13px] text-white/60">
        Secure payment via Stripe · SCKIN is a 501(c)(3) nonprofit
      </p>
    </div>
  );
}
