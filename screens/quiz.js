import { ROUND1_QUESTIONS, ROUND2_QUESTIONS, RIASEC_MODES } from '../data/questions.js';

const LOGO_SVG = `<svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg>`;

export function renderQuiz({ round, questionIndex, selections, round1Length, onAnswer, onNext, onBack, onBrowse }) {
  const questions = round === 1 ? ROUND1_QUESTIONS : ROUND2_QUESTIONS;
  const q = questions[questionIndex];

  const progress = round === 1
    ? ((questionIndex + 1) / 10) * 55
    : 55 + ((questionIndex + 1) / ROUND2_QUESTIONS.length) * 45;

  const numLabel = String(questionIndex + 1).padStart(2, '0');
  const roundLabel = round === 1
    ? `Round 1 · ${questionIndex + 1} of up to ${ROUND1_QUESTIONS.length}`
    : `Round 2 · ${questionIndex + 1} of ${ROUND2_QUESTIONS.length}`;

  const el = document.createElement('div');
  el.className = 'screen quiz-screen';
  el.innerHTML = `
    <div class="quiz-left">
      <div class="logo" style="cursor:default;">
        ${LOGO_SVG}
        <span class="logo-path">Path</span><span class="logo-finder">finder</span>
      </div>
      <div class="quiz-left-body">
        <div class="quiz-q-num">Question ${numLabel}</div>
        <div class="quiz-inspire-word">${q.word || ''}</div>
      </div>
      <div class="quiz-left-footer">
        <div class="quiz-left-progress-track">
          <div class="quiz-left-progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="quiz-left-progress-label">${roundLabel}</div>
      </div>
    </div>

    <div class="quiz-right">
      <div>
        <div class="quiz-round-badge" style="background:${round === 1 ? 'rgba(0,0,0,0.05)' : 'var(--green-light)'};color:${round === 1 ? 'var(--text-tertiary)' : 'var(--green-primary)'};">
          ${round === 1 ? 'Discover your type' : 'Your situation'}
        </div>
        <div class="quiz-question-text">${q.text}</div>
        <div class="quiz-question-hint">${q.hint}</div>
        ${q.why ? `<button class="quiz-why-btn js-why">Why do we ask this?</button><div class="quiz-why-text js-why-text" hidden>${q.why}</div>` : ''}
        <div class="js-options quiz-options-list"></div>
      </div>
      <div class="quiz-right-footer">
        <span class="quiz-select-hint">${q.multi ? 'Select all that apply' : 'Select one'}</span>
        <div class="quiz-actions">
          <button class="btn js-back">← Back</button>
          <button class="btn btn-primary js-next" disabled>Next →</button>
        </div>
      </div>
    </div>
  `;

  const optContainer = el.querySelector('.js-options');
  const nextBtn = el.querySelector('.js-next');
  const currentSelections = new Set(selections || []);

  function updateNext() {
    nextBtn.disabled = currentSelections.size === 0;
  }

  q.options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option' + (currentSelections.has(opt.id) ? ' selected' : '');
    div.innerHTML = `
      <div class="option-dot"></div>
      <div class="option-title">${opt.text}</div>
    `;
    div.addEventListener('click', () => {
      if (q.multi) {
        if (currentSelections.has(opt.id)) {
          currentSelections.delete(opt.id);
          div.classList.remove('selected');
        } else {
          currentSelections.add(opt.id);
          div.classList.add('selected');
        }
      } else {
        optContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        currentSelections.clear();
        currentSelections.add(opt.id);
        div.classList.add('selected');
      }
      onAnswer(questionIndex, [...currentSelections]);
      updateNext();
    });
    optContainer.appendChild(div);
  });

  updateNext();

  const whyBtn = el.querySelector('.js-why');
  const whyText = el.querySelector('.js-why-text');
  if (whyBtn && whyText) {
    whyBtn.addEventListener('click', () => {
      const visible = !whyText.hidden;
      whyText.hidden = visible;
      whyBtn.textContent = visible ? 'Why do we ask this?' : 'Hide explanation';
    });
  }

  nextBtn.addEventListener('click', onNext);
  el.querySelector('.js-back').addEventListener('click', onBack);

  return el;
}

export function renderRound2Intro({ dominantTypes, onContinue }) {
  const el = document.createElement('div');
  el.className = 'screen quiz-screen';

  const typeCards = dominantTypes.slice(0, 2).map(([type, mode]) => `
    <div style="flex:1;padding:20px 22px;background:#f7f7f5;border:0.5px solid var(--border-tertiary);border-radius:10px;">
      <div style="font-size:13px;font-weight:700;color:var(--green-primary);margin-bottom:6px;">${mode.name}</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.55;">${mode.desc}</div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="quiz-left">
      <div class="logo" style="cursor:default;">
        ${LOGO_SVG}
        <span class="logo-path">Path</span><span class="logo-finder">finder</span>
      </div>
      <div class="quiz-left-body">
        <div class="quiz-q-num">Round 1 complete</div>
        <div class="quiz-inspire-word">READY</div>
      </div>
      <div class="quiz-left-footer">
        <div class="quiz-left-progress-track">
          <div class="quiz-left-progress-fill" style="width:55%"></div>
        </div>
        <div class="quiz-left-progress-label">Halfway there</div>
      </div>
    </div>

    <div class="quiz-right">
      <div>
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-tertiary);margin-bottom:20px;">Your type is coming through</div>
        <div class="quiz-question-text" style="margin-bottom:8px;">We've got a strong read on you.</div>
        <div class="quiz-question-hint" style="margin-bottom:28px;">Your top types so far — these shape which paths we suggest. Round 2 takes 2 minutes and adds the practical side.</div>
        <div style="display:flex;gap:12px;margin-bottom:32px;">${typeCards}</div>
      </div>
      <div class="quiz-right-footer">
        <span class="quiz-select-hint">2 minutes left</span>
        <div class="quiz-actions">
          <button class="btn btn-primary js-continue" style="font-size:14px;padding:10px 28px;">On to Round 2 →</button>
        </div>
      </div>
    </div>
  `;

  el.querySelector('.js-continue').addEventListener('click', onContinue);
  return el;
}
