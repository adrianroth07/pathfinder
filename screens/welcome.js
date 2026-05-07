export function renderWelcome({ onStart, onBrowse, onMap }) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    <div class="nav nav-dark" style="background:var(--green-primary);border-bottom:0.5px solid rgba(255,255,255,0.12);">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="js-map" style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:6px 14px;cursor:pointer;font-family:var(--font);transition:background 0.15s;">Path map</button>
        <button class="js-browse" style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:6px 14px;cursor:pointer;font-family:var(--font);transition:background 0.15s;">Browse all paths</button>
      </div>
    </div>

    <div class="welcome-hero">
      <div class="welcome-eyebrow">10 minutes · No account needed</div>
      <div class="welcome-title">It's okay not to know what comes next.</div>
      <div class="welcome-sub">PathFinder narrows the field — the decision is yours.</div>
      <button class="welcome-cta js-start">Find my path →</button>
    </div>

    <div class="how-it-works">
      <div class="how-title">How it works</div>
      <div class="how-steps">
        <div class="how-step">
          <div class="how-step-icon">
            <svg width="44" height="44" viewBox="-37 -37 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="0" cy="0" r="34" stroke="#14532d" stroke-width="3"/>
              <circle cx="0" cy="0" r="28" stroke="#166534" stroke-width="1" stroke-dasharray="3 5" opacity="0.5"/>
              <path d="M0,0 C-5,-14 -4,-28 0,-36 C4,-28 5,-14 0,0" fill="#14532d"/>
              <path d="M0,0 C-4,12 -3,24 0,30 C3,24 4,12 0,0" fill="#4ade80" opacity="0.5"/>
              <circle cx="0" cy="0" r="4" fill="#15803d"/>
              <circle cx="0" cy="0" r="2" fill="#dcfce7"/>
              <line x1="0" y1="-34" x2="0" y2="-27" stroke="#14532d" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="34" y1="0" x2="27" y2="0" stroke="#166534" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="0" y1="34" x2="0" y2="27" stroke="#166534" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="-34" y1="0" x2="-27" y2="0" stroke="#166534" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="how-step-label">Two rounds of questions</div>
          <div class="how-step-desc">Round 1 finds your personality type. Round 2 looks at your life situation. About 10 minutes.</div>
        </div>
        <div class="how-connector"></div>
        <div class="how-step">
          <div class="how-step-icon">
            <svg width="44" height="44" viewBox="-37 -37 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-34,-28 L-12,-20 L12,-28 L34,-20 L34,28 L12,20 L-12,28 L-34,20 Z" stroke="#166534" stroke-width="2.5" stroke-linejoin="round"/>
              <line x1="-12" y1="-20" x2="-12" y2="28" stroke="#15803d" stroke-width="1.5" opacity="0.5"/>
              <line x1="12" y1="-28" x2="12" y2="20" stroke="#15803d" stroke-width="1.5" opacity="0.5"/>
              <path d="M-20,8 C-10,-4 4,2 18,-8" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
              <circle cx="18" cy="-8" r="3.5" fill="#14532d"/>
              <circle cx="18" cy="-8" r="1.5" fill="#dcfce7"/>
            </svg>
          </div>
          <div class="how-step-label">3 paths matched to you</div>
          <div class="how-step-desc">Based on your type and preferences — not the same list for everyone.</div>
        </div>
        <div class="how-connector"></div>
        <div class="how-step">
          <div class="how-step-icon">
            <svg width="44" height="44" viewBox="-37 -37 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="-34" y="-34" width="68" height="68" rx="14" stroke="#15803d" stroke-width="2.5"/>
              <path d="M-16,4 L-4,16 L20,-14" stroke="#14532d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="how-step-label">Qualification check</div>
          <div class="how-step-desc">Enter your Abschluss and grades. We filter out paths that aren't realistically open to you yet.</div>
        </div>
        <div class="how-connector"></div>
        <div class="how-step">
          <div class="how-step-icon">
            <svg width="44" height="44" viewBox="-33 -33 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="-8" cy="-8" r="22" stroke="#15803d" stroke-width="3"/>
              <circle cx="-8" cy="-8" r="14" stroke="#166534" stroke-width="1" opacity="0.4"/>
              <line x1="9" y1="9" x2="28" y2="28" stroke="#14532d" stroke-width="5" stroke-linecap="round"/>
              <circle cx="-16" cy="-16" r="4" fill="#4ade80" opacity="0.25"/>
            </svg>
          </div>
          <div class="how-step-label">Compare and explore</div>
          <div class="how-step-desc">Read stories from real people and compare your options side by side.</div>
        </div>
      </div>
    </div>
  `;

  el.querySelector('.js-start').addEventListener('click', onStart);
  el.querySelector('.js-browse').addEventListener('click', onBrowse);
  el.querySelector('.js-map').addEventListener('click', onMap);
  return el;
}
