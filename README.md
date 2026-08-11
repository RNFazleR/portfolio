# Fazle — Personal OS

Personal portfolio for Rifat Naufal Fazle.

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


## Case-study projects

Click **Read the case ↗** on a project card. Each project now has a richer case-study view with:
- project context
- stack tags
- key highlights
- an interactive-style pipeline
- problem / approach / result sections

Edit these fields in `data/projects.json` to expand each project later.
