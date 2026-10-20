---
title: Contact SCKIN
nav_label: Contact
meta_description: Get in touch with the Sickle Cell Knowledge and Information Network — for press, partnerships, volunteering, and general enquiries.
hero:
  headline: "Get in touch"
  subhead: "For partnerships, press, volunteering and research enquiries."

# Steer disease questions to the chatbot, not the inbox
deflect:
  heading: "Have a question about sickle cell disease?"
  body: "SickleCellPedia answers questions about sickle cell disease instantly, free, in English and French — grounded in trusted clinical guidelines. It's faster than waiting for a reply from us."
  cta: { label: "Ask SickleCellPedia", href: "/sicklecellpedia" }

form:
  heading: "Send us a message"
  fields:
    - { name: name, label: "Your name", type: text, required: true }
    - { name: email, label: "Email address", type: email, required: true }
    - { name: organization, label: "Organization", type: text, required: false }
    - { name: country, label: "Country", type: text, required: false }
    - name: reason
      label: "What's this about?"
      type: select
      required: true
      options:
        - Press or media
        - Partnership or collaboration
        - Volunteering
        - Research or clinical evaluation
        - Something else
    - { name: message, label: "Message", type: textarea, required: true }
  submit_label: "Send message"
  confirmation: "Thank you — your message has reached our team, and we'll be in touch."

schedule:
  heading: "Prefer to talk?"
  body: "Book a 30-minute call with our founder, Zacharie Liman-Tinguiri."
  # Section stays hidden whenever href is empty (Google Calendar booking page).
  cta: { label: "Schedule a call", href: "https://calendar.app.google/rjdDk4cz7gvHVHxo6" }

direct:
  email: contact@sckin.org
  facebook: https://www.facebook.com/profile.php?id=61561436170933
  linkedin: https://www.linkedin.com/company/sickle-cell-knowlege-and-information-network/
---

You can also reach us by email, or find us on Facebook and LinkedIn:
