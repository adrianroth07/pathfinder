import { ALL_PATHS } from '../data/paths.js';
import { pathColor } from '../data/colors.js';
import { showPathDetailModal } from './path-detail-modal.js';

export function renderBrowse({ onStartQuiz, onBack }) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    <div class="nav nav-dark" style="background:var(--green-primary);border-bottom:0.5px solid rgba(255,255,255,0.12);">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <button class="nav-link js-back" style="color:rgba(255,255,255,0.7);">← Back</button>
    </div>
    <div class="section">
      <div class="heading" style="margin-bottom:4px;">All paths</div>
      <div class="subheading" style="margin-bottom:20px;">6 routes after school in Germany. Click any to read more.</div>
      <div class="js-path-list"></div>
      <div style="margin-top:24px;padding:16px 18px;background:var(--green-light);border-radius:var(--radius-lg);display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--green-text);margin-bottom:2px;">Not sure which fits you?</div>
          <div style="font-size:12px;color:var(--text-secondary);">Take the quiz and get 3 personalised suggestions.</div>
        </div>
        <button class="btn js-quiz" style="background:var(--green-primary);color:#fff;border-color:var(--green-primary);white-space:nowrap;flex-shrink:0;">Take the quiz →</button>
      </div>
    </div>
  `;

  const list = el.querySelector('.js-path-list');

  ALL_PATHS.forEach(path => {
    const c = pathColor(path.id);
    const card = document.createElement('div');
    card.className = 'path-card';
    card.style.cssText = `cursor:pointer;border-left-color:${c.border};`;
    card.innerHTML = `
      <div class="path-card-header">
        <div>
          <div class="path-name" style="color:${c.text};">${path.name}</div>
          <div class="path-tagline">${path.tagline}</div>
        </div>
        <span style="font-size:18px;color:${c.border};transition:transform 0.2s;">›</span>
      </div>
      <div class="path-meta" style="margin-bottom:10px;">${path.meta}</div>
      <div class="js-detail" style="display:none;">
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:10px;">${path.description}</div>
        ${path.branches ? `
          <div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text-tertiary);margin-bottom:6px;">Three formats</div>
          ${path.branches.map(b => `
            <div style="padding:8px 10px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:5px;">
              <div style="font-size:13px;font-weight:500;margin-bottom:1px;">${b.name}</div>
              <div style="font-size:12px;color:var(--text-secondary);">${b.desc}</div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px;">${b.meta}</div>
            </div>
          `).join('')}
        ` : `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div class="surface" style="margin-bottom:0;font-size:12px;"><span style="color:var(--text-tertiary);">Income now</span><br>${path.income_now}</div>
            <div class="surface" style="margin-bottom:0;font-size:12px;"><span style="color:var(--text-tertiary);">Freedom</span><br>${path.freedom}</div>
            <div class="surface" style="margin-bottom:0;font-size:12px;"><span style="color:var(--text-tertiary);">If you change your mind</span><br>${path.flexibility}</div>
            <div class="surface" style="margin-bottom:0;font-size:12px;"><span style="color:var(--text-tertiary);">5-year outlook</span><br>${path.outlook}</div>
          </div>
        `}
        <button class="btn js-read-more" style="margin-top:12px;font-size:12px;" data-id="${path.id}">Read full guide →</button>
      </div>
    `;

    const detail = card.querySelector('.js-detail');
    const arrow = card.querySelector('span');
    let open = false;

    card.addEventListener('click', e => {
      if (e.target.closest('.js-read-more')) return;
      open = !open;
      detail.style.display = open ? 'block' : 'none';
      arrow.style.transform = open ? 'rotate(90deg)' : '';
      arrow.style.transition = 'transform 0.2s';
    });

    card.querySelector('.js-read-more').addEventListener('click', e => {
      e.stopPropagation();
      showPathDetailModal(path);
    });

    list.appendChild(card);
  });

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-quiz').addEventListener('click', onStartQuiz);

  return el;
}
