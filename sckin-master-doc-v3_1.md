# SCKIN WEBSITE — CONTENT SOURCE (MASTER DOC) — v3

**Revised 2026-07-20 (Claude), incorporating Zacharie's feedback on v2.** Changes from v2: secondary CTA "Donate to support SCKIN"; AI line folded into Hypothesis; Tool 1 gains WhatsApp link (new window) + QR code; Tool 2 CTA anchored to #register; Sickle Cell News marked in development (expected September 2026) with social-media distribution language; Blog subpage added under News for SCKIN announcements; IRS-letter link opens in new window; SickleCellPedia grounding language changed to "trusted medical resources"; chatbot embedded open below the intro with other channels beneath; Pro "underserved communities" wording + expanded lead-capture fields with consent; Publications rebuilt into four sections (Presentations · Publications · Abstracts · Other Contributions) with real entries; open items updated (Stripe resolved, taxonomy deferred, logo item dropped). Items marked {PENDING} await Zacharie's answers. v2 changes (all retained): nav labels fixed; About restructured to SCKIN · Our Board · Our Founder · Our Collaborators · Friends of SCKIN; headings harmonized; Amplify → Vercel; statuses harmonized; RED FR + AI translation; bio corrections; Kyle + Kiari draft bios; France = 54; Meta token removed (revoke it in the Meta dashboard).

## HOW TO USE THIS DOC

- This is the single source of content for the STATIC pages of the new sckin.org (Next.js on Vercel).
- Edit the text under each "Page:" heading. Claude parses this doc and pushes updates to GitHub → Vercel rebuilds automatically.
- Keep the labels (Title:, Body:, etc.) — they map content to the right place on each page.
- Fields marked [TO ADD] need your input. Fields with existing copy are migrated from the current sckin.org — edit freely.
- IMAGES: write "Image: [short description]" and drop the actual file in the shared Website > Images folder; Claude matches by name. Final destination in the repo: public/images/ (team photos in public/images/team/, logos in public/images/logos/).
- NEWS posts are NOT managed here — they live in the site's /admin editor so topic/geography tags and images stay structured for filtering and social reposting.
- Heading convention (for the parser): H1 = "Page: …" · H2 = "Section: …" · H3 = individual entries (team members, organizations, publication entries).
- Never paste credentials, API keys, or tokens into this doc.

---

# Page: Home

Nav label: Home
Title: Sickle Cell Knowledge and Information Network (SCKIN)
Meta description: SCKIN is a 501(c)(3) nonprofit making useful, reliable information about sickle cell disease universally accessible — through free AI tools for patients, families, and healthcare professionals.

## Section: Hero

Headline: Useful, reliable information about sickle cell disease — for everyone, everywhere.
Subhead: SCKIN is a 501(c)(3) nonprofit working to improve the lives of people, families, and communities affected by sickle cell disease — by making useful, reliable information about it universally accessible.
Primary CTA: Try SickleCellPedia → /sicklecellpedia
Secondary CTA: Donate to support SCKIN → /donate
Image: home-hero.jpg — alt: [TO ADD]

## Section: The scale of the problem

Stat 1 figure: 7.7 million
Stat 1 caption: people live with sickle cell disease worldwide — the most common inherited genetic disorder. At least 100,000 are in the United States.
Stat 2 figure: 90%
Stat 2 caption: live in the Global South — Nigeria (~4M, 2% of the population), India (~1.2M), and the DRC (~900K, ~1%).

## Section: Statement banner

Statement: A patient in Nigeria can expect to live 21 years. In France, 54 — still nearly three decades short of a life without the disease.

## Section: Our hypothesis

Hypothesis: Sickle cell care is under-resourced everywhere. But the deepest gap isn't material — it's knowledge. We believe that making useful, reliable information universally accessible can close the information gap, narrow the life-expectancy gap, and improve patients' lives. We use artificial intelligence to put that information within reach of anyone who needs it.

## Section: Our tools

Section intro: The tools we use to fulfill our mission.

Tool 1 name: SickleCellPedia (EN) / DrepanoPedia (FR)
Tool 1 description: A free AI assistant that answers questions about sickle cell disease, grounded in trusted medical resources. Available on the web, WhatsApp, and Facebook.
Tool 1 CTA: Try SickleCellPedia → /sicklecellpedia
Tool 1 WhatsApp link: Chat on WhatsApp → https://wa.me/15557513738 (opens in a new window)
Tool 1 QR: whatsapp-qr.png — scannable code that opens SickleCellPedia on WhatsApp. alt: "QR code — chat with SickleCellPedia on WhatsApp". {Source: reuse the QR from the current sckin.org, or have Claude Code generate a fresh QR for wa.me/15557513738 — a generated one will be crisper than a scraped copy and encodes the same link.}
Tool 1 image: home-tool-pedia.jpg — alt: [TO ADD]

Tool 2 name: SickleCellPedia Pro
Tool 2 description: Clinical decision support for healthcare professionals in under-resourced settings.
Tool 2 status badge: In development — expected Q4 2026
Tool 2 CTA: Register your interest → /sicklecellpedia-pro#register
Tool 2 image: home-tool-pro.jpg — alt: [TO ADD]

Tool 3 name: Sickle Cell News {PENDING — confirm name: "Sickle Cell News" vs "Sickle Cell News Network"}
Tool 3 description: An AI-powered news service that scans sickle cell coverage from around the world, checks it for reliability and usefulness, and publishes summaries — on this site and on our social media channels — always linked to the original source.
Tool 3 status badge: In development — expected September 2026
Tool 3 CTA: Read the latest → /news
Tool 3 image: home-tool-news.jpg — alt: [TO ADD]

## Section: Get involved

Donate CTA: Donate to support SCKIN → /donate
Embed CTA: Embed SickleCellPedia in your organization
Embed CTA link: https://docs.google.com/forms/d/1jsZ5iG6P6Kou4ysZPi9VO30FyKx10d0jjfwe2lhT-nE/viewform

