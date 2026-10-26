# Ekrem Alimi — Academic Portfolio

A dependency-free academic portfolio presenting Ekrem Alimi's research, publications,
appointments, teaching, education, projects, conference activity, and scholarly profiles.

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Structure

- `index.html` contains the semantic page structure and core academic profile.
- `academic-data.js` stores appointments, education, publications, conferences, projects,
  and knowledge-exchange records.
- `styles.css` provides the responsive editorial layout and print résumé styling.
- `script.js` renders the structured records and adds search, filters, navigation,
  citation copying, animation, and print controls.
- `favicon.svg` is the EA monogram mark.
- `.assetsignore` keeps Git metadata and development files out of Cloudflare assets.

No package installation or build step is required.
