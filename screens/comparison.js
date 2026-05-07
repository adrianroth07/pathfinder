import { FIELD_AREAS } from '../data/paths.js';

const FIELD_LABEL = Object.fromEntries(FIELD_AREAS.map(f => [f.id, f.label]));
import { pathColor } from '../data/colors.js';

const ROWS = [
  { label: 'Typical day', key: 'typical_day' },
  { label: 'Income now', key: 'income_now' },
  { label: 'Freedom', key: 'freedom' },
  { label: 'If you change your mind', key: 'flexibility' },
  { label: '5-year outlook', key: 'outlook' },
];

export function renderComparison({ paths, selectedClusters, onNext, onBack }) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    <div class="nav">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div class="nav-meta">Step 4 of 5</div>
      <div></div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:85%"></div>
    </div>
    <div class="section">
      <div class="heading">Compare your 3 paths</div>
      <div class="subheading">All filtered to your profile. No AI in this view — just the facts.</div>
      <div style="overflow-x:auto;">
        <div class="js-table" style="min-width:460px;"></div>
      </div>
      <div class="step-actions">
        <button class="btn js-back">← Back</button>
        <button class="btn btn-primary js-next">Read real stories →</button>
      </div>
    </div>
    <div class="ai-bar">
      <div class="ai-dot"></div>
      <span>Have a specific question? Ask — AI answers only what you ask, nothing more.</span>
    </div>
  `;

  const table = el.querySelector('.js-table');

  // Header row
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;';
  headerRow.innerHTML = `<div style="width:110px;flex-shrink:0;"></div>`;

  paths.forEach(path => {
    const fieldMatch = path.fields.find(f => selectedClusters && selectedClusters.includes(f));
    const clusterLabel = fieldMatch ? FIELD_LABEL[fieldMatch] : path.tagline;
    const c = pathColor(path.id);
    const cell = document.createElement('div');
    cell.className = 'compare-header';
    cell.style.cssText = `flex:1;background:${c.bg};border-top-color:${c.border};color:${c.text};`;
    cell.innerHTML = `${path.name}<br><span style="font-size:11px;font-weight:500;color:${c.text};opacity:0.7;">${clusterLabel}</span>`;
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);

  // Data rows
  ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.style.cssText = 'display:flex;gap:8px;margin-bottom:4px;';
    rowEl.innerHTML = `<div class="compare-label">${row.label}</div>`;
    paths.forEach(path => {
      const cell = document.createElement('div');
      cell.className = 'compare-cell';
      cell.textContent = path[row.key] || '—';
      rowEl.appendChild(cell);
    });
    table.appendChild(rowEl);
  });

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-next').addEventListener('click', onNext);

  return el;
}
