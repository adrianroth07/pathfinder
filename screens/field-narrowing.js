import { CLUSTER_LABELS } from '../data/paths.js';

export function renderFieldNarrowing({ selectedClusters, paths, onToggle, onNext, onBack }) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    <div class="nav">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div class="nav-meta">Step 3.5 of 5</div>
      <div></div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:70%"></div>
    </div>
    <div class="section">
      <div class="heading">What kind of work feels right?</div>
      <div class="subheading">Not what job — what kind of day. Pick all that feel true.</div>
      <div class="cluster-grid js-clusters"></div>
      <div class="surface js-summary" style="display:none;"></div>
      <div class="step-actions">
        <button class="btn js-back">← Back</button>
        <button class="btn btn-primary js-next">See comparison →</button>
      </div>
    </div>
    <div class="ai-bar">
      <div class="ai-dot"></div>
      <span>Not sure which cluster fits? Ask — AI helps you think it through.</span>
    </div>
  `;

  const grid = el.querySelector('.js-clusters');
  const summary = el.querySelector('.js-summary');
  const current = new Set(selectedClusters || []);

  function updateSummary() {
    if (current.size === 0) {
      summary.style.display = 'none';
      return;
    }
    const matches = paths.filter(p => p.clusters.some(c => current.has(c)));
    if (matches.length === 0) {
      summary.style.display = 'none';
      return;
    }
    const clusterLabels = [...current].map(c => CLUSTER_LABELS[c]).join(' & ');
    summary.style.display = 'block';
    summary.innerHTML = `Your results are now specific: <strong>${matches[0].name} — ${clusterLabels}</strong>`;
  }

  Object.entries(CLUSTER_LABELS).forEach(([key, label]) => {
    const subLabels = {
      'hands-on': 'Physical work, tools, tangible results',
      'people': 'Support, healthcare, education',
      'creative': 'Design, media, content, tech',
      'analytical': 'Research, numbers, systems',
      'nature': 'Outdoors, sustainability',
      'business': 'Management, admin, entrepreneurship',
    };

    const card = document.createElement('div');
    card.className = 'cluster-card' + (current.has(key) ? ' selected' : '');
    card.innerHTML = `
      <div class="cluster-title">${label}</div>
      <div class="cluster-sub">${subLabels[key]}</div>
    `;
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      onToggle([...current]);
      updateSummary();
    });
    grid.appendChild(card);
  });

  updateSummary();
  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-next').addEventListener('click', onNext);

  return el;
}
