---
title: SickleCellPedia Pro
nav_label: SickleCellPedia Pro
meta_description: Clinical decision support for healthcare professionals treating sickle cell disease in under-resourced settings. Register your interest.
status: In development — expected Q4 2026
# TODO: tagline [TO ADD — one-line value prop for healthcare professionals];
# empty string renders nothing until Zacharie supplies it.
tagline: ""
intro: >-
  A clinical decision-support tool for healthcare professionals in
  under-resourced settings (Sub-Saharan Africa, India, the Caribbean, and other
  underserved communities).
features:
  - name: Mandatory citations
    description: Every answer is grounded in and cites trusted medical resources.
  - name: Chain-of-thought reasoning
    description: Transparent, step-by-step clinical reasoning.
  - name: Multi-agent architecture
    description: Purpose-built agents for accurate, context-aware support.
  - name: Credential-based access
    description: Access restricted to verified healthcare professionals.
  # TODO: [TO ADD any additional features] per master doc v3.1.
register:
  heading: Register your interest
  # TODO: subtext [TO ADD] — the master doc's example line is used until
  # Zacharie supplies final copy.
  subtext: Be among the first to try SickleCellPedia Pro. Tell us a little about yourself and we'll be in touch.
form:
  submit_label: Register your interest
  # TODO: confirmation [TO ADD] — the master doc's example line is used until
  # Zacharie supplies final copy.
  confirmation: Thanks — you're on the list. We'll email you when SickleCellPedia Pro is ready for early access.
  # Field names match PRO_FIELDS in src/lib/form-specs.ts (server-side spec)
  # and the contacts-sheet columns in src/lib/sheets.ts.
  fields:
    - { name: full_name, label: "Full name", type: text, required: true }
    - { name: email, label: "Email address", type: email, required: true }
    - name: is_healthcare_professional
      label: "Are you a healthcare professional?"
      type: select
      required: true
      options: ["Yes", "No"]
    - { name: role, label: "Role / profession", type: text, required: false }
    - { name: country, label: "Country", type: text, required: true }
    - { name: city_region, label: "City / region", type: text, required: false }
    - { name: notes, label: "Interest / notes", type: textarea, required: false }
    - name: consent
      label: "I agree to be contacted by SCKIN about SickleCellPedia Pro."
      type: checkbox
      required: true
      link: { label: "Privacy Policy", href: /privacy }
---
