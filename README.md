# Micro Quiz Bank

A static, self-grading quiz site built from the Module 1–24 course materials: Quiz 1 and Quiz 2 for every module, Quiz 3 for Modules 9–24, and six cumulative practice tests (1–2 cover Modules 1–8; 3–4 cover Modules 9–17; 5–6 cover Modules 18–24).

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
navigator/index.html  Micro Navigator — flowcharts, check-my-work tools, and study-guide Q&A for Modules 9–24
drill/index.html      Micro Practice Bank — 2,032 questions (830 scenarios + 1,202 direct), Modules 1–24, "why not" explanations for every wrong choice, Google Sheet sync
drill/Code.gs         Apps Script for the practice bank's Google Sheet (setup steps in drill/SHEET_SETUP.md)
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

## Lab final section (Labs 1–12)

- `data/lab1.json` … `data/lab12-2.json` — two quizzes per lab, plus `data/lab1-3.json` (biochemistry review) and `data/lab5-3.json` (microscope parts). Rebuilt 11 Nov 2026 to match the instructor's reduced Comprehensive Lab Practical study guide; photos are shown whole (tap to open full size) (391 questions, 158 with photos). Photo questions add an `img` field; `assets/quiz.js` shows the photo above the choices.
- `lab-img/` — 138 photos cropped from the lab slides and manuals.
- `lab-drill/index.html` — Micro Lab Practice Bank (all lab questions; Written and Photo ID banks). It syncs to its **own** Google Sheet: deploy `lab-drill/Code.gs` in a new Sheet and paste that /exec URL into the lab bank's sync panel (see `lab-drill/SHEET_SETUP.md`).

## Recall mode (active recall)

- Quiz pages: tick **Recall mode** under the score bar. The choices stay hidden; type (or just think) your answer, tap **Reveal answer**, then mark **Got it** or **Missed it**. The setting is remembered per browser.
- Practice Banks (lecture and lab): set **Answer style → Recall first** before starting. Enter reveals, G = got it, M = missed it. A reveal is checkpointed, so a reload resumes on the grading step. Self-grades count like normal answers (stats, missed list, Google Sheet sync); a "missed it" is sent with no letter picked.
