import { PATH_DETAILS } from '../data/path-details.js';

const BRANCH_NAMES = {
  uni:  'Universität',
  fh:   'Fachhochschule (FH)',
  dual: 'Duales Studium',
};

function label(text) {
  return `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:4px;">${text}</div>`;
}

function detailSections(d) {
  return `
    <p style="font-size:13px;color:var(--text-secondary);line-height:1.65;margin-bottom:14px;">${d.description}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
      <div class="surface" style="margin:0;font-size:12px;line-height:1.55;">${label('Duration')}${d.duration}</div>
      <div class="surface" style="margin:0;font-size:12px;line-height:1.55;">${label('Money')}${d.money}</div>
    </div>
    <div class="surface" style="margin-bottom:8px;font-size:12px;line-height:1.55;">${label('Typical week')}${d.typical_week}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
      <div class="surface" style="margin:0;font-size:12px;line-height:1.55;">${label('Entry requirements')}${d.entry}</div>
      <div class="surface" style="margin:0;font-size:12px;line-height:1.55;">${label('What comes after')}${d.after}</div>
    </div>
    ${d.misconception ? `
      <div style="padding:10px 14px;background:var(--bg-warning);border-left:3px solid #F59E0B;border-radius:var(--radius-md);margin-bottom:10px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-warning);margin-bottom:4px;">Common misconception</div>
        <div style="font-size:12px;color:var(--text-primary);line-height:1.55;">${d.misconception}</div>
      </div>
    ` : ''}
    ${d.sources ? `<div style="font-size:11px;color:var(--text-tertiary);line-height:1.6;">${d.sources}</div>` : ''}
  `;
}

function buildBody(path) {
  const detail = PATH_DETAILS[path.id];

  if (path.id === 'studium' && detail?.branches) {
    return `
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.65;margin-bottom:14px;">${path.description}</p>
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:8px;">Three formats — click to expand</div>
      ${Object.entries(detail.branches).map(([id, bd]) => `
        <details style="border:1.5px solid var(--border-tertiary);border-radius:var(--radius-md);margin-bottom:8px;overflow:hidden;">
          <summary style="padding:11px 16px;font-size:13px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;background:var(--bg-secondary);">
            ${BRANCH_NAMES[id]}
            <span style="font-size:11px;color:var(--text-tertiary);font-weight:400;">▸</span>
          </summary>
          <div style="padding:14px 16px;">${detailSections(bd)}</div>
        </details>
      `).join('')}
    `;
  }

  if (detail) return detailSections(detail);

  // Fallback for paths without detail content yet
  return `
    <p style="font-size:13px;color:var(--text-secondary);line-height:1.65;">${path.description}</p>
    <div style="font-size:12px;color:var(--text-tertiary);margin-top:10px;">${path.meta}</div>
  `;
}

export function showPathDetailModal(path) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:600px;">
      <div class="modal-title" style="font-size:18px;font-weight:700;">${path.name}</div>
      <div class="modal-sub">${path.tagline}</div>
      ${buildBody(path)}
      <div class="modal-actions">
        <button class="btn js-close">Close</button>
      </div>
    </div>
  `;
  overlay.querySelector('.js-close').addEventListener('click', () => document.body.removeChild(overlay));
  overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });
  document.body.appendChild(overlay);
}
