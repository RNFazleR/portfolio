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