## Section: Email signup

Email signup heading: Leave us your email to stay informed
Email signup subtext: Sign up with your email address to receive news and updates. We value and respect your privacy.
Email signup field: Email address
Email signup button: Sign up

## Section: Open items (delete once resolved)

- Hero image + three tool images needed in Products > website > Images
- Alt text for all four images
- Confirm source for "54 years / France" (54 traces to a 2019 US study in available sources)
- Confirm whether the Voiceflow chat launcher appears globally or only on /sicklecellpedia

---

# Page: Mission

Nav label: Mission
Title: Our Mission

## Section: Our vision

A world where no one suffers from sickle cell disease for lack of knowledge that already exists.

## Section: Our mission

We aim to improve the lives of people living with sickle cell disease by making useful and reliable information about the disease universally accessible.

## Section: Our hypothesis

We believe the information gap drives the life-expectancy gap. Close the first, and the second begins to close.

## Section: What this looks like in practice

Four moments where the right knowledge, at the right time, changes everything.

### The patient — knowing your own disease

Danielle, 24, lives in Houston and was recently told she should consider hydroxyurea. Her hematologist appointment is in six weeks and the internet is a wall of contradictory forum posts. She asks SickleCellPedia what hydroxyurea does, what the evidence says about side effects, and what questions to bring to her appointment. In ten minutes she goes from anxious guessing to informed preparation — with answers drawn from NHLBI and ASH guidelines, not Reddit. The knowledge was always in the guidelines; it just wasn't written for her.

### The caregiver — the 2 a.m. question

It's the middle of the night in Dakar and Amina's six-year-old son has a fever of 38.9°C. She knows fever in a child with sickle cell can be an emergency, but is this one? On WhatsApp — the app she already uses every day — she asks SickleCellPedia. It tells her clearly: fever above 38.5°C in a child with SCD requires urgent medical evaluation, tonight, not tomorrow. She goes to the hospital. The rule that fever plus SCD equals emergency has been in pediatric protocols for decades. What changed is that it reached her at 2 a.m., in French, on her phone.

### The health care professional — frontline support in an under-resourced setting

Dr. Okonkwo is a general practitioner in a district hospital in northern Nigeria. He sees perhaps a dozen sickle cell patients a month among hundreds of others, and there is no hematologist within 300 kilometers. A pregnant patient with SCD presents with worsening anemia. With SickleCellPedia Pro, he checks management guidance grounded in WHO and BSH guidelines, with citations he can verify. He is not replaced by the tool — he is backed by the same evidence base a specialist in London would consult. Penicillin prophylaxis and hydroxyurea are cheap and available; what's scarce is specialist knowledge at the point of care. That's the gap this closes.

### The newly diagnosed family — the first week

Claire and Thomas, in Paris, have just learned through newborn screening that their daughter has sickle cell disease. Neither parent has it; they'd never heard the word "drépanocytose" before this week. In the gap between diagnosis and their first appointment at a specialized center, DrepanoPedia answers their first hundred questions — what this disease is, what it isn't, why penicillin will start soon, what her life can look like — in their language, at their pace, without judgment for asking the same question three times. The first week shapes a family's entire relationship with the disease. No one should spend it alone with a search engine.

*These are illustrative scenarios based on the real situations our users face.*

## Section: This is the world we're building.

Try SickleCellPedia → /sicklecellpedia · Support our work → /donate

---

# Page: About

Nav label: About
Title: About SCKIN
Anchor sections (in order): SCKIN · Our Board · Our Founder · Our Collaborators · Friends of SCKIN

## Section: SCKIN

