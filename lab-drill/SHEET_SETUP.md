# Lab Practice Bank — Google Sheet setup

The Lab Practice Bank syncs to its **own** Google Sheet, so lab progress and your lab deadline goal never mix with the lecture Practice Bank. Follow the same steps as the lecture bank, using `lab-drill/Code.gs`:


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
- **Goal** — your deadline goal (finish-by date, modules, and banks). Set it on any device and the others pick it up; the newest change wins.

Notes:
- Answers are saved in the browser first, then sent. If the connection drops, they wait and go through on the next try.
- Use the same URL and phrase on your phone and computer and both share one history.
- If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
- **Already set up before the deadline goal was added?** Paste the new `Code.gs` over the old one, keep your same SECRET line, then **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Your URL and phrase stay the same, and nothing on the site needs re-entering.
- **Modules 1–8 added (Test 1 material).** Paste the newest `Code.gs` over the old one the same way (keep your SECRET line, then Manage deployments → Edit → New version → Deploy). The newer script is what lets a goal of "all 17 modules" sync between devices. If you skip this, an all-17 goal still works on the device where you set it, but your other devices will read it as Modules 9–17. Goals you set before this update stay at Modules 9–17 until you change them.
- The claude.ai preview can't reach Google; sync only works from your GitHub Pages copy.
- **Unit 3 added (Modules 18–24).** Paste the newest `Code.gs` over the old one again (keep your SECRET line, then Manage deployments → Edit → New version → Deploy). It's what lets an "every module" goal (1–24) sync between devices; with the old script, your other devices would read that goal as Modules 9–17. Your current goal stays on the modules it already had. To add Unit 3 to it, open the goal, select the modules you want (or **All**), and tap **Use current module selection**.
