 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..a73df8259e33013cb18d67bc10a208147795bd21
--- /dev/null
+++ b/script.js
@@ -0,0 +1,174 @@
+const form = document.getElementById('music-theory-test');
+const results = document.getElementById('results');
+const scoreLine = document.getElementById('score-line');
+const feedbackList = document.getElementById('feedback-list');
+const resetButton = document.getElementById('reset-test');
+
+const normalize = (value) =>
+  value
+    .toLowerCase()
+    .trim()
+    .replace(/[(),.]/g, ' ')
+    .replace(/\s+/g, ' ');
+
+const textQuestions = [
+  {
+    name: 'sharps-order',
+    label: 'Volgorde van de kruisen',
+    acceptedAnswers: ['fis cis gis dis ais eis bis'],
+  },
+  {
+    name: 'flats-order',
+    label: 'Volgorde van de mollen',
+    acceptedAnswers: ['bes es as des ges ces fes'],
+  },
+  {
+    name: 'key-a-name',
+    label: 'Toonaard a',
+    acceptedAnswers: ['fa groot', 'f groot'],
+  },
+  {
+    name: 'key-a-letter',
+    label: 'Letterbenaming a',
+    acceptedAnswers: ['f'],
+  },
+  {
+    name: 'key-b-name',
+    label: 'Toonaard b',
+    acceptedAnswers: ['mi groot', 'e groot'],
+  },
+  {
+    name: 'key-b-letter',
+    label: 'Letterbenaming b',
+    acceptedAnswers: ['e'],
+  },
+  {
+    name: 'key-c-name',
+    label: 'Toonaard c',
+    acceptedAnswers: ['ges groot', 'gb groot'],
+  },
+  {
+    name: 'key-c-letter',
+    label: 'Letterbenaming c',
+    acceptedAnswers: ['ges', 'gb'],
+  },
+];
+
+const radioQuestions = [
+  { name: 'note-names', label: 'Notennamen', correct: 'b', answerText: 'c d e f g a b c' },
+  { name: 'raised-f', label: 'Verhoogde F', correct: 'c', answerText: 'fis' },
+  { name: 'lowered-b', label: 'Verlaagde B', correct: 'a', answerText: 'bes' },
+  { name: 'triad-1', label: 'Drieklank G-B-D', correct: 'major-g', answerText: 'Groot (G)' },
+  { name: 'triad-2', label: 'Drieklank E-G-B', correct: 'minor-e', answerText: 'Klein (Em)' },
+  { name: 'triad-3', label: 'Drieklank F-A-C', correct: 'major-f', answerText: 'Groot (F)' },
+  { name: 'triad-4', label: 'Drieklank A-C-E', correct: 'minor-a', answerText: 'Klein (Am)' },
+  { name: 'summary', label: 'Samenvattende vraag', correct: 'b', answerText: 'In Sol groot: één kruis en G-B-D.' },
+];
+
+const clearFeedbackStyles = () => {
+  form.querySelectorAll('.is-correct, .is-incorrect').forEach((element) => {
+    element.classList.remove('is-correct', 'is-incorrect');
+  });
+};
+
+const renderFeedback = (items) => {
+  feedbackList.innerHTML = '';
+
+  items.forEach((item) => {
+    const row = document.createElement('div');
+    row.className = `feedback-item${item.correct ? '' : ' error'}`;
+    row.innerHTML = `
+      <strong>${item.correct ? 'Juist' : 'Nog eens bekijken'}: ${item.label}</strong>
+      <span>${item.message}</span>
+      ${item.correct ? '' : `<span class="correct-answer">Juiste antwoord: ${item.correctAnswer}</span>`}
+    `;
+    feedbackList.appendChild(row);
+  });
+};
+
+form.addEventListener('submit', (event) => {
+  event.preventDefault();
+  clearFeedbackStyles();
+
+  const feedback = [];
+  let score = 0;
+  const total = textQuestions.length + radioQuestions.length;
+
+  textQuestions.forEach((question) => {
+    const input = form.elements[question.name];
+    const value = normalize(input.value);
+    const correct = question.acceptedAnswers.some((answer) => normalize(answer) === value);
+
+    input.classList.add(correct ? 'is-correct' : 'is-incorrect');
+
+    if (correct) {
+      score += 1;
+    }
+
+    feedback.push({
+      label: question.label,
+      correct,
+      message: correct ? 'Goed gedaan.' : 'Controleer spelling en volgorde.',
+      correctAnswer: question.acceptedAnswers[0],
+    });
+  });
+
+  radioQuestions.forEach((question) => {
+    const selected = form.querySelector(`input[name="${question.name}"]:checked`);
+    const container = selected
+      ? selected.closest('.question-block')
+      : form.querySelector(`input[name="${question.name}"]`)?.closest('.question-block');
+    const correct = selected?.value === question.correct;
+
+    if (container) {
+      container.classList.add(correct ? 'is-correct' : 'is-incorrect');
+    }
+
+    if (correct) {
+      score += 1;
+    }
+
+    feedback.push({
+      label: question.label,
+      correct,
+      message: correct ? 'Prima antwoord.' : 'Dit onderdeel verdient nog wat extra oefening.',
+      correctAnswer: question.answerText,
+    });
+  });
+
+  const percentage = Math.round((score / total) * 100);
+  scoreLine.textContent = `Je behaalde ${score} op ${total} (${percentage}%).`;
+  renderFeedback(feedback);
+  results.classList.remove('hidden');
+  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
+
+  const savedAttempt = {
+    score,
+    total,
+    percentage,
+    completedAt: new Date().toISOString(),
+  };
+
+  window.localStorage.setItem('muziekschooltoets-last-score', JSON.stringify(savedAttempt));
+});
+
+resetButton.addEventListener('click', () => {
+  form.reset();
+  clearFeedbackStyles();
+  results.classList.add('hidden');
+  feedbackList.innerHTML = '';
+});
+
+const previousAttempt = window.localStorage.getItem('muziekschooltoets-last-score');
+
+if (previousAttempt) {
+  const { percentage, completedAt } = JSON.parse(previousAttempt);
+  const info = document.createElement('p');
+  info.className = 'intro';
+  const finished = new Date(completedAt).toLocaleString('nl-BE', {
+    dateStyle: 'medium',
+    timeStyle: 'short',
+  });
+  info.textContent = `Vorige poging: ${percentage}% behaald op ${finished}.`;
+  document.querySelector('.hero').appendChild(info);
+}
 
EOF
)
