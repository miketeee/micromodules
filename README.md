# Micro Quiz Bank

A static, self-grading quiz site built from the Module 1–8 study guides plus two cumulative practice tests.

## Publishing to GitHub Pages

1. Create a new repository on GitHub (public, or private if you have GitHub Pro — Pages needs a public repo on the free tier).
2. Unzip this folder and push its **contents** (not the folder itself) to the repo root:
   ```
   git init
   git add .
   git commit -m "Micro quiz bank"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages** → under "Build and deployment," set **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a URL like `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## File structure

```
index.html          homepage — links to every quiz
quiz/index.html      generic quiz runner (reads ?q=<slug> from the URL)
assets/style.css      shared styles
assets/quiz.js         grading logic — fetches data/<slug>.json and renders it
data/*.json            one file per quiz/practice test (questions, options, correct answers, explanations)
```

## Editing a quiz

Each quiz is a JSON file in `data/`. To fix a question, edit its `prompt`, `options`, `correct` (the letter), or `explanation` field directly — no HTML editing needed. Open-recall questions have an empty `options` list and no `correct` letter; their `explanation` is the answer shown on "Reveal answer."

## Local preview

From this folder: `python3 -m http.server 8000`, then open `http://localhost:8000`.
