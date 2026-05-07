const CERTS = ['Hauptschulabschluss', 'Realschulabschluss', 'Fachhochschulreife', 'Abitur', 'Still in school', 'Not sure'];
const SUBJECTS = ['Maths', 'German', 'English', 'Physics / sciences'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2 / native'];
const EXPERIENCE = ['Just finished school', 'Currently in a gap year', 'Working part-time', 'Did an FSJ / BFD', 'Started then stopped a path', 'Something else'];
const EXTRAS = ['Volunteer work', 'Sport / team activities', 'Music or arts', 'Side projects / freelance work', 'Leadership roles', 'Part-time job', 'Travel or time abroad', 'Coding / tech'];

// Maps 0–15 Punkte to a display label
function pointsLabel(pts) {
  if (pts === null || pts === undefined) return '—';
  if (pts >= 15) return '15 Pkt — Note 1+ (sehr gut)';
  if (pts >= 13) return `${pts} Pkt — Note 1`;
  if (pts >= 10) return `${pts} Pkt — Note 2 (gut)`;
  if (pts >= 7)  return `${pts} Pkt — Note 3 (befriedigend)`;
  if (pts >= 4)  return `${pts} Pkt — Note 4 (ausreichend)`;
  if (pts >= 1)  return `${pts} Pkt — Note 5 (mangelhaft)`;
  return '0 Pkt — Note 6 (ungenügend)';
}

function pointsColor(pts) {
  if (pts === null || pts === undefined) return 'var(--text-tertiary)';
  if (pts >= 10) return 'var(--text-success)';
  if (pts >= 5)  return 'var(--text-warning)';
  return '#991B1B';
}

export function renderQualifications({ quals, paths, filterResult, onChange, onBack, onNext }) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    <div class="nav">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div class="nav-meta">Step 3 of 5</div>
      <div></div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:60%"></div>
    </div>
    <div class="section">
      <div class="heading">Let's be honest about access</div>
      <div class="subheading">We only close doors that are genuinely closed. Everything else stays open.</div>

      <div class="field-label">School leaving certificate</div>
      <div class="field-hint">What did you finish school with?</div>
      <div class="pill-row js-certs"></div>

      <div class="field-label">Overall result (Abschlussnote)</div>
      <div class="field-hint">Enter your final grade — decimals are fine, e.g. 2.3. Scale: 1 = best, 6 = lowest.</div>
      <div class="js-overall-grade" style="margin-bottom:20px;"></div>

      <div class="field-label">Subject results <span style="font-size:12px;font-weight:400;color:var(--text-tertiary);">— optional</span></div>
      <div class="field-hint">Only subjects relevant to your suggested paths are shown.</div>
      <div class="js-subject-sliders" style="margin-bottom:20px;"></div>

      <div class="field-label">Languages</div>
      <div class="field-hint">Which languages can you work or study in?</div>
      <div class="pill-row js-langs"></div>
      <div class="level-row js-eng-level" style="display:none;">
        <span class="level-label">English level:</span>
      </div>

      <div class="divider"></div>

      <div class="field-label">Have you already started something?</div>
      <div class="field-hint">Optional — helps us understand where you are right now.</div>
      <div class="pill-row js-experience"></div>
      <div class="js-experience-other" style="display:none;margin-bottom:16px;">
        <input
          type="text"
          class="js-experience-other-input"
          placeholder="Tell us a bit more…"
          style="width:100%;font-size:13px;font-family:var(--font);padding:9px 12px;border:0.5px solid var(--border-secondary);border-radius:var(--radius-md);outline:none;color:var(--text-primary);background:var(--bg-primary);"
        />
      </div>

      <div class="field-label">Any extracurriculars or experience?</div>
      <div class="field-hint">Optional — shows strengths that grades don't capture.</div>
      <div class="pill-row js-extras"></div>

      <div class="divider"></div>

      <div class="field-label" style="margin-bottom:12px;">Your 3 paths — after filtering</div>
      <div class="js-filter-results"></div>

      <div style="font-size:12px;color:var(--text-tertiary);margin:16px 0;">
        Want to save your results? <span style="color:var(--text-info);cursor:pointer;">Create an account</span> — never required.
      </div>
      <div class="step-actions">
        <button class="btn js-back">← Back</button>
        <button class="btn btn-primary js-next">Continue →</button>
      </div>
    </div>
    <div class="ai-bar">
      <div class="ai-dot"></div>
      <span>Wondering why a path changed status? Ask — AI explains the access rules.</span>
    </div>
  `;

  const state = { ...quals };

  // Cert pills
  const certRow = el.querySelector('.js-certs');
  CERTS.forEach(cert => {
    const pill = document.createElement('span');
    pill.className = 'pill' + (state.cert === cert ? ' selected' : '');
    pill.textContent = cert;
    pill.addEventListener('click', () => {
      certRow.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      state.cert = cert;
      onChange(state);
      updateFilterResults();
    });
    certRow.appendChild(pill);
  });

  // Overall grade text input
  buildGradeInput(el.querySelector('.js-overall-grade'), state.overallGrade, val => {
    state.overallGrade = val;
    onChange(state);
  });

  // Subject sliders
  const subjectContainer = el.querySelector('.js-subject-sliders');
  SUBJECTS.forEach(subject => {
    const wrap = document.createElement('div');
    wrap.style.marginBottom = '12px';
    const key = 'points_' + subject.replace(/\s*\/.*/, '').trim().toLowerCase();
    buildPointsSlider(wrap, subject, state[key], pts => {
      state[key] = pts;
      onChange(state);
    });
    subjectContainer.appendChild(wrap);
  });

  // Languages
  const langRow = el.querySelector('.js-langs');
  const engLevel = el.querySelector('.js-eng-level');
  const langs = ['German', 'English', 'French', 'Turkish', 'Arabic', '+ Add language'];
  langs.forEach(lang => {
    const pill = document.createElement('span');
    const isSelected = state.langs && state.langs.includes(lang);
    pill.className = 'pill' + (isSelected ? ' selected' : '');
    pill.textContent = lang === 'German' ? 'German — native' : lang;
    pill.addEventListener('click', () => {
      if (lang === '+ Add language' || lang === 'German') return;
      pill.classList.toggle('selected');
      if (!state.langs) state.langs = [];
      if (state.langs.includes(lang)) {
        state.langs = state.langs.filter(l => l !== lang);
      } else {
        state.langs.push(lang);
      }
      engLevel.style.display = state.langs.includes('English') ? 'flex' : 'none';
      onChange(state);
    });
    langRow.appendChild(pill);
  });

  LEVELS.forEach(lvl => {
    const btn = document.createElement('span');
    btn.className = 'level-btn' + (state.engLevel === lvl ? ' selected' : '');
    btn.textContent = lvl;
    btn.addEventListener('click', () => {
      engLevel.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.engLevel = lvl;
      onChange(state);
    });
    engLevel.appendChild(btn);
  });

  if (state.langs && state.langs.includes('English')) {
    engLevel.style.display = 'flex';
  }

  // Experience pills + "Something else" free text
  const expRow = el.querySelector('.js-experience');
  const expOther = el.querySelector('.js-experience-other');
  const expOtherInput = el.querySelector('.js-experience-other-input');

  if (state.experienceOther) expOtherInput.value = state.experienceOther;

  EXPERIENCE.forEach(exp => {
    const pill = document.createElement('span');
    pill.className = 'pill' + (state.experience === exp ? ' selected' : '');
    pill.textContent = exp;
    pill.addEventListener('click', () => {
      expRow.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      state.experience = exp;
      expOther.style.display = exp === 'Something else' ? 'block' : 'none';
      if (exp !== 'Something else') state.experienceOther = null;
      onChange(state);
    });
    expRow.appendChild(pill);
  });

  if (state.experience === 'Something else') expOther.style.display = 'block';

  expOtherInput.addEventListener('input', () => {
    state.experienceOther = expOtherInput.value;
    onChange(state);
  });

  // Extras pills
  const extrasRow = el.querySelector('.js-extras');
  EXTRAS.forEach(extra => {
    const pill = document.createElement('span');
    const isSelected = state.extras && state.extras.includes(extra);
    pill.className = 'pill' + (isSelected ? ' selected' : '');
    pill.textContent = extra;
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
      if (!state.extras) state.extras = [];
      if (state.extras.includes(extra)) {
        state.extras = state.extras.filter(e => e !== extra);
      } else {
        state.extras.push(extra);
      }
      state.hasPortfolio = state.extras.includes('Side projects / freelance work') || state.extras.includes('Coding / tech');
      onChange(state);
      updateFilterResults();
    });
    extrasRow.appendChild(pill);
  });

  function updateFilterResults() {
    const resultsEl = el.querySelector('.js-filter-results');
    resultsEl.innerHTML = '';
    paths.forEach(path => {
      const result = filterResult[path.id];
      if (!result) return;

      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid var(--border-secondary);border-radius:var(--radius-md);overflow:hidden;margin-bottom:10px;';

      // Status header row
      const header = document.createElement('div');
      const headerBg = !result.open ? '#FEF2F2' : result.gradeFlag ? '#FFFBEB' : '#F0FDF4';
      const headerBorder = !result.open ? '#FECACA' : result.gradeFlag ? '#FDE68A' : '#BBF7D0';
      const dot = !result.open ? '✗' : result.gradeFlag ? '⚠' : '✓';
      const dotColor = !result.open ? '#DC2626' : result.gradeFlag ? '#D97706' : '#16A34A';
      const statusText = !result.open
        ? result.note
        : result.note
          ? result.note
          : result.gradeFlag
            ? 'Open — but grades may limit some programmes within this path'
            : 'Open — your profile meets the requirements';

      header.style.cssText = `display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:${headerBg};border-bottom:1px solid ${headerBorder};`;
      header.innerHTML = `
        <span style="font-size:13px;font-weight:700;color:${dotColor};flex-shrink:0;margin-top:1px;">${dot}</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:2px;">${path.name}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.4;">${statusText}</div>
        </div>
      `;
      card.appendChild(header);

      // Tips section — cert progression routes or grade tips
      const tips = (!result.open && result.certTips && result.certTips.length > 0)
        ? { label: 'How to get there', items: result.certTips }
        : (result.gradeFlag && result.gradeTips && result.gradeTips.length > 0)
          ? { label: 'What you can do', items: result.gradeTips }
          : null;

      if (tips) {
        const tipsWrap = document.createElement('div');
        tipsWrap.style.cssText = 'padding:12px 14px;background:var(--bg-primary);';

        const tipsLabel = document.createElement('div');
        tipsLabel.style.cssText = 'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-tertiary);margin-bottom:8px;';
        tipsLabel.textContent = tips.label;
        tipsWrap.appendChild(tipsLabel);

        tips.items.forEach(tip => {
          const tipEl = document.createElement('div');
          tipEl.style.cssText = 'display:flex;gap:8px;margin-bottom:7px;align-items:flex-start;';
          tipEl.innerHTML = `
            <span style="color:var(--green-primary);font-size:12px;flex-shrink:0;margin-top:1px;">→</span>
            <span style="font-size:12px;color:var(--text-secondary);line-height:1.45;">${tip}</span>
          `;
          tipsWrap.appendChild(tipEl);
        });

        card.appendChild(tipsWrap);
      }

      resultsEl.appendChild(card);
    });
  }

  updateFilterResults();
  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-next').addEventListener('click', onNext);

  return el;
}

function buildGradeInput(container, currentVal, onSelect) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:flex-start;gap:12px;';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.placeholder = 'e.g. 2.3';
  input.value = currentVal ?? '';
  input.style.cssText = `
    width: 120px; font-size: 20px; font-weight: 700; font-family: var(--font);
    padding: 8px 12px; border: 1.5px solid var(--border-secondary);
    border-radius: var(--radius-md); outline: none; color: var(--text-primary);
    background: var(--bg-primary); letter-spacing: -0.02em;
  `;

  const feedback = document.createElement('div');
  feedback.style.cssText = 'font-size:12px;font-weight:500;margin-top:12px;';

  function validate(raw) {
    if (raw === '') {
      input.style.borderColor = 'var(--border-secondary)';
      feedback.textContent = '';
      onSelect(null);
      return;
    }
    const num = parseFloat(raw.replace(',', '.'));
    if (isNaN(num) || num < 0 || num > 6) {
      input.style.borderColor = '#F43F5E';
      feedback.style.color = '#9F1239';
      feedback.textContent = 'Must be a number between 0 and 6.';
      onSelect(null);
    } else {
      input.style.borderColor = 'var(--border-success)';
      feedback.style.color = 'var(--text-success)';
      feedback.textContent = num <= 2 ? 'Sehr gut — strong result.' : num <= 2.5 ? 'Gut — most paths open.' : num <= 3 ? 'Befriedigend — some competitive programmes may be harder to access.' : num <= 4 ? 'Ausreichend — see tips below for each path.' : 'Noted — see tips below.';
      onSelect(num);
    }
  }

  input.addEventListener('input', () => validate(input.value));
  input.addEventListener('focus', () => { input.style.borderColor = 'var(--border-primary)'; });

  if (currentVal !== null && currentVal !== undefined) validate(String(currentVal));

  wrap.appendChild(input);
  wrap.appendChild(feedback);
  container.appendChild(wrap);
}

function buildPointsSlider(container, label, currentVal, onSelect) {
  const val = currentVal ?? null;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:12px;';

  const labelEl = document.createElement('div');
  labelEl.className = 'grade-label';
  labelEl.textContent = label;

  const sliderWrap = document.createElement('div');
  sliderWrap.style.cssText = 'flex:1;';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 15;
  slider.step = 1;
  slider.value = val ?? 8;
  slider.style.cssText = 'width:100%;accent-color:var(--green-primary);cursor:pointer;';

  const display = document.createElement('div');
  display.style.cssText = 'font-size:12px;margin-top:4px;font-weight:500;';

  function refresh(pts, touched) {
    display.textContent = touched ? pointsLabel(pts) : 'Not set — drag to enter';
    display.style.color = touched ? pointsColor(pts) : 'var(--text-tertiary)';
    slider.style.opacity = touched ? '1' : '0.45';
  }

  let touched = val !== null;
  refresh(val ?? 8, touched);

  slider.addEventListener('input', () => {
    touched = true;
    const pts = parseInt(slider.value);
    refresh(pts, true);
    onSelect(pts);
  });

  sliderWrap.appendChild(slider);
  sliderWrap.appendChild(display);
  wrap.appendChild(labelEl);
  wrap.appendChild(sliderWrap);
  container.appendChild(wrap);
}
