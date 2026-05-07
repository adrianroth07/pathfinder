import { ALL_PATHS, FIELD_AREAS } from '../data/paths.js';
import { pathColor } from '../data/colors.js';
import { showPathDetailModal } from './path-detail-modal.js';

// First 3 examples per field — shown as "Fields it covers" on expanded cards
const FIELD_AREA_EXAMPLES = Object.fromEntries(
  FIELD_AREAS.map(f => [f.id, f.examples.slice(0, 3).join(', ')])
);

const COMPARE_ROWS = [
  { label: 'Duration',            key: 'meta' },
  { label: 'Typical day',         key: 'typical_day' },
  { label: 'Income now',          key: 'income_now' },
  { label: 'Freedom',             key: 'freedom' },
  { label: 'If you change mind',  key: 'flexibility' },
  { label: '5-year outlook',      key: 'outlook' },
];

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
      <div class="subheading" style="margin-bottom:4px;">6 routes after school in Germany. Tap any card for the full overview.</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:20px;">Or tap <strong>Compare</strong> on up to 3 paths to see them side by side.</div>
      <div class="js-path-list"></div>
      <div class="js-compare-table" style="display:none;margin-bottom:24px;"></div>
      <div style="margin-top:24px;padding:16px 18px;background:var(--green-light);border-radius:var(--radius-lg);display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--green-text);margin-bottom:2px;">Not sure which fits you?</div>
          <div style="font-size:12px;color:var(--text-secondary);">Take the quiz and get 3 personalised suggestions.</div>
        </div>
        <button class="btn js-quiz" style="background:var(--green-primary);color:#fff;border-color:var(--green-primary);white-space:nowrap;flex-shrink:0;">Take the quiz →</button>
      </div>
    </div>

    <div class="js-compare-bar" style="display:none;position:sticky;bottom:0;left:0;right:0;background:var(--green-primary);padding:12px 20px;display:none;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid rgba(255,255,255,0.15);z-index:100;">
      <div style="color:#fff;font-size:13px;font-weight:500;" class="js-bar-label">2 paths selected</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="js-clear-compare" style="background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;">Clear</button>
        <button class="js-do-compare" style="background:#fff;color:var(--green-primary);border:none;border-radius:6px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;">Compare →</button>
      </div>
    </div>
  `;

  const list = el.querySelector('.js-path-list');
  const compareTable = el.querySelector('.js-compare-table');
  const compareBar = el.querySelector('.js-compare-bar');
  const barLabel = el.querySelector('.js-bar-label');

  const selected = new Set();
  const cardEls = {};

  function updateBar() {
    const n = selected.size;
    if (n >= 2) {
      compareBar.style.display = 'flex';
      barLabel.textContent = `${n} path${n > 1 ? 's' : ''} selected`;
    } else {
      compareBar.style.display = 'none';
      compareTable.style.display = 'none';
    }
  }

  function renderCompareTable() {
    const paths = ALL_PATHS.filter(p => selected.has(p.id));
    compareTable.innerHTML = '';
    compareTable.style.display = 'block';

    const heading = document.createElement('div');
    heading.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;padding-top:4px;';
    heading.textContent = 'Side-by-side comparison';
    compareTable.appendChild(heading);

    const wrap = document.createElement('div');
    wrap.style.cssText = 'overflow-x:auto;';

    const table = document.createElement('div');
    table.style.cssText = `min-width:${paths.length * 140 + 110}px;`;

    // Header
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;gap:6px;margin-bottom:4px;';
    headerRow.innerHTML = `<div style="width:110px;flex-shrink:0;"></div>`;
    paths.forEach(path => {
      const c = pathColor(path.id);
      const cell = document.createElement('div');
      cell.style.cssText = `flex:1;min-width:130px;padding:10px 12px;border-radius:var(--radius-md);background:${c.bg};border-top:3px solid ${c.border};`;
      cell.innerHTML = `<div style="font-size:13px;font-weight:700;color:${c.text};">${path.name}</div><div style="font-size:11px;color:${c.text};opacity:0.7;margin-top:2px;">${path.tagline}</div>`;
      headerRow.appendChild(cell);
    });
    table.appendChild(headerRow);

    // Data rows
    COMPARE_ROWS.forEach((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;gap:6px;margin-bottom:4px;';
      const labelCell = document.createElement('div');
      labelCell.style.cssText = 'width:110px;flex-shrink:0;font-size:11px;font-weight:500;color:var(--text-tertiary);display:flex;align-items:center;padding:0 4px;';
      labelCell.textContent = row.label;
      rowEl.appendChild(labelCell);
      paths.forEach(path => {
        const cell = document.createElement('div');
        cell.style.cssText = `flex:1;min-width:130px;font-size:12px;color:var(--text-secondary);padding:8px 12px;border-radius:var(--radius-md);background:${i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)'};line-height:1.4;`;
        cell.textContent = path[row.key] || '—';
        rowEl.appendChild(cell);
      });
      table.appendChild(rowEl);
    });

    // Branches row for Studium if selected
    const studium = paths.find(p => p.id === 'studium');
    if (studium) {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;gap:6px;margin-bottom:4px;';
      const labelCell = document.createElement('div');
      labelCell.style.cssText = 'width:110px;flex-shrink:0;font-size:11px;font-weight:500;color:var(--text-tertiary);display:flex;align-items:flex-start;padding:4px 4px 0;';
      labelCell.textContent = 'Formats';
      rowEl.appendChild(labelCell);
      paths.forEach(path => {
        const cell = document.createElement('div');
        cell.style.cssText = 'flex:1;min-width:130px;padding:8px 12px;border-radius:var(--radius-md);background:var(--bg-secondary);';
        if (path.branches) {
          cell.innerHTML = path.branches.map(b =>
            `<div style="font-size:12px;font-weight:500;color:var(--text-primary);">${b.name}</div><div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;">${b.desc}</div>`
          ).join('');
        } else {
          cell.style.cssText += 'display:flex;align-items:center;';
          cell.innerHTML = `<span style="font-size:12px;color:var(--text-tertiary);">—</span>`;
        }
        rowEl.appendChild(cell);
      });
      table.appendChild(rowEl);
    }

    wrap.appendChild(table);
    compareTable.appendChild(wrap);

    compareTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ALL_PATHS.forEach(path => {
    const c = pathColor(path.id);
    const card = document.createElement('div');
    card.className = 'path-card';
    card.style.cssText = `border-left-color:${c.border};cursor:pointer;`;

    const descSnippet = path.description.split('.')[0] + '.';
    const fieldExamples = (path.fields || [])
      .slice(0, 3)
      .map(f => FIELD_AREA_EXAMPLES[f])
      .filter(Boolean)
      .join(' · ');

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div style="flex:1;min-width:0;">
          <div class="path-name" style="color:${c.text};">${path.name}</div>
          <div class="path-tagline">${path.tagline}</div>
        </div>
        <button class="js-compare-toggle" data-id="${path.id}" style="font-size:11px;font-weight:500;padding:4px 9px;border-radius:20px;border:1px solid var(--border-secondary);background:var(--bg-secondary);color:var(--text-secondary);cursor:pointer;white-space:nowrap;flex-shrink:0;">Compare</button>
      </div>
      <div class="path-meta" style="margin-bottom:8px;">${path.meta}</div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-bottom:8px;">${descSnippet}</div>
      ${fieldExamples ? `<div style="font-size:11px;color:var(--text-tertiary);">${fieldExamples}</div>` : ''}
    `;

    const compareToggle = card.querySelector('.js-compare-toggle');

    card.addEventListener('click', e => {
      if (e.target.closest('.js-compare-toggle')) return;
      showPathDetailModal(path);
    });

    compareToggle.addEventListener('click', e => {
      e.stopPropagation();
      const id = path.id;
      if (selected.has(id)) {
        selected.delete(id);
        compareToggle.textContent = 'Compare';
        compareToggle.style.cssText = 'font-size:11px;font-weight:500;padding:4px 9px;border-radius:20px;border:1px solid var(--border-secondary);background:var(--bg-secondary);color:var(--text-secondary);cursor:pointer;white-space:nowrap;flex-shrink:0;';
        card.style.outline = '';
      } else {
        if (selected.size >= 3) return;
        selected.add(id);
        compareToggle.innerHTML = '✓ Added';
        compareToggle.style.cssText = `font-size:11px;font-weight:500;padding:4px 9px;border-radius:20px;border:1px solid ${c.border};background:${c.bg};color:${c.text};cursor:pointer;white-space:nowrap;flex-shrink:0;`;
        card.style.outline = `2px solid ${c.border}`;
        card.style.outlineOffset = '-2px';
      }
      compareTable.style.display = 'none';
      updateBar();
    });

    cardEls[path.id] = { card, compareToggle, c };
    list.appendChild(card);
  });

  el.querySelector('.js-do-compare').addEventListener('click', () => renderCompareTable());

  el.querySelector('.js-clear-compare').addEventListener('click', () => {
    selected.clear();
    Object.values(cardEls).forEach(({ card, compareToggle, c }) => {
      compareToggle.textContent = 'Compare';
      compareToggle.style.cssText = 'font-size:11px;font-weight:500;padding:4px 9px;border-radius:20px;border:1px solid var(--border-secondary);background:var(--bg-secondary);color:var(--text-secondary);cursor:pointer;white-space:nowrap;';
      card.style.outline = '';
    });
    compareTable.style.display = 'none';
    updateBar();
  });

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-quiz').addEventListener('click', onStartQuiz);

  return el;
}
