const QUALS = [
  { id: 'abitur', label: 'Abitur',         sublabel: 'final / 13th grade', color: '#2563EB' },
  { id: 'real',   label: 'Realabschluss',  sublabel: '10th grade',          color: '#EA580C' },
  { id: 'haupt',  label: 'Hauptabschluss', sublabel: '9th grade',           color: '#9333EA' },
];

const MAP_PATHS = [
  { id: 'studium',     label: 'University',   sublabel: '(higher education)',       note: null,              branches: ['Normal uni', 'Applied Sciences', 'Dual studies'] },
  { id: 'ausbildung',  label: 'Ausbildung',   sublabel: '(vocational training)',    note: null,              branches: ['such as....'] },
  { id: 'fsj',         label: 'FSJ',          sublabel: '(voluntary social year)',  note: 'only for ages 16–27', branches: ['such as....'] },
  { id: 'gap-year',    label: 'Gap Year',     sublabel: '',                         note: null,              branches: ['Travel', 'Courses', 'Volunteering abroad'] },
  { id: 'freelancing', label: 'Freelancing',  sublabel: '',                         note: null,              branches: ['such as....'] },
  { id: 'bundeswehr',  label: 'Bundeswehr',   sublabel: '(military training)',      note: 'only for ages 17+', branches: ['Voluntary service', 'Fixed contract', 'Officer career'] },
];

const CONNECTIONS = [
  { from: 'abitur', to: 'studium',     style: 'solid',  note: null },
  { from: 'abitur', to: 'ausbildung',  style: 'solid',  note: null },
  { from: 'abitur', to: 'fsj',         style: 'solid',  note: null },
  { from: 'abitur', to: 'gap-year',    style: 'solid',  note: null },
  { from: 'abitur', to: 'freelancing', style: 'solid',  note: null },
  { from: 'abitur', to: 'bundeswehr',  style: 'solid',  note: null },

  { from: 'real', to: 'studium',     style: 'dashed', note: 'complete FOS, apply to ...' },
  { from: 'real', to: 'ausbildung',  style: 'solid',  note: null },
  { from: 'real', to: 'fsj',         style: 'solid',  note: null },
  { from: 'real', to: 'gap-year',    style: 'solid',  note: null },
  { from: 'real', to: 'freelancing', style: 'solid',  note: null },
  { from: 'real', to: 'bundeswehr',  style: 'solid',  note: null },

  { from: 'haupt', to: 'ausbildung',  style: 'solid',  note: null },
  { from: 'haupt', to: 'fsj',         style: 'solid',  note: null },
  { from: 'haupt', to: 'gap-year',    style: 'solid',  note: null },
  { from: 'haupt', to: 'freelancing', style: 'dashed', note: 'may need to complete courses' },
  { from: 'haupt', to: 'bundeswehr',  style: 'solid',  note: null },
];

