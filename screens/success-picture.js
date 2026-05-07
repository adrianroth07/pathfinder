const LOGO_SVG = `<svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg>`;

export function renderSuccessPicture({ text, onContinue, onBack }) {
  const el = document.createElement('div');
  el.className = 'screen quiz-screen';

  el.innerHTML = `
    <div class="quiz-left">
      <div class="logo" style="cursor:default;">
        ${LOGO_SVG}
        <span class="logo-path">Path</span><span class="logo-finder">finder</span>
      </div>
      <div class="quiz-left-body">
        <div class="quiz-q-num">Optional</div>
        <div class="quiz-inspire-word">TUESDAY</div>
      </div>
      <div class="quiz-left-footer">
        <div class="quiz-left-progress-track">
          <div class="quiz-left-progress-fill" style="width:97%"></div>
        </div>
        <div class="quiz-left-progress-label">One more thing</div>
      </div>
    </div>

    <div class="quiz-right">
      <div style="flex:1;">
        <div class="quiz-round-badge" style="background:rgba(0,0,0,0.05);color:var(--text-tertiary);">Optional</div>
        <div class="quiz-question-text">Before we show you anything — picture two years from now, and it's gone well.</div>
        <div class="quiz-question-hint">What does a good Tuesday look like? Where are you, who's around, what are you doing in the morning? Leave it blank to skip — this just helps personalise what you see next.</div>
        <textarea class="quiz-textarea js-success-text" rows="5" placeholder="A good Tuesday is...">${text || ''}</textarea>
        <div style="font-size:12px;color:var(--text-tertiary);line-height:1.6;margin-top:4px;">The answer is rarely about a job title — it's usually about energy, location, and people. That's exactly what we're looking for.</div>
      </div>

      <div class="quiz-right-footer">
        <button class="btn js-back">← Back</button>
        <div class="quiz-actions">
          <button class="btn js-skip" style="color:var(--text-tertiary);">Skip →</button>
          <button class="btn btn-primary js-continue">Show my paths →</button>
        </div>
      </div>
    </div>
  `;

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-skip').addEventListener('click', () => onContinue(''));
  el.querySelector('.js-continue').addEventListener('click', () => {
    onContinue(el.querySelector('.js-success-text').value.trim());
  });

  return el;
}
