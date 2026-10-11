/**
 * Micro Practice Bank — Google Sheet sync (Apps Script web app)
 *
 * 1. Change SECRET below to your own phrase. Type the same phrase into the site's sync panel.
 * 2. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone.
 * 3. Copy the Web app URL (ends in /exec) into the site's sync panel.
 *
 * The site sends every answer here. Each answer becomes one row on the "Attempts" tab and
 * is never deleted, so the Sheet keeps your full history. The "Summary" tab is rebuilt after
 * every sync with one row per question (times seen, times right, last result).
 */
const SECRET = 'change-this-phrase';

const ATTEMPTS = 'Attempts';
const SUMMARY = 'Summary';
const HEAD = ['uid', 'When', 'ts', 'Device', 'Bank', 'Module', 'Question ID', 'Q#', 'Question', 'Picked', 'Correct?', 'Source', 'Seen', 'Right'];
const LETTERS = 'ABCD';

function doGet(e) {
  const key = e && e.parameter ? e.parameter.key : '';
  if (key !== SECRET) return out_({ ok: false, error: 'Wrong secret phrase' });
  return out_({ ok: true, stats: stats_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'Bad request' }); }
  if (!body || body.key !== SECRET) return out_({ ok: false, error: 'Wrong secret phrase' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = attempts_();
    const have = new Set();
    const last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach(function (r) { have.add(String(r[0])); });
    const rows = [];
    (body.attempts || []).forEach(function (a) {
      if (!a || !a.uid || have.has(String(a.uid))) return;   // already saved — safe to resend
      have.add(String(a.uid));
      const picked = Array.isArray(a.picked) ? a.picked.map(function (i) { return typeof i === 'number' ? LETTERS[i] : i; }).join('') : (a.picked || '');
      rows.push([a.uid, new Date(a.ts || Date.now()), a.ts || Date.now(), a.device || '', a.exam || '', a.topic || '', a.id, a.n || '', a.q || '',
                 picked, a.ok ? 'right' : 'wrong', a.source || 'answer', a.source === 'baseline' ? (a.seen || 0) : 1, a.source === 'baseline' ? (a.right || 0) : (a.ok ? 1 : 0)]);
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEAD.length).setValues(rows);
    const stats = stats_();
    summary_(stats);
    return out_({ ok: true, stats: stats, added: rows.length });
  } finally {
    lock.releaseLock();
  }
}

/* one entry per question: seen, right, last result, when, and a dated list of misses */
function stats_() {
  const sh = attempts_();
  const n = sh.getLastRow() - 1;
  const st = {};
  if (n < 1) return st;
  sh.getRange(2, 1, n, HEAD.length).getValues().forEach(function (r) {
    const id = String(r[6]); if (!id) return;
    const ts = Number(r[2]) || 0, ok = r[10] === 'right', src = r[11];
    const s = st[id] || (st[id] = { seen: 0, right: 0, last: null, lastAt: 0, misses: [], bank: r[4], topic: r[5], q: r[8] });
    if (src === 'baseline') { s.seen += Number(r[12]) || 0; s.right += Number(r[13]) || 0; }
    else { s.seen++; if (ok) s.right++; else s.misses.push([ts, String(r[9])]); }
    if (ts >= s.lastAt) { s.lastAt = ts; s.last = ok; }
  });
  return st;
}

function summary_(stats) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  sh.clearContents();
  const rows = [['Question ID', 'Bank', 'Module', 'Question', 'Seen', 'Right', 'Wrong', 'Last result', 'Last answered']];
  Object.keys(stats).sort().forEach(function (id) {
    const s = stats[id];
    rows.push([id, s.bank || '', s.topic || '', s.q || '', s.seen, s.right, s.seen - s.right, s.last ? 'right' : 'wrong', s.lastAt ? new Date(s.lastAt) : '']);
  });
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.setFrozenRows(1);
}

function attempts_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(ATTEMPTS);
  if (!sh) { sh = ss.insertSheet(ATTEMPTS); sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]); sh.setFrozenRows(1); sh.hideColumns(1); sh.hideColumns(3); }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
