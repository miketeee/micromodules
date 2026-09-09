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
      '<button class="restart-btn" id="restart-btn">restart quiz</button>';
    root.appendChild(scoreBar);

    const list = document.createElement('div');
    list.id = 'question-list';
    root.appendChild(list);

    data.questions.forEach((q, i) => renderQuestion(q, i));

    const finishBanner = document.createElement('div');
    finishBanner.className = 'finish-banner';
    finishBanner.id = 'finish-banner';
    root.appendChild(finishBanner);

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
      }

      list.appendChild(card);
    }

    function handleAnswer(i, chosenLetter, q, optsEl, card) {
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
      exp.textContent = (isCorrect ? 'Correct. ' : 'Not quite. ') + q.explanation;
      card.appendChild(exp);
      markAnswered(i, isCorrect);
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