function stickFigure(color) {
  return `<svg width="30" height="42" viewBox="0 0 30 42" fill="none">
    <circle cx="15" cy="7" r="6.5" stroke="${color}" stroke-width="2.2"/>
    <line x1="15" y1="13.5" x2="15" y2="29" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="4" y1="20" x2="26" y2="20" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="15" y1="29" x2="6"  y2="42" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="15" y1="29" x2="24" y2="42" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

export function renderMap({ onBack }) {
  const el = document.createElement('div');
  el.className = 'screen';
  const qualColors = Object.fromEntries(QUALS.map(q => [q.id, q.color]));

  el.innerHTML = `
    <div class="nav">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div class="nav-meta">Path map</div>
      <button class="nav-link js-back">← Back</button>
    </div>
    <div class="section">
      <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.02em;text-align:center;margin-bottom:32px;">German Post-School Pathways</h1>

      <div class="js-map-wrap" style="position:relative;overflow-x:auto;">
        <svg class="js-svg" style="position:absolute;top:0;left:0;pointer-events:none;overflow:visible;"></svg>

        <div class="js-map-grid" style="display:grid;grid-template-columns:130px 1fr 150px;min-width:580px;align-items:stretch;">

          <!-- Col 1: Qualification levels -->
          <div style="display:flex;flex-direction:column;padding:8px 0;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:16px;line-height:1.4;">School leaving<br>qualification level</div>
            <div style="flex:1;display:flex;flex-direction:column;justify-content:space-around;">
              ${QUALS.map(q => `
                <div class="js-qual" data-id="${q.id}" style="cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:6px 8px;border-radius:var(--radius-md);transition:background 0.15s;user-select:none;">
                  ${stickFigure(q.color)}
                  <div style="font-size:14px;font-weight:700;color:${q.color};line-height:1.2;">${q.label}</div>
                  <div style="font-size:10px;color:var(--text-tertiary);">${q.sublabel}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Col 2: Paths (centred with padding for arrow lanes) -->
          <div style="display:flex;flex-direction:column;gap:11px;padding:38px 20px 8px 70px;">
            ${MAP_PATHS.map(p => `
              <div class="js-path" data-id="${p.id}" style="padding:11px 18px;background:var(--green-light);border-radius:var(--radius-lg);border:1.5px solid var(--green-mid);">
                <div style="font-size:14px;font-weight:700;color:var(--green-text);">${p.label}</div>
                ${p.sublabel ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:1px;">${p.sublabel}</div>` : ''}
                ${p.note ? `<div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;">${p.note}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Col 3: Sub-options -->
          <div style="display:flex;flex-direction:column;gap:11px;padding:38px 0 8px 30px;">
            ${MAP_PATHS.map(p => `
              <div class="js-branch-col" data-path="${p.id}" style="display:flex;flex-direction:column;gap:4px;justify-content:center;">
                ${p.branches.map(b => `
                  <div style="padding:4px 9px;border-radius:8px;background:var(--green-light);border:1px solid var(--green-mid);font-size:10px;color:var(--green-text);text-align:center;line-height:1.4;">${b}</div>
                `).join('')}
              </div>
            `).join('')}
          </div>

        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const wrap = el.querySelector('.js-map-wrap');
    const svg  = el.querySelector('.js-svg');
    const wrapRect = wrap.getBoundingClientRect();
    const gridH = el.querySelector('.js-map-grid').getBoundingClientRect().height;

    svg.setAttribute('width',  wrapRect.width);
    svg.setAttribute('height', gridH);

    // Arrow markers for each qual
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    QUALS.forEach(q => {
      ['solid','dashed'].forEach(style => {
        const m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        m.setAttribute('id', `arr-${q.id}-${style}`);
        m.setAttribute('markerWidth', '7');
        m.setAttribute('markerHeight', '7');
        m.setAttribute('refX', '5');
        m.setAttribute('refY', '3.5');
        m.setAttribute('orient', 'auto');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', '0 0, 5 3.5, 0 7');
        poly.setAttribute('fill', style === 'dashed' ? q.color + 'aa' : q.color);
        m.appendChild(poly);
        defs.appendChild(m);
      });
    });
    // Green marker for path→branch
    const gm = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    gm.setAttribute('id', 'arr-branch');
    gm.setAttribute('markerWidth', '7'); gm.setAttribute('markerHeight', '7');
    gm.setAttribute('refX', '5'); gm.setAttribute('refY', '3.5');
    gm.setAttribute('orient', 'auto');
    const gp = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    gp.setAttribute('points', '0 0, 5 3.5, 0 7');
    gp.setAttribute('fill', '#9ACABB');
    gm.appendChild(gp);
    defs.appendChild(gm);
    svg.appendChild(defs);

    const svgLines = [];

    // Qual → Path connections
    CONNECTIONS.forEach(conn => {
      const fromEl = el.querySelector(`.js-qual[data-id="${conn.from}"]`);
      const toEl   = el.querySelector(`.js-path[data-id="${conn.to}"]`);
      if (!fromEl || !toEl) return;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();

      const x1 = fr.right  - wrapRect.left;
      const y1 = (fr.top + fr.bottom) / 2 - wrapRect.top;
      const x2 = tr.left   - wrapRect.left;
      const y2 = (tr.top + tr.bottom) / 2 - wrapRect.top;

      const color    = qualColors[conn.from];
      const isDashed = conn.style === 'dashed';

      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      pathEl.setAttribute('x1', x1); pathEl.setAttribute('y1', y1);
      pathEl.setAttribute('x2', x2); pathEl.setAttribute('y2', y2);
      pathEl.setAttribute('stroke', isDashed ? color + 'aa' : color);
      pathEl.setAttribute('stroke-width', isDashed ? '1.2' : '1.6');
      pathEl.setAttribute('opacity', isDashed ? '0.7' : '0.65');
      if (isDashed) pathEl.setAttribute('stroke-dasharray', '5 4');
      pathEl.setAttribute('marker-end', `url(#arr-${conn.from}-${conn.style})`);
      pathEl.dataset.from  = conn.from;
      pathEl.dataset.to    = conn.to;
      pathEl.dataset.style = conn.style;
      svg.appendChild(pathEl);
      svgLines.push(pathEl);

      // Note label along the line
      if (conn.note) {
        const mx    = (x1 + x2) / 2;
        const my    = (y1 + y2) / 2;
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const txt   = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('transform', `translate(${mx},${my}) rotate(${angle})`);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('dy', '-4');
        txt.setAttribute('font-size', '9');
        txt.setAttribute('font-style', 'italic');
        txt.setAttribute('fill', color);
        txt.setAttribute('opacity', '0.85');
        txt.textContent = conn.note;
        svg.appendChild(txt);
      }
    });

    // Path → Branch lines
    MAP_PATHS.forEach(p => {
      const fromEl = el.querySelector(`.js-path[data-id="${p.id}"]`);
      const toEl   = el.querySelector(`.js-branch-col[data-path="${p.id}"]`);
      if (!fromEl || !toEl || p.branches.length === 0) return;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      if (tr.height < 2) return;

      const x1 = fr.right - wrapRect.left;
      const y1 = (fr.top + fr.bottom) / 2 - wrapRect.top;
      const x2 = tr.left  - wrapRect.left;
      const y2 = (tr.top + tr.bottom) / 2 - wrapRect.top;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#9ACABB');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('marker-end', 'url(#arr-branch)');
      line.classList.add('js-branch-line');
      svg.appendChild(line);
    });

    // Interactive highlight on qual click
    let active = null;

    QUALS.forEach(q => {
      const qualEl = el.querySelector(`.js-qual[data-id="${q.id}"]`);
      if (!qualEl) return;

      qualEl.addEventListener('click', () => {
        if (active === q.id) {
          active = null;
          reset();
          return;
        }
        active = q.id;
        reset();

        qualEl.style.background = q.color + '18';
        const connected = new Set(CONNECTIONS.filter(c => c.from === q.id).map(c => c.to));

        svgLines.forEach(l => {
          if (l.dataset.from === q.id) {
            l.setAttribute('stroke', l.dataset.style === 'dashed' ? q.color + 'cc' : q.color);
            l.setAttribute('stroke-width', '2.5');
            l.setAttribute('opacity', '1');
          } else {
            l.setAttribute('opacity', '0.07');
          }
        });

        el.querySelectorAll('.js-path').forEach(p => {
          p.style.opacity = connected.has(p.dataset.id) ? '1' : '0.2';
        });
      });
    });

    function reset() {
      el.querySelectorAll('.js-qual').forEach(q => { q.style.background = ''; });
      svgLines.forEach(l => {
        const isDashed = l.dataset.style === 'dashed';
        const color    = qualColors[l.dataset.from];
        l.setAttribute('stroke', isDashed ? color + 'aa' : color);
        l.setAttribute('stroke-width', isDashed ? '1.2' : '1.6');
        l.setAttribute('opacity', isDashed ? '0.7' : '0.65');
      });
      el.querySelectorAll('.js-path').forEach(p => { p.style.opacity = '1'; });
    }
  });

  el.querySelector('.js-back').addEventListener('click', onBack);
  return el;
}
