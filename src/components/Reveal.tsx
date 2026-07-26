"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-triggered reveal (fade + rise) per the design annex's Motion section.
 * The visual rules live in globals.css ([data-reveal]); tokens zero the motion
 * under prefers-reduced-motion, so this degrades to static automatically. The
 * locale layout carries a <noscript> override so content is never hidden
 * without JS. Deliberately NOT used on the hero — above-the-fold content must
 * paint immediately on low-bandwidth connections (a primary audience).
 */
export default function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
