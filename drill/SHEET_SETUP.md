# Connect the Micro Practice Bank to a Google Sheet

Same setup as the CCMA practice site, but with its own new Sheet so micro answers never mix with CCMA answers.

1. Create a new blank Google Sheet (name it something like **Micro Practice Bank**).
2. In the Sheet: **Extensions → Apps Script**. Delete the starter code and paste everything from `Code.gs` (in this folder).
3. Near the top, change `SECRET = 'change-this-phrase'` to your own secret phrase. Save.
4. **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and approve the permissions prompt.
5. Copy the **Web app URL** (it starts with `https://script.google.com/` and ends with `/exec`).
6. On your GitHub Pages copy of the site, open **Drill** → click **Google Sheet: not connected** → paste the URL and your secret phrase → **Connect and sync**.

What you'll see in the Sheet:
- **Attempts** — one row per answer (when, device, bank, module, question, what you picked, right/wrong). Nothing is ever deleted.
- **Summary** — one row per question: times seen, right, wrong, last result. Rebuilt after every sync.

Notes:
- Answers are saved in the browser first, then sent. If the connection drops, they wait and go through on the next try.
- Use the same URL and phrase on your phone and computer and both share one history.
- If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
- The claude.ai preview can't reach Google; sync only works from your GitHub Pages copy.
