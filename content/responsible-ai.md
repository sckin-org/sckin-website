---
title: Responsible AI
nav_label: Responsible AI
meta_description: How SCKIN builds and evaluates AI responsibly — our five commitments, guideline grounding, medical disclaimer, known limitations, evaluation & benchmarking, and data privacy.
# Each topic is a top-level section with its own anchor (copy landed
# 2026-08-18, replacing the #approach-with-sub-blocks + #surveys scaffold).
# External links (the Warrior Con slides, the HealthBench paper) open in a
# new tab via renderSectionBody; internal links stay same-tab.
sections:
  - id: approach
    heading: Our approach
    body: |
      Responsible AI can transform sickle cell care — but only if its risks
      are measured, not merely acknowledged. Every system we build is
      designed against five commitments.

      - **Accuracy we can measure.** We hold our systems to the highest
        accuracy we can achieve, and we test for it rather than assume it.
      - **Bias we actively look for.** Sickle cell care is shaped by
        long-standing inequities. AI trained on that record inherits them
        unless someone goes looking.
      - **Accessible by design.** Outputs and interactions are written for
        the people who will actually read them — patients, caregivers, and
        clinicians alike.
      - **A complement to clinical judgment, never a replacement.** Our
        tools are decision support. The decision stays with the human.
      - **Humans in the loop.** Expert reviewers evaluate how our systems
        perform and give us semantic, accessibility, and ethical feedback
        that we fold back into the product.

      We shared this vision at Warrior Con 2026, the 13th Annual Sickle
      Cell Warriors Convention in Los Angeles —
      [view the presentation](https://docs.google.com/presentation/d/1cGGqf5Am6iAIuFyvHqO4oyiIdvgd8gorWRYRYX3LEsQ/).
  - id: grounding
    heading: Guideline grounding & citations
    body: |
      Our systems draw on a curated knowledge base: current reference
      textbooks, seminal peer-reviewed articles, and indexes of trusted
      medical information such as the NIH. If you would like to review our
      sources — or propose one we have missed — please
      [get in touch](/contact).
  - id: disclaimer
    heading: Medical disclaimer
    body: |
      Nothing SickleCellPedia provides is medical advice. It is a medical
      information tool, not a substitute for care from a qualified
      professional. Medical advice requires clinical judgment applied to a
      specific person in a specific context, and that is not something a
      single-turn AI tool is equipped to provide. Always consult your care
      team before acting on anything you read here.
  - id: pro
    heading: SickleCellPedia Pro
    body: |
      Pro is a decision-support tool built for clinicians, wherever they
      practice. It is designed to be more robust than the public version:

      - Multi-agent architecture
      - Mandatory citation of consensus guidelines
      - The ability to enter case-specific information
      - Chain-of-thought reasoning
      - Credential-based access

      Learn more on the [SickleCellPedia Pro page](/sicklecellpedia-pro),
      where clinicians can [register their
      interest](/sicklecellpedia-pro#register).
  - id: limitations
    heading: Known limitations
    body: |
      SickleCellPedia does not currently cover mental health needs, nor
      does it help patients navigate access to care within their own health
      system. Both matter. Both also fall outside the scope of this
      version, because both depend heavily on local and personal context.
      Our focus for now is consensus-based medical information that holds
      across settings.
  - id: evaluation
    heading: Evaluation & benchmarking
    body: |
      We will present benchmark results for SickleCellPedia at ASCAT in
      October 2026.

      **Human-in-the-loop surveys.** To benchmark SickleCellPedia against
      general-purpose AI tools (ChatGPT, Claude, Gemini), we ask our expert
      collaborators to evaluate the responses each tool produces. Our
      method follows the approach used in
      [HealthBench (Arora et al., 2025)](https://arxiv.org/abs/2505.08775).
  - id: privacy
    heading: Data privacy
    body: |
      We never sell your information, and we do not use it without your
      express permission. Read our [privacy policy](/privacy).
---
