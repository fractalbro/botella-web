# Botella

Facts confirmed by Cesar (founder) in the project between Nov 15 and Nov 26, 2026. Nothing here is invented; open decisions are marked.

## What it is
A voice app for Lima. You record a question or something you want to tell, up to 60 seconds, and "throw it into the sea." It reaches 8 people with similar tastes. If nobody answers within 6 hours, it reaches 4 more. Whoever wants to replies with their own voice. Voices are never modified.

## Who it is for
Adults (18+) in Lima who want to talk with someone new. The beta is invite-only, for the first 100 people.

## Purpose and position
- Fight loneliness. The site opens with the opportunity, not the problem: "if one in six people feels lonely (WHO, 2025), nobody is as alone as they think."
- A voice brings people closer than text. You are worth what you say, not how you look. No photos, no likes, no followers, no swiping.
- Everyone has an account, but nobody sees your name at first. Before names, what shows is a shared topic ("someone who loves cinema"), never the district. Names appear only when both people put in their "key."
- Rituals: the tide rises every night at 21:00, answering earns you one more bottle, the "lacre" seal is a gift, the key, and plans in public places.

## Surface: website (botella-web)
- Job: explain the product in seconds, let people hear real sample voices, and sign them up. The sign-up uses Supabase `join_waitlist` and gives an access link right away while spots remain, then a waitlist. Each person gets their own invite link `?de=`.
- Static HTML/CSS/JS, no build, deployed on Vercel.
- Platform: mobile web first (iPhone SE and 13 mini are the reference screens), then desktop.

## Brand commitments
- The website must look like the same product as the app (repo botella-app, design system `ds.css`). Cesar's call on Nov 26: the web must not invent a separate identity.
- Tone: positive, in the style of Seth Godin and Rory Sutherland, with no jargon. The text never names "harassment."
- Cesar rejects generic design (typical AI-made-site look). He wants the quality of a top SaaS product.

## Safety copy
Botella is not a professional support service. Line 113, option 5 (free).
