import type { Metadata } from "next";
import DonateForm from "./DonateForm";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support SCKIN, a 501(c)(3) nonprofit making sickle cell disease information universally accessible.",
};

/**
 * Donations. The interactive tier/frequency picker is a client component;
 * this server wrapper exists so the page keeps static metadata.
 */
export default function DonatePage() {
  return <DonateForm />;
}
