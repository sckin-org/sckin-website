---
title: SickleCellPedia Pro
nav_label: SickleCellPedia Pro
meta_description: Clinical decision support for healthcare professionals treating sickle cell disease in under-resourced settings.
status: In development — expected Q4 2026
intro: >-
  [PLACEHOLDER] Describe SickleCellPedia Pro and invite professionals to register interest.
form:
  submit_label: Register your interest
  confirmation: "[TO ADD — what the user sees after registering interest]"
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

[PLACEHOLDER] Optional supporting prose for the SickleCellPedia Pro page goes here.