Org statement: The Sickle Cell Knowledge and Information Network is a 501(c)(3) {link the phrase "501(c)(3)" to our IRS-issued determination letter: https://drive.google.com/file/d/1dhlQV_Nwm5FmvFauyPrpGPuhzIe81WOU/view?usp=sharing — opens in a new window/tab (target="_blank", rel="noopener noreferrer")} not-for-profit organization registered in the State of New York. Our EIN is 33-1763512.

Our vision: A world where no one suffers from sickle cell disease for lack of knowledge that already exists.

Our mission: We aim to improve the lives of people living with sickle cell disease by making useful and reliable information about the disease universally accessible.

## Section: Our Board

### Zacharie Liman-Tinguiri — Founder

LinkedIn: linkedin.com/in/zacharielimantinguiri/
Photo: team-zacharie-liman-tinguiri.jpg
Bio: Link to {Our Founder} section.

### Matthew Agnello — Director of Finance

LinkedIn: linkedin.com/in/agnello/
Photo: team-matthew-agnello.jpg
Bio: Matthew Agnello is a finance and operations leader with a background in data analytics, financial reporting, and technology-enabled transformation. He brings experience working with mission-driven and nonprofit organizations, including serving as a board fellow with the Food Bank of the Southern Tier, where he supported initiatives focused on operational effectiveness and impact. Matt is deeply passionate about social justice and equity, and about using technology to expand access to critical information for underserved and under-resourced communities. He holds an MBA from Cornell University with a focus in Sustainable Global Enterprise and completed a capstone project in partnership with a nonprofit in India aimed at creating sustainable access to sanitation while empowering women-owned ventures.

### Lewis Thomas, MBBS — Director of User Experience

LinkedIn: linkedin.com/in/drlewisthomas/
Photo: team-lewis-thomas.jpg
Bio: Dr Lewis Thomas lives with sickle cell in Manchester UK. He practiced as a medical doctor for 12 years before stepping back from his role as a General Practitioner in 2025. Since then he's become an established creator of relatable and trustworthy sickle cell education online. Drawing on his medical training and lived experience with sickle cell disease, he empowers others living with the condition to understand their bodies, advocate for themselves and stay healthy. He's also an accredited personal development coach. In December 2025 he created an online sickle cell community called The Sickleverse. This encapsulates all his patient education services and continues to address the unmet needs raised by his social media following. To complement this work he also serves on the board of the Sickle Cell Knowledge and Information Network. As Director of User Experience he ensures patients are able to engage with AI in a meaningful way to improve their health.

### Wunmi Bakare — Director of Development

LinkedIn: linkedin.com/in/wunmi-bakare-94924312/
Photo: team-wunmi-bakare.jpg
Bio: Wunmi Bakare is a multicultural citizen and pioneering advocate in the sickle cell and rare disease community, known for her commitment to inclusion and stigma eradication. With a fervent dedication to advancing awareness and understanding, Bakare leverages both proactive and reactive media engagement to transform perceptions of sickle cell disease. Her lived experience fuels her advocacy and informs her leadership roles on the advisory board for the National Heart, Lung, and Blood Institute, the American Board of Medical Specialties, Beam Therapeutics, Vertex Pharmaceuticals, Pfizer, Fulcrum, and Healthful Data as well as her board memberships with the Sickle Cell Knowledge & Information Network, Sickle Cell Disease Partnership, and The Gift of Adoption Fund.

Diagnosed with the severe HbSS form of sickle cell disease at just 18 months old, Bakare's grueling journey led her to participate in a groundbreaking clinical trial at the NIH, culminating in a successful allogeneic stem cell transplant in 2019. Bakare thrives as the Founder of WBPR Agency working across diverse corporate disciplines and providing strategic media counsel to top brands. In 2025, she launched #SickleCellProdigy, a patient-driven nonprofit organization dedicated to redefining survivorship for individuals living with sickle cell disease who are exploring or recovering from transformative therapies, including bone marrow transplant and gene therapy.

### Kyle Emile — Director of Partnerships

LinkedIn: linkedin.com/in/kyleemile/
Founder of FreeIC: https://www.freeic.org/team
Photo: team-kyle-emile.jpg
Bio {DRAFT — Zacharie to review}: Kyle Emile is a partnerships and operations leader whose career spans technology and the nonprofit sector. He serves as Chief of Staff for Global Monetization Partnerships at Meta, and previously held operations roles at Motive, Hustle, and Whirlpool Corporation. In 2012, as an undergraduate psychology student, Kyle founded Free Intelligent Conversation (FreeIC), a nonprofit that facilitates meaningful conversations between strangers in public places; he has served as its Executive Director ever since and shared its story in a TEDx talk. He is also Board Chair of BridgeUSA, an organization fostering constructive dialogue across political divides. As Director of Partnerships at SCKIN, Kyle leads partnership development and grant review.

### Lewis Hsu, MD — Medical Director

LinkedIn: linkedin.com/in/lewis-hsu-35015412/
Google Scholar: https://scholar.google.com/citations?user=48Wy9PcAAAAJ&hl=en&oi=ao
Photo: team-lewis-hsu.jpg (source: https://hospital.uillinois.edu/images/VideoOverlays/lewishsu_video.jpg — pending Dr. Hsu's OK)
Bio: Dr. Hsu is a pediatric hematologist who is dedicated to finding cures for sickle cell disease, and to improving treatment and education until cures can be found. He joined UIC as director of the Sickle Cell Center and Professor of Pediatrics in July 2011. He led large pediatric sickle cell programs at Emory University, St. Christopher's Hospital for Children, and Children's National Medical Center. His clinical and translational research experience include multicenter landmark clinical trials of sickle cell stroke prevention and bone marrow transplantation, and contributing to understanding of inflammation and nitric oxide in mouse models of sickle cell disease. He has published over fifty peer-reviewed papers, mentored numerous physicians and graduate students, and contributed to four sickle cell websites devoted to patient education. He has also co-authored a book, now in its third edition, entitled "Hope and Destiny: The Patient and Parent's Guide to Sickle Cell Disease and Sickle Cell Trait." In addition to sickle cell disease, his clinical interests include thalassemia and adolescent transition. Among his research interests are sickle cell disease, health education, bone marrow transplantation, and inflammation and vasculopathy, and health disparities. In addition to English, Dr. Hsu speaks Spanish, Chinese (Mandarin), and a little Portuguese.

### Mamadou Kiari Liman-Tinguiri — Director

LinkedIn: linkedin.com/in/amb-mamadou-kiari-liman-tinguiri-b2851429/
Photo: team-mamadou-kiari-liman-tinguiri.jpg
Bio {DRAFT — Zacharie to review}: Ambassador Mamadou Kiari Liman-Tinguiri, PhD, is a development economist with three decades of experience spanning academia, the United Nations system, and international diplomacy. He served as the Ambassador of Niger to the United States from 2022 to 2023. Earlier in his career, he taught economics at the University of Nancy II in France and at Abdou Moumouni University in Niamey, where he chaired the Department of Economics and served as Dean of the Faculty of Economics and Law, before holding senior roles with United Nations agencies. He is the author of a dozen articles in academic journals, several book chapters, and the book "La démocratie dans les États fragiles" (L'Harmattan, 2016). He serves on SCKIN's board as a Director.

### Maimouna Phelan — Director

Bio: [intentionally blank for now]
Photo: team-maimouna-phelan.jpg

### Bill Phelan — Director

Bio: [intentionally blank for now]
Photo: team-bill-phelan.jpg

## Section: Our Founder

Zacharie Liman-Tinguiri is an American, French, and Nigerien national who was born with sickle cell disease (SCD). Over the course of his life, he experienced more than a hundred hospitalizations and multiple surgeries.

Zacharie earned a Bachelor's degree in Honours Economics with a concentration in Political Science from the University of Ottawa in 2006, followed by a Master's degree in Economics with a specialization in Development Economics in 2008. During his time at the University of Ottawa, he served as the Graduate Student Representative for the Humanities on the University Senate and as a Director on the Graduate Students' Association Board, where he managed the Graduate Student Insurance Plan.

From 2009 to 2012, Zacharie worked at TD Securities in Toronto—first as an Investment Representative, then as a Risk Analyst. While in Toronto, he made history as the first patient to serve as President of the Sickle Cell Association of Ontario (2010–2012). His health challenges, however, prevented him from obtaining Canadian permanent residency, leading him to relocate to the United Kingdom. There, he joined Aon Risk Solutions as a Business Analyst and earned the Certificate in Insurance from the London Insurance Institute in 2014.

Zacharie later pursued an MBA at Cornell University's Samuel Curtis Johnson Graduate School of Management, where he served as Vice President for Capital Markets and Asset Management for the Old Ezra Finance Club, sat on the university's Health Insurance Advisory Committee, and became a Fellow of the Entrepreneurship and Innovation Institute. During his MBA studies, he underwent a pioneering bone marrow transplant at The Johns Hopkins Hospital that successfully cured him of sickle cell disease.

After completing his MBA, Zacharie joined A3 Ventures—the corporate innovation lab of the American Automobile Association—before moving to Amazon in several finance roles. He then joined Google, where he served as a Senior Product Manager focused on large language models and AI systems that help ensure the safety and integrity of Google's advertising inventory.

In 2024, Zacharie trained a large language model on the latest sickle cell disease research and integrated it with Facebook, WhatsApp, and web platforms to deliver accurate, up-to-date information to patients and caregivers. To expand this mission of "making useful and reliable information about sickle cell disease universally accessible," he founded the Sickle Cell Knowledge and Information Network (SCKIN)—a not-for-profit organization dedicated to empowering individuals and communities affected by SCD.

## Section: Our Collaborators

### Organization: RED

Link: https://www.le-red.com/
Logo: logo-red.png (scraped from le-red.com for now — see action item to request official file)
Description (FR): Association loi 1901 d'intérêt général créée en 2019. Le RED est un réseau d'experts des centres de référence et de compétence français et africains. D'abord RED-Grand-Paris pour mener son action en région Ile-de-France, le RED s'est étendu sur l'ensemble du territoire national (métropole et territoires ultra-marins). Depuis 2024, le RED a une délégation « Afrique », constituée d'experts de 7 pays d'Afrique pour développer les actions en Afrique.
Description (EN, translated by AI): A French nonprofit association (loi 1901) of general interest created in 2019, the RED is a network of experts from French and African reference and competence centers. First established as RED-Grand-Paris to carry out its work in the Île-de-France region, the RED has since expanded across the entire national territory (mainland France and overseas territories). Since 2024, the RED has an "Africa" delegation, made up of experts from 7 African countries, to develop its activities in Africa. (Translated by AI)
Status: Member
Collaboration: Build AI solutions for providers and patients in Africa.

### Organization: ASH — Sickle Cell Disease Coalition

Link: https://www.scdcoalition.org
Logo: logo-ash-scdc.png (scraped for now — see action item to request official file)
Description: The Sickle Cell Disease Coalition (SCDC) is an alliance of diverse stakeholder organizations from around the world uniting to conquer sickle cell disease (SCD). The SCD Coalition was established by the American Society of Hematology (ASH) in 2016 to amplify the voice of the sickle cell stakeholder community, foster collaboration, and improve outcomes for individuals with SCD. Its membership includes an array of organizations and stakeholders interested in sickle cell, such as those involved in public health, research, clinical care, community advocacy, philanthropy, policy, industry, and beyond.
Status: Member organization
Collaboration: Work on AI initiatives for Sickle Cell Disease. Educate fellow coalition members on the risk and opportunities of AI for Sickle Cell Disease care.

### Organization: SC3 — Sickle Cell Community Consortium

Link: https://sicklecellconsortium.org
Logo: logo-sc3.png (scraped for now — see action item to request official file)
Description: The Sickle Cell Community Consortium is a US-based non-profit formed in 2014 to "harness and amplify the power of the patient voice". The Consortium is comprised of sickle cell community-based organizations (CBOs), patient and caregiver advocates, community partners and medical and research advisers. These stakeholders collectively form the General Assembly of CBOs and Advocates, the decision-making body of the Consortium. The Consortium acts as an organizing entity providing the framework for the stakeholders of the General Assembly to apply a model of Collective Impact to define problems and gaps in the sickle cell community, identify strategies to address those needs and gaps, and determine the CBO, Community, and Corporate partnerships best equipped to implement those strategies to achieve significant and sustainable change.
Status: Member organization
Collaboration: Collaborate with other sickle cell disease organizations on AI projects that benefit the community.

## Section: Friends of SCKIN

[Intentionally empty at launch — section and anchor reserved. Content TO ADD.]

---

# Page: SickleCellPedia

Nav label: SickleCellPedia
Title: Try SickleCellPedia

Intro: SickleCellPedia (EN) / DrepanoPedia (FR) is a free, multilingual AI assistant that answers questions about Sickle Cell Disease, grounded in trusted medical resources — academic texts, peer-reviewed articles, and reputable online publications such as the NIH.

## Section: Chat now (embedded)

Placement: Immediately below the intro, render the SickleCellPedia chatbot OPEN (not just a launcher icon) so visitors can start typing right away.
Voiceflow production project ID: 684db2d2921b2a3ad5910594
Implementation note: If the standard Voiceflow web embed only supports a corner launcher and cannot be forced open inline, flag it — Zacharie will configure the open/inline widget in Voiceflow and hand over the embed code. {PENDING — Claude to confirm feasibility of inline-open embed; otherwise Zacharie supplies code.}

## Section: Other ways to reach SickleCellPedia

Below the chat, offer the other channels:
- WhatsApp: Chat on WhatsApp → https://wa.me/15557513738 (opens in a new window). Or save +1 (555) 751-3738 to your contacts and search "Sickle Cell Knowledge and Information Network". Show the WhatsApp QR (whatsapp-qr.png) here as well.
- Facebook Messenger: Go to sicklecellpedia.org or drepanopedia.org and click the Message button.

Note: Bilingual — SickleCellPedia (English) / DrepanoPedia (French).

---

# Page: SickleCellPedia Pro

Nav label: SickleCellPedia Pro
Title: SickleCellPedia Pro

Tagline: [TO ADD — one-line value prop for healthcare professionals]
Intro: A clinical decision-support tool for healthcare professionals in under-resourced settings (Sub-Saharan Africa, India, the Caribbean, and other underserved communities). [edit as needed]

Feature — Mandatory citations: Every answer is grounded in and cites trusted medical resources.
Feature — Chain-of-thought reasoning: Transparent, step-by-step clinical reasoning.
Feature — Multi-agent architecture: Purpose-built agents for accurate, context-aware support.
Feature — Credential-based access: Access restricted to verified healthcare professionals.
Feature — [TO ADD any additional]:

## Section: Register your interest

Anchor: /sicklecellpedia-pro#register
Lead-capture heading: Register your interest
Lead-capture subtext: [TO ADD — one line inviting HCPs to sign up; e.g. "Be among the first to try SickleCellPedia Pro. Tell us a little about yourself and we'll be in touch."]
Lead-capture form fields (captured, not just displayed):
- Full name (required)
- Email (required)
- Are you a healthcare professional? (required — Yes / No)
- Role / profession (optional; free text)
- Location — Country (required), City/region (optional)
- Interest / notes (optional)
- Consent checkbox (required): "I agree to be contacted by SCKIN about SickleCellPedia Pro." Link to /privacy.
Storage {PENDING — see Zacharie's Q on capture}: land submissions in a Google Sheet at launch (Claude Code wires a form → Sheets via a serverless API route), designed to migrate to the AWS contacts database later. See "Proposed contacts data model" at the end of this doc.
Confirmation message: [TO ADD — what the user sees after submitting; e.g. "Thanks — you're on the list. We'll email you when SickleCellPedia Pro is ready for early access."]

---

# Page: Responsible AI

Nav label: Responsible AI
Title: Responsible AI

## Section: Our approach

Intro: [TO ADD — SCKIN's approach to safe, trustworthy AI]
Guideline grounding & citations: [TO ADD]
Medical disclaimer: [TO ADD]
Known limitations: [TO ADD]
Evaluation & benchmarking: [TO ADD]
Data privacy: [TO ADD]

## Section: Human-in-the-Loop Surveys

Anchor: /responsible-ai#surveys
Intro: [TO ADD — explain the HITL evaluation program and why participation matters]
Who can participate: [TO ADD — patients, caregivers, clinicians, HCPs, MDs]
What's involved: [TO ADD — time commitment, what raters do]
Call to action: [TO ADD — e.g. "Become a rater"]
Survey link/embed: [TO ADD — Google Form link initially]

---

# Page: Publications

Nav label: Publications
Title: Publications
Intro: [TO ADD — e.g. "Presentations, publications, abstracts, and other contributions from SCKIN and our collaborators."]

The page has four sections, in this order: Presentations · Publications · Abstracts · Other Contributions. Entry format within each: Title · Authors/Presenter · Venue · Date · Link.

## Section: Presentations

### Can AI Be Trusted for Sickle Cell Disease Education? Introducing SickleCellPedia

Presenters: Zacharie Liman-Tinguiri (Executive Director, SCKIN); Dr. Lewis Thomas (Director for User Experience, SCKIN)
Venue: SCD Coalition Peer Learning Exchange (webinar)
Date: April 21, 2026
Description: A real-world case study of SickleCellPedia exploring how AI can support health education — its strengths, its limits, and strategies for using it wisely.
Link (poster): https://drive.google.com/file/d/11cAybCxHmocmXkZXVo_jNb_gW0_PMAC5/view?usp=drive_link (opens in a new window)
Image: publication-genai-safety-poster.jpg (poster thumbnail) — alt: "Poster — Can AI Be Trusted for Sickle Cell Disease Education?"

## Section: Publications

Source: New Globinoscope N°11 (July 2026), the magazine of the FilRougE-MCGRE rare-disease health network — https://filiere-mcgre.fr/wp-content/uploads/2026/07/New-Globinoscope-N%C2%B011-1.pdf (opens in a new window)
{PENDING — Claude could not open the PDF (it exceeds 20 MB and the host isn't reachable from the build sandbox). Zacharie: please paste the exact titles, authors, and page numbers of the two SCKIN articles in this issue. Placeholders below.}

### [Article 1 title — TO ADD]

Authors: [TO ADD]
Venue: New Globinoscope N°11, FilRougE-MCGRE
Date: July 2026
Link: https://filiere-mcgre.fr/wp-content/uploads/2026/07/New-Globinoscope-N%C2%B011-1.pdf (opens in a new window) [add page number]

### [Article 2 title — TO ADD]

Authors: [TO ADD]
Venue: New Globinoscope N°11, FilRougE-MCGRE
Date: July 2026
Link: https://filiere-mcgre.fr/wp-content/uploads/2026/07/New-Globinoscope-N%C2%B011-1.pdf (opens in a new window) [add page number]

## Section: Abstracts

### A specialized AI agent for sickle cell patient education in low-resource settings: a benchmarking evaluation

Presenting author: Mr Zacharie Liman-Tinguiri
Affiliation: Sickle Cell Knowledge and Information Network
Venue: ASCAT (Annual Sickle Cell and Thalassaemia Conference), London — Paper No. 226
Status: Accepted as Oral (forthcoming)
Date: 2026 {PENDING — confirm exact ASCAT 2026 dates for the entry}
Link: [TO ADD once available]

## Section: Other Contributions

### ASCAT abstract explorer (NotebookLM)

Description: After ASCAT 2025, Zacharie built a public NotebookLM notebook that lets anyone search through the conference abstracts.
Link: https://notebooklm.google.com/notebook/ec1fbc52-74dc-4f37-ab9b-ebda8b622e6b (opens in a new window)

---

# Page: News (landing)

Nav label: News
Title: Sickle Cell News
Status badge: In development — expected September 2026

Intro: Sickle Cell News is an AI-powered service that scans sickle cell coverage from around the world, checks it for reliability and usefulness, and shares concise summaries — here and on our social media channels — always linked to the original source. {Launch note: until September 2026, keep this brief and announce the feature without detailed taxonomy; the topic/geography filters ship later.}
Note: News posts are created and edited in the /admin CMS — not in this doc. At launch this page renders a simple card list; topic + geography filters are added in a later phase.

## Subpage: Blog

Route: /news/blog (linked from the News landing page)
Nav: reachable from the News landing page (not a separate top-level nav item unless you want one — {PENDING})
Title: SCKIN Blog
Intro: Announcements and updates from SCKIN — product improvements, impact updates, milestones, and organizational news.
Content source: authored by SCKIN in the /admin CMS (same editor as News). Distinct from the AI-classified News feed: Blog = SCKIN's own voice; News = summarized external coverage.
Entry format: Title · Author · Date · Body · Optional image · Optional tag (Announcement / Product / Impact)

---

# Page: Donations

Nav label: Donate (rendered as the nav CTA button, not a menu item)
Title: Support Our Work

Intro: [TO ADD — one or two lines on what donations fund]
Suggested amounts: [TO ADD — e.g. $25 / $50 / $100 / $250 / custom; one-time + recurring]
Tax note: The Sickle Cell Knowledge and Information Network is a 501(c)(3) not-for-profit organization (EIN 33-1763512). Donations are tax-deductible to the extent permitted by law.
Confirmation message: [TO ADD — what the donor sees after a successful donation]

---

# GLOBAL — NAVIGATION

Logo: sckin-logo.png (links to Home; Home is not a nav item)
Nav order: Mission · About ▾ (SCKIN · Our Board · Our Founder · Our Collaborators · Friends of SCKIN) · SickleCellPedia · SickleCellPedia Pro · Responsible AI ▾ (Our approach · Human-in-the-Loop Surveys) · Publications · News ▾ (Latest News · Blog)
Nav CTA button: Donate
Mobile behavior: collapse to hamburger menu

---

# GLOBAL / FOOTER (applies to all pages)

Contact email: contact@sckin.org
Facebook: facebook.com/profile.php?id=61561436170933
LinkedIn: linkedin.com/company/sickle-cell-knowlege-and-information-network/ {confirm slug spelling — "knowlege" as written; keep if that is the actual company URL}
Footer links: About, News, Feedback
Utility pages to keep: /whatsapp, /feedback

---

# OPEN ITEMS

RESOLVED (Jul 20, 2026):
- Stripe payout entity: the SCKIN entity whose EIN (33-1763512) is listed receives the funds. ✅
- Pro leads landing: Google Sheet at launch, designed to migrate to the AWS contacts database later. ✅
- News taxonomy: deferred — Zacharie will build the topic/geography lists by September. Announce the feature now without detailed taxonomy. ✅
- Logo usage permissions: dropped for now; use scraped versions. ✅

STILL OPEN:
- Language: bilingual (EN/FR) at launch, or English first?
- Domain/DNS: plan for moving sckin.org off GoDaddy (registrar) + DNS cutover to Vercel.
- Revoke/regenerate the Meta Graph API token that was pasted into v1 of this doc (exposed credential). Store the replacement in AWS Secrets Manager only — never in this doc.

---

# OUTLINE — SCKIN Website Redesign — Requirements

*v2 · July 2026 · concise spec for build*

## 1. Goal

Replace the Squarespace site with a cheaper, faster, more customizable and more aesthetic site. Migrate content from sckin.org, restructure the page set, and lay groundwork for the SickleCellPedia MCP server (which will later replace the Voiceflow RAG, the WhatsApp RAG, and power SickleCellPedia Pro).

## 2. Stack (locked)

- Framework: Next.js
- Hosting: Vercel (Pro plan, team: sckin)
- Source of truth: GitHub (sckin-org/sckin-website), auto-deploy on push; branch + PR workflow — never push directly to main
- Domain: sckin.org
- Content: Google Doc → static pages; Git-based CMS at /admin → News
- Donations: custom Stripe checkout
- Cost target: substantially below Squarespace ~$276+/yr

## 3. Sitemap

| Page | Purpose |
| --- | --- |
| Home | Mission + the tools SCKIN uses to fulfill it; primary CTAs |
| Mission | Mission, Vision, Hypothesis, Use cases (one page) |
| About | Anchor sections: SCKIN · Our Board · Our Founder · Our Collaborators · Friends of SCKIN |
| SickleCellPedia | Dedicated page, Voiceflow chatbot embedded |
| SickleCellPedia Pro | Email + interest capture for medical professionals; key features |
| Responsible AI | Our approach + Human-in-the-Loop Surveys (anchor section) |
| Publications | Peer-reviewed work, abstracts, posters |
| News | Posts filterable by topic + geography; phase-2 auto-repost to FB/LinkedIn |
| Donations | Custom Stripe checkout |

### Navigation (locked)

[SCKIN logo → Home]
Mission
About ▾ — SCKIN · Our Board · Our Founder · Our Collaborators · Friends of SCKIN
SickleCellPedia
SickleCellPedia Pro
Responsible AI ▾ — Our approach · Human-in-the-Loop Surveys
Publications
News
[ Donate ]

Home is reached via the logo (not a nav item). Site search is deferred to phase 2.

Keep existing utility routes: /whatsapp, /feedback. Consolidate current /journal into News.

Content boundary — Publications vs News: Publications = peer-reviewed work, abstracts, posters (EHA, ASCAT, SCDAA, Globinoscope). News = announcements, partnerships, events, updates.

## 4. Per-page requirements

Home — Hero with mission line ("make useful and reliable information about SCD universally accessible"); the SCD burden stats (7.7M worldwide, 90% Global South, life-expectancy gap); an "Our Tools" section linking SickleCellPedia, Pro, WhatsApp; email signup; primary CTAs (Try SickleCellPedia, Donate).

Mission — Four clearly separated blocks: Mission, Vision, Hypothesis (information gap → life-expectancy gap), Use cases (patient, caregiver, clinician, under-resourced HCP).

SickleCellPedia — Voiceflow web chat embedded (Production Project ID 684db2d2921b2a3ad5910594); how-to-access (web widget, WhatsApp +1 555 751 3738, Facebook Messenger); QR code; EN/FR (SickleCellPedia / DrepanoPedia).

SickleCellPedia Pro — Value prop for HCPs in under-resourced settings; key features (multi-agent, mandatory citations, chain-of-thought, credential-based access); lead-capture form (email + role + interest) → stored for follow-up. Form submit handled by a serverless function (API route).

Responsible AI — SCKIN's approach to safe, trustworthy AI: guideline grounding and mandatory citations, medical disclaimer, known limitations, evaluation and benchmarking, data privacy. Includes Human-in-the-Loop Surveys as an anchor section (HITL evaluation program, who can participate, what's involved, rater CTA, survey embed).

Publications — Peer-reviewed work, abstracts and posters (EHA, ASCAT, SCDAA, Globinoscope). Each entry: title, authors, venue, date, link/PDF.

Donations — Custom Stripe checkout (one-time + recurring); suggested amounts; 501(c)(3) tax-deductibility note; confirmation state.

News — Card list; filters: topic + geography (client-side at launch); each post has title, body, date, topic tag(s), geography tag(s), image. Phase 2: publishing auto-reposts to Facebook + LinkedIn.

Human-in-the-Loop Surveys — Explain HITL evaluation program; recruit raters/participants; link/embed survey (Google Forms initially).

About — 501(c)(3) statement + status link; board grid; founder section; collaborators; Friends of SCKIN (empty at launch).

## 5. Content management

- Static pages (Home, Mission, About, Pedia, Pro, Responsible AI, Publications, Donations): authored in one Google Doc, section-per-page; Claude parses and commits to GitHub → Vercel rebuilds. (See template convention provided separately.)
- News: created/edited in the Git CMS at /admin (visual editor, commits to GitHub). Non-technical team can post.
- Images: staged in shared Website > Images folder; committed to public/images/team/ and public/images/logos/ in the repo.

## 6. Design tokens (Apple × Red Cross blend)

Direction: Apple's generous whitespace, large clean type, restraint, product-led sections + Red Cross's mission-red trust, humanitarian clarity, strong CTAs.

| Token | Value |
| --- | --- |
| --color-primary (SCKIN red) | #C41E3A |
| --color-ink | near-black #16161A |
| --color-bg | white #FFFFFF |
| --color-surface | off-white #FAFAF8 |
| --color-muted | grey #5C5C56 |
| Type — headings | large, tight, humanist sans (e.g. Inter / SF-like) |
| Type — body | 16–18px, high line-height for readability |
| Radius | 12–16px (soft, Apple-like) |
| Layout | wide margins, sectioned scroll, few elements per view |
| Imagery | human-centered, warm, high-contrast |
| CTAs | solid red primary, generous tap targets |

*Full token set to be finalized in a tokens.css / theme file during build.*

## 7. Phasing

- Phase 1 (launch): Next.js on Vercel; all pages; Voiceflow embed; Stripe donations; Pro lead capture; News with filters; Google Doc + CMS workflow; content migrated.
- Phase 2: News → auto-repost to Facebook + LinkedIn (Apps Script/Zapier).
- Phase 3: SickleCellPedia MCP server; replaces Voiceflow RAG + WhatsApp RAG; powers Pro.

## 8. Open items

- Stripe: entity confirmed (EIN 33-1763512 receives funds). Remaining: add the real API key to Vercel env vars at launch.
- Pro leads + newsletter: land in a Google Sheet at launch; migrate to the AWS contacts database later (see "Proposed contacts data model").
- News taxonomy: deferred to September (Zacharie to build topic/geography lists).
- Confirm EN/FR scope at launch (bilingual now vs. later).
- Confirm domain/DNS move plan off Squarespace (DNS cutover to Vercel; registrar move to Cloudflare post-launch).

---

# i/o — Remaining steps, in order

1. Vercel ↔ GitHub is connected — every merge to main deploys live. Work on branches + PRs only. ✅
2. Paste remaining page content into content/*.md — Mission, About, SickleCellPedia, Pro, Responsible AI, Publications, Donate. Home is done.
3. Collect images → public/images/ with alt text (team photos → public/images/team/, logos → public/images/logos/).
4. Design in Claude Design — Home first, plus Publications entries and News cards/filters so the component set is complete. Export the handoff bundle.
5. Claude Code builds the components from the handoff bundle and wires them to the content files.
6. Integrations — Voiceflow embed, Pro lead-capture form (serverless), Stripe donations, the embed/licensing form link.
7. News filters + taxonomy — needs your fixed topic and geography lists.
8. QA — run the design-review skill against the preview deployment, plus accessibility (WCAG AA — that strong red needs contrast checks), mobile, and performance.
9. Domain cutover — lower TTL a few days ahead, point sckin.org DNS at Vercel, keep Squarespace live until it resolves.
10. Post-launch — CMS at /admin for the team, news auto-repost to FB/LinkedIn, registrar move to Cloudflare, then the MCP server.

## Dated action items

| Date | Item |
| --- | --- |
| Jul 13, 2026 | Update the privacy policy to encompass capture of email information on the website. Update the terms of service. Add them as standalone web pages. |
| Jul 16, 2026 | https://developers.facebook.com/apps/1000244904758270/settings/basic/?business_id=1434860120499973 — link to the App Web Page. |
| Jul 13, 2026 | For the life-expectancy quote on the main page is there a visual that works? |
| Jul 13, 2026 | Test the contact form (https://docs.google.com/forms/d/1jsZ5iG6P6Kou4ysZPi9VO30FyKx10d0jjfwe2lhT-nE/edit) to ensure that notifications are received. |
| Jul 17, 2026 | At Launch: add the Stripe REAL API key to Vercel (Environment Variables). |
| Jul 20, 2026 | Revoke/regenerate the exposed Meta Graph API token from v1 of this doc; store replacement in AWS Secrets Manager. |
| Jul 20, 2026 | Provide the two New Globinoscope N°11 article titles/authors/pages for the Publications page. |
| Jul 20, 2026 | Confirm exact ASCAT 2026 dates for the abstract entry. |
| Date | Migrate SCKIN/WHATSAPP (should we call it TERMS). |
| Date | For Voiceflow > WhatsApp > Update language settings to allow all. |

---

# LEGACY — Tab 4 (original Home draft — superseded by Page: Home; retain for reference or delete)

Nav label: Home
Title: Sickle Cell Knowledge and Information Network (SCKIN)

The Sickle Cell Knowledge and Information Network (SCKIN) is a not for profit organization that aims to improve the lives of people, families and communities, with sickle cell disease by making useful and reliable information about sickle cell disease universally accessible.

Stat 1: Sickle Cell Disease is the most commonly inherited genetic disorder, affecting 7.7M people worldwide, at least 100K in the United States.

Stat 2: 90% of patients live in the Global South (Nigeria ~4M or 2% of the population, India ~1.2M or 1/1000 of the population, DRC ~900K ~1% of the population). Life expectancy of a patient in Nigeria is 21 years; in France, 54 years. Life expectancy in the global south is 30 years less than in developed countries. Life expectancy in developed countries is 20 years less than unaffected individuals.

Our Hypothesis line: Sickle Cell care is under-resourced in all countries. More than material resources, knowledge is the gap. We believe making useful and reliable information about Sickle Cell Disease universally accessible can reduce the information gap, reduce the life-expectancy gap, and improve patients' lives.

To support our mission, we leverage the transformative power of artificial intelligence technology to propagate useful and reliable information.

Our Tools intro: The tools we use to fulfill our mission:
Tool 1: SickleCellPedia (EN) / DrepanoPedia (FR) — a free, AI-enabled model, trained on reliable content, programmed to give useful, reliable answers about Sickle Cell Disease. SickleCellPedia is available on web (try it here), Facebook, and WhatsApp.
Tool 2: SickleCellPedia Pro — clinical decision support for healthcare professionals in under-resourced settings. SickleCellPedia Pro is currently under development and will be available in Q4 of 2026.
Tool 3: SickleCell News is an AI-powered news classifier: it reads the news about sickle cell disease, verifies its reliability and usefulness, and provides summaries with links to the original news source.

Primary CTA: Try SickleCellPedia and Provide Feedback.
Secondary CTA: Donate to support our work.
Tertiary CTA: Embed our model into your Organization.

Email signup heading: Leave us your email to stay informed
Email signup subtext: Sign up with your email address to receive news and updates. We value and respect your privacy.

---

# APPENDIX — Proposed contacts data model (Google Sheet now → AWS later)

**Purpose:** one place to capture every "leave-your-details" intent on the site (newsletter signup, SickleCellPedia Pro interest, and any future forms) so they can be managed together and later migrated to AWS without reshaping the data.

## Phase 1 — Google Sheet (launch)

One spreadsheet, one tab per intent OR one combined tab with a `source` column. Recommended: **one combined tab** so migration is a single import. Columns:

| Column | Type | Notes |
| --- | --- | --- |
| id | string | UUID generated by the API route on submit |
| created_at | timestamp | ISO 8601, UTC |
| source | enum | `newsletter` · `pro_interest` (extensible) |
| full_name | string | required for pro_interest; optional for newsletter |
| email | string | required; basic format validation |
| is_healthcare_professional | boolean | pro_interest only (Yes/No) |
| role | string | optional free text |
| country | string | required for pro_interest |
| city_region | string | optional |
| notes | string | optional |
| consent | boolean | must be true to store |
| locale | enum | `en` · `fr` (which site language they used) |
| status | enum | `new` · `contacted` · `archived` (manual triage) |

Claude Code can create the Sheet, wire each form to it through a serverless API route (a Google service-account writes rows server-side — the key lives in Vercel env vars, never in the browser), and validate + dedupe on email before writing.

## Phase 2 — AWS contacts database (migration target)

Two clean options; pick per how relational you want it:

**Option A — DynamoDB (simplest, serverless, cheapest at low volume)**
- Table `sckin_contacts`, partition key `email`, sort key `source#created_at`.
- One item per intent; a person who signs up for the newsletter and Pro interest has two items sharing the same email — easy to query "all intents for X".
- Attributes mirror the Sheet columns above. Add a GSI on `source` to pull "all Pro-interest leads."
- Fits the existing serverless/Secrets-Manager pattern; no server to run.

**Option B — PostgreSQL (RDS / Aurora Serverless), if you want reporting + joins**
- `contacts` table (id, email UNIQUE, full_name, created_at, locale, status).
- `intents` table (id, contact_id FK, source, is_hcp, role, country, city_region, notes, consent, created_at) — one row per submission, so one contact can have many intents.
- This is the same shape as the combined Sheet, normalized. Better for future segmentation, newsletter exports, and analytics; a little more infra than DynamoDB.

**Recommendation:** Ship the combined Google Sheet now. If SickleCellPedia Pro and the newsletter stay simple, DynamoDB (Option A) is the lightest migration and matches your serverless stack. Move to Postgres (Option B) only when you need real reporting/segmentation — which likely coincides with SickleCellPedia Pro's own AWS backend (Bedrock/S3/PostgreSQL), so the contacts DB can live alongside it. Either way, the Phase-1 column set is a superset of both, so migration is a straight import with no field redesign.

**Migration note:** keep `email` as the natural key throughout so a Sheet → DynamoDB/Postgres import needs no ID reconciliation. Preserve `consent` and `created_at` on migration (compliance).
