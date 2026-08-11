# FAZLE / PERSONAL OS

A modular personal website based on the agreed information architecture:
Home → About → Experience → Projects → Lab → Writing → Markets → Now → Contact.

## Run locally

Because content is separated into JSON files, use a small local server instead of double-clicking index.html.

### Easiest
If Python is installed:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Where to edit content

All content is in `data/`:
- site.json
- projects.json
- articles.json
- experience.json
- skills.json

Visual/UI is in:
- style.css

Interaction is in:
- app.js

Main structure:
- index.html

## Important
Replace the placeholder email and external profile URLs in `data/site.json`.

No analytics, cookies, scraping, or third-party runtime scripts are included.


## Personal layer v2
The site now includes a stronger personal identity, cursor-reactive hero, magnetic buttons,
scroll reveals, an expanded "Currently obsessed with" section, and more personal metadata.
