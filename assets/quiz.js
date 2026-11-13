(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('q');
  const root = document.getElementById('quiz-root');

  if (!slug) {
    root.innerHTML = '<p>No quiz specified.</p>';
    return;
  }

  fetch('../data/' + slug + '.json')
    .then((r) => {
      if (!r.ok) throw new Error('not found');
      return r.json();
    })
    .then(renderQuiz)
    .catch(() => {
      root.innerHTML = '<p>Could not load that quiz. <a href="../index.html">Back to all quizzes.</a></p>';
    });

  function renderQuiz(data) {
    document.title = data.title + ' Quiz — Micro Quiz Bank';

    const state = {
      answered: new Array(data.questions.length).fill(false),
      correct: new Array(data.questions.length).fill(false),
    };

    const gradable = data.questions.filter((q) => q.type !== 'Open recall').length;
    let recall = false;
    try { recall = localStorage.getItem('micro-recall') === '1'; } catch (e) {}

    const head = document.createElement('div');
    head.className = 'quiz-head';
    head.innerHTML =
      '<a class="back-link" href="../index.html">&larr; All quizzes</a>' +
      '<p class="site-mark">MICRO QUIZ BANK</p>' +
      '<h1 class="quiz-title">' + esc(data.title) + '</h1>' +
      '<p class="quiz-sub">' + esc(data.subtitle) + ' &middot; ' + data.questions.length + ' questions</p>';
    root.appendChild(head);

    const scoreBar = document.createElement('div');
    scoreBar.className = 'score-bar';
    scoreBar.innerHTML =
      '<div class="score-row"><span>answered <span id="ans-count">0</span>/' + data.questions.length + '</span>' +
      '<span class="num-correct"><span id="correct-count">0</span>/' + gradable + ' correct</span></div>' +
      '<div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>' +
      '<button class="restart-btn" id="restart-btn">restart quiz</button>' +
      '<label class="recall-toggle"><input type="checkbox" id="recall-toggle"' + (recall ? ' checked' : '') + '> Recall mode <span>hide the choices until you answer from memory</span></label>';
    root.appendChild(scoreBar);

    const list = document.createElement('div');
    list.id = 'question-list';
    root.appendChild(list);

    data.questions.forEach((q, i) => renderQuestion(q, i));

    const finishBanner = document.createElement('div');
    finishBanner.className = 'finish-banner';
    finishBanner.id = 'finish-banner';
    root.appendChild(finishBanner);

    document.getElementById('recall-toggle').addEventListener('change', (e) => {
      try { localStorage.setItem('micro-recall', e.target.checked ? '1' : '0'); } catch (err) {}
      window.location.reload();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      window.location.reload();
    });

    function renderQuestion(q, i) {
      const card = document.createElement('div');
      card.className = 'question';
      card.id = 'q-' + i;

      const meta = document.createElement('div');
      meta.className = 'q-meta';
      meta.textContent = 'Q' + q.num + ' \u00b7 ' + q.type.toUpperCase();
      card.appendChild(meta);

      const prompt = document.createElement('p');
      prompt.className = 'q-prompt';
      prompt.textContent = q.prompt;
      card.appendChild(prompt);

      if (q.img) {
        const fig = document.createElement('a');
        fig.className = 'q-img'; fig.href = q.img; fig.target = '_blank'; fig.rel = 'noopener';
        fig.title = 'Open full-size photo';
        fig.innerHTML = '<img loading="lazy" alt="Photo for question ' + q.num + '" src="' + esc(q.img) + '">';
        card.appendChild(fig);
      }

      if (q.type === 'Open recall') {
        const btn = document.createElement('button');
        btn.className = 'reveal-btn';
        btn.textContent = 'Reveal answer';
        btn.addEventListener('click', () => {
          const exp = document.createElement('div');
          exp.className = 'explanation';
          exp.textContent = q.explanation;
          card.appendChild(exp);
          btn.remove();
          markAnswered(i, true);
        });
        card.appendChild(btn);
      } else {
        const opts = document.createElement('div');
        opts.className = 'options';
        q.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.className = 'option';
          btn.innerHTML = '<span class="letter">' + opt.letter + '</span><span>' + esc(opt.text) + '</span>';
          btn.addEventListener('click', () => handleAnswer(i, opt.letter, q, opts, card));
          opts.appendChild(btn);
        });
        card.appendChild(opts);
        if (recall) {
          opts.hidden = true;
          const box = document.createElement('div');
          box.className = 'recall-box';
          box.innerHTML = '<label class="recall-label">Answer from memory first</label>' +
            '<textarea rows="2" placeholder="Type or just think your answer (optional)"></textarea>' +
            '<button class="reveal-btn">Reveal answer</button>';
          box.querySelector('button').addEventListener('click', () => {
            const typed = box.querySelector('textarea').value.trim();
            box.innerHTML = typed ? '<p class="recall-typed"><strong>Your answer:</strong> ' + esc(typed) + '</p>' : '';
            opts.hidden = false;
            showSolution(q, opts, card, null);
            const grade = document.createElement('div');
            grade.className = 'recall-grade';
            grade.innerHTML = '<span>Did you get it?</span><button class="got">Got it</button><button class="miss">Missed it</button>';
            grade.addEventListener('click', (ev) => {
              const b = ev.target.closest('button'); if (!b) return;
              const ok = b.classList.contains('got');
              grade.innerHTML = '<span class="' + (ok ? 'got-done' : 'miss-done') + '">' + (ok ? 'Marked: got it' : 'Marked: missed it') + '</span>';
              markAnswered(i, ok);
            });
            card.appendChild(grade);
          });
          card.insertBefore(box, opts);
        }
      }

      list.appendChild(card);
    }

    function handleAnswer(i, chosenLetter, q, optsEl, card) {
      const isCorrect = showSolution(q, optsEl, card, chosenLetter);
      markAnswered(i, isCorrect);
    }

    // chosenLetter null = recall mode reveal (no pick): show the answer, and every wrong choice's reason
    function showSolution(q, optsEl, card, chosenLetter) {
      const buttons = Array.from(optsEl.querySelectorAll('.option'));
      buttons.forEach((b) => (b.disabled = true));
      const isCorrect = chosenLetter === q.correct;
      buttons.forEach((b, idx) => {
        const letter = q.options[idx].letter;
        if (letter === q.correct) b.classList.add('correct');
        else if (letter === chosenLetter && !isCorrect) b.classList.add('chosen-wrong');
      });
      const exp = document.createElement('div');
      exp.className = 'explanation';
      exp.textContent = (chosenLetter === null ? 'Answer: ' + q.correct + '. ' : isCorrect ? 'Correct. ' : 'Not quite. ') + q.explanation;
      card.appendChild(exp);
      if (q.why) {
        const textOf = (L) => (q.options.find((o) => o.letter === L) || {}).text || '';
        if (chosenLetter !== null && !isCorrect && q.why[chosenLetter]) {
          const w = document.createElement('div');
          w.className = 'whynot';
          w.innerHTML = '<strong>Why not ' + esc(chosenLetter) + ') ' + esc(textOf(chosenLetter)) + ':</strong> ' + esc(q.why[chosenLetter]);
          card.appendChild(w);
        }
        const rest = q.options.map((o) => o.letter).filter((L) => L !== q.correct && L !== chosenLetter && q.why[L]);
        if (rest.length) {
          const d = document.createElement('details');
          d.className = 'whyall';
          d.innerHTML = '<summary>Why the other choices are wrong</summary><ul>' +
            rest.map((L) => '<li><strong>' + esc(L) + ') ' + esc(textOf(L)) + ':</strong> ' + esc(q.why[L]) + '</li>').join('') + '</ul>';
          card.appendChild(d);
        }
      }
      return isCorrect;
    }

    function markAnswered(i, isCorrect) {
      if (state.answered[i]) return;
      state.answered[i] = true;
      state.correct[i] = isCorrect;
      updateScore();
    }

    function updateScore() {
      const answeredCount = state.answered.filter(Boolean).length;
      const correctCount = data.questions.reduce(
        (acc, q, idx) => acc + (q.type !== 'Open recall' && state.correct[idx] ? 1 : 0),
        0
      );
      document.getElementById('ans-count').textContent = answeredCount;
      document.getElementById('correct-count').textContent = correctCount;
      document.getElementById('progress-fill').style.width =
        Math.round((answeredCount / data.questions.length) * 100) + '%';

      if (answeredCount === data.questions.length) {
        const banner = document.getElementById('finish-banner');
        banner.classList.add('show');
        banner.innerHTML =
          '<p class="f-title">Quiz complete</p>' +
          '<p>' + correctCount + ' of ' + gradable + ' graded questions correct.</p>' +
          '<button id="finish-restart">Take it again</button>';
        document.getElementById('finish-restart').addEventListener('click', () => window.location.reload());
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
