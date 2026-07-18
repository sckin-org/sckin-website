"use client";

import { useMemo, useState } from "react";
import { SCKIN_EIN } from "@/lib/donations";
import styles from "./donate.module.css";

const TIERS: Record<Frequency, number[]> = {
  monthly: [10, 20, 50],
  once: [25, 50, 100],
};

type Frequency = "monthly" | "once";

function suggestedMonthly(amount: number): number {
  if (amount >= 100) return Math.max(10, Math.round(amount / 10 / 5) * 5);
  return 5;
}

export default function DonateForm() {
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [amount, setAmount] = useState<number | null>(20);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nudge = useMemo(() => {
    if (frequency !== "once" || !amount) return null;
    const m = suggestedMonthly(amount);
    return { monthly: m, yearly: m * 12 };
  }, [frequency, amount]);

  function switchFrequency(f: Frequency) {
    setFrequency(f);
    setIsCustom(false);
    setCustomValue("");
    setAmount(f === "monthly" ? 20 : null); // one-time requires an explicit choice
    setError(null);
  }

  function pickTier(a: number) {
    setAmount(a);
    setIsCustom(false);
    setCustomValue("");
  }

  function onCustom(v: string) {
    setCustomValue(v);
    setIsCustom(true);
    const n = parseInt(v, 10);
    setAmount(Number.isFinite(n) && n >= 1 ? n : null);
  }

  function acceptNudge() {
    if (!nudge) return;
    const m = nudge.monthly;
    const isTier = TIERS.monthly.includes(m);
    setFrequency("monthly");
    setIsCustom(!isTier);
    setCustomValue(isTier ? "" : String(m));
    setAmount(m);
  }

  async function checkout() {
    if (!amount) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = isCustom
        ? { frequency, customAmount: amount }
        : { frequency, lookupKey: `${frequency === "monthly" ? "monthly" : "once"}_${amount}` };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap} data-page="donate">
      <div className={styles.card}>
        <p className={styles.eyebrow}>Support SCKIN</p>
        <h1 className={styles.title}>Keep reliable sickle cell information free for everyone.</h1>
        <p className={styles.lede}>
          Your gift sustains SickleCellPedia and everything it takes to build, improve, and share it
          worldwide.
        </p>

        <div className={styles.freq} role="group" aria-label="Donation frequency">
          <button
            aria-pressed={frequency === "monthly"}
            onClick={() => switchFrequency("monthly")}
            type="button"
          >
            Monthly <span className={styles.badge}>Preferred</span>
          </button>
          <button
            aria-pressed={frequency === "once"}
            onClick={() => switchFrequency("once")}
            type="button"
          >
            One-time
          </button>
        </div>

        <div className={styles.amounts} role="group" aria-label="Donation amount">
          {TIERS[frequency].map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={!isCustom && amount === a}
              onClick={() => pickTier(a)}
            >
              ${a}
              <small>{frequency === "monthly" ? "per month" : "one time"}</small>
            </button>
          ))}
        </div>

        <div className={styles.custom}>
          <span aria-hidden="true">$</span>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="Other amount"
            aria-label="Custom donation amount in dollars"
            value={customValue}
            onChange={(e) => onCustom(e.target.value)}
          />
        </div>

        {nudge && (
          <div className={styles.nudge} aria-live="polite">
            <p>
              A smaller monthly gift goes further. <strong>${nudge.monthly}/month</strong> adds up
              to ${nudge.yearly} a year — steady support we can plan around.
            </p>
            <button type="button" onClick={acceptNudge}>
              Make it ${nudge.monthly} monthly instead
            </button>
          </div>
        )}

        <p className={styles.impact}>
          {frequency === "monthly"
            ? "Monthly gifts provide steady, predictable support — they let us plan, build, and reach more of the sickle cell community."
            : "Every gift helps keep trustworthy sickle cell information free and accessible."}
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="button"
          className={styles.cta}
          disabled={!amount || submitting}
          onClick={checkout}
        >
          {!amount
            ? "Choose an amount"
            : submitting
              ? "Redirecting…"
              : frequency === "monthly"
                ? `Donate $${amount} monthly`
                : `Donate $${amount} once`}
        </button>

        <p className={styles.trust}>
          SCKIN is a 501(c)(3) tax-exempt organization. EIN {SCKIN_EIN}.<br />
          Donations are tax-deductible. Payments securely processed by Stripe.<br />
          Monthly gifts can be changed or canceled anytime.
        </p>
      </div>
    </div>
  );
}
