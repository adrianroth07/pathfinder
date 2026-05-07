import { STORIES } from '../data/stories.js';
import { ALL_PATHS } from '../data/paths.js';
import { pathColor } from '../data/colors.js';

export function renderStories({ paths, selectedClusters, onBack, onRestart }) {
  const el = document.createElement('div');
  el.className = 'screen';

  // Collect relevant stories for the suggested paths
  const relevantStories = [];
  paths.forEach(path => {
    const pathData = ALL_PATHS.find(p => p.id === path.id);
    if (!pathData) return;
    (pathData.stories || []).forEach(storyId => {
      const story = STORIES[storyId];
      if (story && !relevantStories.find(s => s.id === storyId)) {
        relevantStories.push({ id: storyId, ...story, pathName: pathData.name });
      }
    });
  });

  const pathNames = paths.map(p => p.name).join(', ');

  el.innerHTML = `
    <div class="nav">
      <div class="logo"><svg class="logo-compass" width="20" height="20" viewBox="0 0 22 22"><path class="logo-arc" d="M 11,2 C 16,2 20,6 20,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 20,11 C 20,16 16,20 11,20" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc" d="M 11,20 C 6,20 2,16 2,11" fill="none" stroke-width="2.5" stroke-linecap="round"/><path class="logo-arc-fade" d="M 2,11 C 2,6 6,2 11,2" fill="none" stroke-width="1.2" stroke-linecap="round"/><path class="logo-needle-n" d="M 11,11 C 8.5,9 8.5,5.5 11,4 C 13.5,5.5 13.5,9 11,11"/><path class="logo-needle-s" d="M 11,11 C 13.5,13 13.5,16.5 11,18 C 8.5,16.5 8.5,13 11,11"/><path class="logo-needle-ew" d="M 11,11 C 13,8.5 16.5,8.5 18,11 C 16.5,13.5 13,13.5 11,11"/><path class="logo-needle-ew" d="M 11,11 C 9,13.5 5.5,13.5 4,11 C 5.5,8.5 9,8.5 11,11"/><circle class="logo-dot-outer" cx="11" cy="11" r="1.5"/><circle class="logo-dot-inner" cx="11" cy="11" r="0.7"/></svg><span class="logo-path">Path</span><span class="logo-finder">finder</span></div>
      <div class="nav-meta">Step 5 of 5</div>
      <div></div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:100%"></div>
    </div>
    <div class="section">
      <div class="heading">Real stories — ${pathNames}</div>
      <div class="subheading">From people who took these paths. No AI anywhere on this screen.</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:20px;">Filtered to your profile</div>
      <div class="js-stories"></div>
      <div class="step-actions">
        <button class="btn js-back">← Back to comparison</button>
        <button class="btn btn-primary js-restart">Start over</button>
      </div>
    </div>
    <div class="no-ai-footer">No AI on this screen. Every story is submitted, curated and verified by the PathFinder team.</div>
  `;

  const storiesContainer = el.querySelector('.js-stories');

  relevantStories.forEach(story => {
    const c = pathColor(story.path);
    const card = document.createElement('div');
    card.className = 'story-card';
    card.style.cssText = `border-left:3px solid ${c.border};padding-left:18px;`;
    card.innerHTML = `
      <div style="display:flex;gap:12px;margin-bottom:10px;align-items:center;">
        <div class="story-avatar" style="background:${c.bg};"></div>
        <div>
          <div style="font-size:14px;font-weight:700;letter-spacing:-0.01em;">${story.name} — ${story.role}</div>
          <div style="font-size:12px;font-weight:500;color:${c.text};margin-top:1px;">${story.pathName}</div>
          <div style="font-size:12px;color:var(--text-tertiary);">${story.detail}</div>
        </div>
      </div>
      <div class="story-quote" style="margin-bottom:12px;">${story.quote}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="surface" style="font-size:12px;margin-bottom:0;">
          <span style="color:var(--text-tertiary);">Why this path?</span><br>${story.why}
        </div>
        <div class="surface" style="font-size:12px;margin-bottom:0;">
          <span style="color:var(--text-tertiary);">To your 17-year-old self?</span><br>${story.advice}
        </div>
      </div>
    `;
    storiesContainer.appendChild(card);
  });

  if (relevantStories.length === 0) {
    storiesContainer.innerHTML = `<div style="font-size:13px;color:var(--text-tertiary);text-align:center;padding:24px 0;">Stories for these paths are coming soon.</div>`;
  }

  el.querySelector('.js-back').addEventListener('click', onBack);
  el.querySelector('.js-restart').addEventListener('click', onRestart);

  return el;
}
