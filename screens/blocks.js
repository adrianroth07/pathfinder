const LOGO_SVG = `<svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg>`;

const BLOCK_OPTIONS = [
  { id: 'money',       label: 'Money pressure' },
  { id: 'family',      label: 'What family or friends will think' },
  { id: 'wrong-choice', label: 'Fear of choosing wrong' },
  { id: 'behind',      label: 'Feeling behind everyone else' },
  { id: 'other',       label: 'Something else' },
];

export function renderBlocks({ selected, otherText, onContinue, onBack }) {
  const el = document.createElement('div');
  el.className = 'screen quiz-screen';

  const currentSelected = new Set(selected || []);

  el.innerHTML = `
    <div class="quiz-left">
      <div class="logo" style="cursor:default;">
        ${LOGO_SVG}
        <span class="logo-path">Path</span><span class="logo-finder">finder</span>
      </div>
      <div class="quiz-left-body">
        <div class="quiz-q-num">Optional</div>
        <div class="quiz-inspire-word">HONEST</div>
      </div>
      <div class="quiz-left-footer">
        <div class="quiz-left-progress-track">
          <div class="quiz-left-progress-fill" style="width:92%"></div>
        </div>
        <div class="quiz-left-progress-label">Almost done</div>
      </div>
    </div>

    <div class="quiz-right">
      <div style="flex:1;">
        <div class="quiz-round-badge" style="background:rgba(0,0,0,0.05);color:var(--text-tertiary);">Optional</div>
        <div class="quiz-question-text">What's getting in the way?</div>
        <div class="quiz-question-hint">Optional — there's no wrong answer. Naming it here helps us frame your results. Select anything that applies.</div>

        <div class="block-chips js-chips">
          ${BLOCK_OPTIONS.map(b => `
            <button class="block-chip${currentSelected.has(b.id) ? ' selected' : ''}" data-id="${b.id}">${b.label}</button>
          `).join('')}
        </div>

        <div class="js-other-wrap" style="${currentSelected.has('other') ? '' : 'display:none;'}">
          <textarea class="quiz-textarea js-other-text" rows="2" placeholder="What else is getting in the way?">${otherText || ''}</textarea>
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

  const otherWrap = el.querySelector('.js-other-wrap');

  el.querySelectorAll('.block-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      if (currentSelected.has(id)) {
        currentSelected.delete(id);
        chip.classList.remove('selected');
      } else {
        currentSelected.add(id);
        chip.classList.add('selected');
      }
      otherWrap.style.display = currentSelected.has('other') ? '' : 'none';
    });
  });

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-skip').addEventListener('click', () => onContinue([], ''));
  el.querySelector('.js-continue').addEventListener('click', () => {
    const other = el.querySelector('.js-other-text')?.value.trim() || '';
    onContinue([...currentSelected], other);
  });

  return el;
}
