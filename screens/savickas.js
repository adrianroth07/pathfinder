const LOGO_SVG = `<svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg>`;

export function renderSavickas({ answers, onContinue, onBack }) {
  const el = document.createElement('div');
  el.className = 'screen quiz-screen';

  el.innerHTML = `
    <div class="quiz-left">
      <div class="logo" style="cursor:default;">
        ${LOGO_SVG}
        <span class="logo-path">Path</span><span class="logo-finder">finder</span>
      </div>
      <div class="quiz-left-body">
        <div class="quiz-q-num">Optional — 2 minutes</div>
        <div class="quiz-inspire-word">YOUR<br>STORY</div>
      </div>
      <div class="quiz-left-footer">
        <div class="quiz-left-progress-track">
          <div class="quiz-left-progress-fill" style="width:58%"></div>
        </div>
        <div class="quiz-left-progress-label">Almost at Round 2</div>
      </div>
    </div>

    <div class="quiz-right">
      <div style="flex:1;">
        <div class="quiz-round-badge" style="background:rgba(0,0,0,0.05);color:var(--text-tertiary);">Optional</div>
        <div class="quiz-question-text">Three questions that go a bit deeper.</div>
        <div class="quiz-question-hint">These are optional — skip any you don't want to answer. Research shows that what we admire, what we come back to, and what we tell ourselves often reveals more about fit than any questionnaire.</div>

        <div class="savickas-field">
          <label class="savickas-label">Who did you admire growing up — and what about them stuck with you?</label>
          <textarea class="quiz-textarea js-role-model" rows="2" placeholder="A teacher, a character, a relative, someone famous — anyone">${answers.roleModel || ''}</textarea>
        </div>

        <div class="savickas-field">
          <label class="savickas-label">What's a book, film, or game you keep coming back to?</label>
          <textarea class="quiz-textarea js-story" rows="2" placeholder="Doesn't have to be highbrow — just honest">${answers.story || ''}</textarea>
        </div>

        <div class="savickas-field">
          <label class="savickas-label">If you had a personal motto, what would it be?</label>
          <textarea class="quiz-textarea js-motto" rows="2" placeholder="Something you actually believe, not something that sounds good">${answers.motto || ''}</textarea>
        </div>
      </div>

      <div class="quiz-right-footer">
        <button class="btn js-back">← Back</button>
        <div class="quiz-actions">
          <button class="btn js-skip" style="color:var(--text-tertiary);">Skip →</button>
          <button class="btn btn-primary js-continue">Continue →</button>
        </div>
      </div>
    </div>
  `;

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-skip').addEventListener('click', () => onContinue({ roleModel: '', story: '', motto: '' }));
  el.querySelector('.js-continue').addEventListener('click', () => {
    onContinue({
      roleModel: el.querySelector('.js-role-model').value.trim(),
      story:     el.querySelector('.js-story').value.trim(),
      motto:     el.querySelector('.js-motto').value.trim(),
    });
  });

  return el;
}
