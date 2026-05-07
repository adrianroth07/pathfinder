const LOGO_SVG = `<svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg>`;

export function renderOpener({ onSelect }) {
  const el = document.createElement('div');
  el.className = 'screen quiz-screen';

  el.innerHTML = `
    <div class="quiz-left">
      <div class="logo" style="cursor:default;">
        ${LOGO_SVG}
        <span class="logo-path">Path</span><span class="logo-finder">finder</span>
      </div>
      <div class="quiz-left-body">
        <div class="quiz-q-num">Before we start</div>
        <div class="quiz-inspire-word">WHERE<br>ARE<br>YOU?</div>
      </div>
      <div class="quiz-left-footer">
        <div class="quiz-left-progress-track">
          <div class="quiz-left-progress-fill" style="width:0%"></div>
        </div>
        <div class="quiz-left-progress-label">Step 0 — Getting started</div>
      </div>
    </div>

    <div class="quiz-right">
      <div>
        <div class="quiz-round-badge" style="background:rgba(0,0,0,0.05);color:var(--text-tertiary);">Getting started</div>
        <div class="quiz-question-text">Where are you right now?</div>
        <div class="quiz-question-hint">This helps us pitch the questions at the right level — and shapes the kind of results you get.</div>
        <div class="opener-options">
          <div class="opener-option js-opener" data-mode="lena">
            <div class="opener-option-title">I have no idea</div>
            <div class="opener-option-desc">Start from scratch — help me figure out what I'm even drawn to.</div>
          </div>
          <div class="opener-option js-opener" data-mode="malik">
            <div class="opener-option-title">I have some ideas, but I'm not sure</div>
            <div class="opener-option-desc">I've been thinking about a few directions but I'm not confident they're right for me.</div>
          </div>
          <div class="opener-option js-opener" data-mode="clear">
            <div class="opener-option-title">I know roughly what I want</div>
            <div class="opener-option-desc">Help me compare a few options and make sure I haven't missed anything.</div>
          </div>
        </div>
      </div>
      <div class="quiz-right-footer" style="border-top:none;padding-top:0;">
        <span class="quiz-select-hint">Select one to continue</span>
        <div></div>
      </div>
    </div>
  `;

  el.querySelectorAll('.js-opener').forEach(opt => {
    opt.addEventListener('click', () => {
      el.querySelectorAll('.js-opener').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      setTimeout(() => onSelect(opt.dataset.mode), 240);
    });
  });

  return el;
}
