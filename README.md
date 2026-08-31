# Fazle — Personal OS

Personal portfolio for Rifat Naufal Fazle Rabb.

## Local development

Because the site loads JSON files with `fetch()`, serve the folder through a local server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

GitHub Pages is configured from the `main` branch.

After editing:

```bash
git add .
git commit -m "Update portfolio"
git push
```

## Data

Most personal content lives in `data/`:

- `site.json` — identity and links
- `projects.json` — projects
- `experience.json` — experience
- `skills.json` — skills
- `articles.json` — writing
- `now.json` — current focus

## Assets

`assets/projects/<project-id>/` holds real screenshots for a project's case-study gallery — referenced from that project's `screenshots` field in `data/projects.json` (see below). Keep images reasonably sized (a few hundred KB each); the site has no build step to compress them.

## Case-study projects

Click **Read the case ↗** on a project card. Each project has a case-study view built from its entry in `data/projects.json`:

- category / year / status header, title and tagline
- stack tags
- key highlights (4 short stat cards)
- an interactive-style pipeline
- problem / approach / result sections
- an optional screenshot gallery
- an optional "what I learned" section
- a footer with GitHub / Live Demo / Documentation links (or a single generic link for older entries)

### Project card visuals

Each project's grid-card visual is chosen in `app.js` (`projectVisual()`) based on its `category`, and — for Biomedical projects — its `visualType` field (e.g. `"emg"`, `"spectrogram"`). This is deliberate: the visual is never picked by the project's position/index in the list, so filtering or reordering projects can't accidentally swap visuals between unrelated projects.

### Adding a new project

Add an object to `data/projects.json` with at least:

```json
{
  "id": "kebab-case-id",
  "title": "Project Title",
  "category": "Biomedical",
  "status": "Completed",
  "year": "2026",
  "stack": ["Python", "..."],
  "short": "One-sentence card description.",
  "tagline": "Short case-study subtitle.",
  "problem": "...",
  "approach": "...",
  "result": "...",
  "pipeline": ["Step 1", "Step 2", "..."],
  "highlights": [["Label", "Value"], ["Label", "Value"], ["Label", "Value"], ["Label", "Value"]],
  "details": "Longer 'the idea' paragraph.",
  "link": "#",
  "links": { "github": "#" }
}
```

Optional fields: `learned` (adds a "What I learned" section), `screenshots` (array of `{ "src": "assets/projects/<id>/file.png", "caption": "..." }`, adds a gallery section), `visualType` (picks a specific card visual within a category). Use `"#"` for links you don't have yet — the UI shows "coming soon" instead of inventing a URL. No HTML/JS changes are needed for a new project unless it needs a new category or a new card visual.
