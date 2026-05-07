import { ALL_PATHS } from '../data/paths.js';
import { pathColor } from '../data/colors.js';
import { showPathDetailModal } from './path-detail-modal.js';

const SUBHEADINGS = {
  lena:  'Three broad directions to start exploring. Read the stories — there\'s no need to pick anything today.',
  malik: 'Three options — read the stories and see which one resonates. Swap any you don\'t want.',
  clear: 'Sense-checking what you already think. These are directions, not verdicts — the decision is still yours.',
  null:  'These are directions, not prescriptions. Read the stories, consider the steps — the decision is yours. Swap any you don\'t want.',
};

const BLOCK_LABELS = {
  money:        'money pressure',
  family:       'what others might think',
  'wrong-choice': 'fear of choosing wrong',
  behind:       'feeling behind',
};

export function renderPaths({
  suggestedPaths, wildcardPaths, reasons, userMode,
  unsureCount, successPicture, blocks, blocksOther,
  savickasAnswers, onConfirm, onSwap,
}) {
  const el = document.createElement('div');
  el.className = 'screen';

  const subheading = SUBHEADINGS[userMode] || SUBHEADINGS.null;
  const meaningfulBlocks = (blocks || []).filter(b => b !== 'other');
  const hasOther = (blocks || []).includes('other') && blocksOther;

  // Acknowledgement banners: unsure, blocks, success picture, savickas
  let ackHTML = '';

  if (unsureCount >= 3) {
    ackHTML += `
      <div class="results-ack">
        You weren't sure on ${unsureCount} questions — that's completely normal.
        Here are some broader directions to start with rather than forcing a decision.
      </div>`;
  }

  if (successPicture) {
    const preview = successPicture.length > 120 ? successPicture.slice(0, 117) + '…' : successPicture;
    ackHTML += `
      <div class="results-ack results-ack-quote">
        <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--text-tertiary);display:block;margin-bottom:4px;">You said</span>
        "${preview}"
      </div>`;
  }

  if (savickasAnswers && (savickasAnswers.roleModel || savickasAnswers.motto || savickasAnswers.story)) {
    const ref = savickasAnswers.motto
      ? `Your motto — "${savickasAnswers.motto}" — shaped how we framed things here.`
      : savickasAnswers.roleModel
        ? `You admire ${savickasAnswers.roleModel} — we've kept that in mind.`
        : `You keep coming back to ${savickasAnswers.story} — worth thinking about why.`;
    ackHTML += `<div class="results-ack" style="font-style:italic;">${ref}</div>`;
  }

  if (meaningfulBlocks.length > 0 || hasOther) {
    const blockText = meaningfulBlocks.map(b => BLOCK_LABELS[b] || b).join(' and ');
    const mention = hasOther ? (blockText ? `${blockText}, and: "${blocksOther}"` : `"${blocksOther}"`) : blockText;
    ackHTML += `
      <div class="results-ack">
        You mentioned ${mention}. None of these paths are final — each one has a concrete next step you can try this week without committing to anything.
      </div>`;
  }

  el.innerHTML = `
    <div class="nav">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div class="nav-meta">Step 2 of 5</div>
      <div></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:40%"></div></div>
    <div class="section">
      <div class="heading">Explore these paths</div>
      <div class="subheading">${subheading}</div>
      ${ackHTML}
      <div class="js-path-list"></div>
      <div class="row-end" style="margin-top:8px;">
        <button class="btn btn-primary js-confirm">Continue →</button>
      </div>
    </div>
    <div class="paths-footer">
      PathFinder shows options — it never tells you what to choose. No account. No data stored. No upsell. Anonymous by default.
    </div>
  `;

  const list = el.querySelector('.js-path-list');

  function buildCard(path, i, wildcardIndex) {
    const isWildcard = wildcardIndex !== null;
    const card = document.createElement('div');
    card.className = 'path-card';
    const c = pathColor(path.id);
    card.style.borderLeftColor = isWildcard ? '#B45309' : c.border;

    const branchesHTML = path.branches ? `
      <div style="margin:10px 0 2px;">
        <div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text-tertiary);margin-bottom:6px;">Three formats — same path</div>
        ${path.branches.map(b => `
          <div style="padding:8px 10px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:5px;">
            <div style="font-size:13px;font-weight:500;margin-bottom:1px;">${b.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${b.desc}</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px;">${b.meta}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const storyHTML = path.human_story ? `
      <div class="path-story">
        <div class="path-story-quote">"${path.human_story.quote}"</div>
        <div class="path-story-name">${path.human_story.name} · ${path.human_story.detail}</div>
      </div>
    ` : '';

    const stepsHTML = path.nextSteps ? `
      <div class="path-action-plan">
        <div class="path-action-title">If you want to explore this</div>
        ${path.nextSteps.map((step, n) => `
          <div class="path-action-step">
            <span class="path-action-num">${n + 1}</span>
            <span>${step}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const wildcardLabel = wildcardIndex === 1 ? 'Something unexpected' : 'Another surprise';
    const wildcardBadge = isWildcard ? `<div class="wildcard-badge">${wildcardLabel}</div>` : '';
    const badgeSpan = isWildcard
      ? `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:#FFFBEB;color:#B45309;letter-spacing:.04em;">Wildcard</span>`
      : `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${c.bg};color:${c.text};letter-spacing:.04em;">Path ${i + 1}</span>`;

    const reasonText = isWildcard
      ? 'This path ranked high in your profile even though it wasn\'t in your top three — worth a look before you decide.'
      : (reasons[path.id] || '');

    card.innerHTML = `
      <div class="path-card-header">
        <div style="flex:1;min-width:0;">
          ${wildcardBadge}
          <div class="path-name" style="color:${isWildcard ? '#B45309' : c.text};">${path.name}</div>
          <div class="path-tagline">${path.tagline}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          ${badgeSpan}
          <button class="path-dismiss js-dismiss" title="Dismiss this path">×</button>
        </div>
      </div>
      <div class="path-reason">"${reasonText}"</div>
      <div class="path-meta">${path.meta}</div>
      ${branchesHTML}
      ${storyHTML}
      ${stepsHTML}
      <div class="path-actions">
        ${!isWildcard ? `<button class="btn btn-sm js-swap" data-index="${i}">Swap path</button>` : ''}
        <button class="btn btn-sm js-detail" style="color:${isWildcard ? '#B45309' : c.text};border-color:${isWildcard ? '#F59E0B' : c.border};">What is this?</button>
      </div>
    `;

    card.querySelector('.js-dismiss').addEventListener('click', () => {
      card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      card.style.opacity = '0';
      card.style.transform = 'translateX(8px)';
      setTimeout(() => { card.style.display = 'none'; }, 220);
    });

    const swapBtn = card.querySelector('.js-swap');
    if (swapBtn) swapBtn.addEventListener('click', () => showSwapModal(i));

    card.querySelector('.js-detail').addEventListener('click', () => showPathDetailModal(path));

    return card;
  }

  function renderPathCards(paths) {
    list.innerHTML = '';
    paths.forEach((path, i) => list.appendChild(buildCard(path, i, null)));

    if (wildcardPaths && wildcardPaths.length > 0) {
      const divider = document.createElement('div');
      divider.style.cssText = 'height:0.5px;background:var(--border-tertiary);margin:16px 0 14px;';
      list.appendChild(divider);
      wildcardPaths.forEach((wp, wi) => list.appendChild(buildCard(wp, paths.length + wi, wi + 1)));
    }
  }

  function showSwapModal(slotIndex) {
    const usedIds = new Set([
      ...suggestedPaths.map(p => p.id),
      ...(wildcardPaths || []).map(p => p.id),
    ]);
    const available = ALL_PATHS.filter(p => !usedIds.has(p.id));

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Swap path ${slotIndex + 1}</div>
        <div class="modal-sub">Choose a different path for this slot.</div>
        <div class="js-swap-list"></div>
        <div class="modal-actions"><button class="btn js-close">Cancel</button></div>
      </div>
    `;

    const swapList = overlay.querySelector('.js-swap-list');
    available.forEach(path => {
      const opt = document.createElement('div');
      opt.className = 'swap-option';
      opt.innerHTML = `
        <div>
          <div class="swap-option-name">${path.name}</div>
          <div class="swap-option-meta">${path.meta}</div>
        </div>
        <button class="btn btn-sm btn-primary">Select</button>
      `;
      opt.querySelector('button').addEventListener('click', () => {
        onSwap(slotIndex, path);
        suggestedPaths[slotIndex] = path;
        renderPathCards(suggestedPaths);
        document.body.removeChild(overlay);
      });
      swapList.appendChild(opt);
    });

    overlay.querySelector('.js-close').addEventListener('click', () => document.body.removeChild(overlay));
    overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });
    document.body.appendChild(overlay);
  }

  renderPathCards(suggestedPaths);
  el.querySelector('.js-confirm').addEventListener('click', onConfirm);
  return el;
}
