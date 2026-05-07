import { ALL_PATHS, CERT_RANK } from '../data/paths.js';
import { ROUND1_QUESTIONS } from '../data/questions.js';

const OPTION_TYPE_MAP = {};
ROUND1_QUESTIONS.forEach(q => {
  q.options.forEach(opt => { OPTION_TYPE_MAP[opt.id] = opt.type; });
});

// 'unsure' type answers are excluded from all RIASEC counts
export function countTypes(selectedIds) {
  const counts = {};
  selectedIds.forEach(id => {
    const type = OPTION_TYPE_MAP[id];
    if (type && type !== 'unsure') counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}

export function shouldEndRound1(round1Answers) {
  if (round1Answers.length < 3) return false;
  const last3 = round1Answers.slice(-3);
  const top2PerQuestion = last3.map(answers => {
    const counts = countTypes(answers);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2).map(e => e[0]).sort().join(',');
  });
  if (!top2PerQuestion[0]) return false;
  return top2PerQuestion[0] === top2PerQuestion[1] &&
         top2PerQuestion[1] === top2PerQuestion[2];
}

export function computeRiasec(round1Answers) {
  const allIds = Object.values(round1Answers).flat();
  return countTypes(allIds);
}

// Count how many R1 questions got an 'unsure' answer
export function countUnsure(round1Answers) {
  return Object.values(round1Answers).flat().filter(id => id.endsWith('_u')).length;
}

export function extractLifestyle(round2Answers) {
  const allIds = Object.values(round2Answers).flat();
  const anchorId = allIds.find(id => id.startsWith('r2q0_'));
  return {
    anchor: anchorId ? anchorId.replace('r2q0_', '') : null,
    wantsIncomeNow: allIds.includes('r2q1_high'),
    studyOpen: allIds.includes('r2q3_yes') || allIds.includes('r2q3_open'),
    prefersStructure: allIds.includes('r2q2_structured'),
    prefersFlexibility: allIds.includes('r2q2_flexible'),
    riskAverse: allIds.includes('r2q4_secure'),
    explorer: allIds.includes('r2q4_explore'),
  };
}

const ANCHOR_BOOSTS = {
  tech:    { ausbildung: 2, studium: 1, bundeswehr: 1 },
  auto:    { freelancing: 3, 'gap-year': 2 },
  secure:  { ausbildung: 2, bundeswehr: 3 },
  impact:  { fsj: 3, studium: 1 },
  create:  { freelancing: 3, studium: 1, 'gap-year': 1 },
  balance: { fsj: 2, 'gap-year': 2, freelancing: 1 },
};

export function scorePaths(riasecCounts, anchor) {
  const pathBoost = anchor ? (ANCHOR_BOOSTS[anchor] || {}) : {};
  return ALL_PATHS.map(path => {
    let score = 0;
    for (const type of path.riasecFit) score += riasecCounts[type] || 0;
    score += pathBoost[path.id] || 0;
    return { path, score };
  }).sort((a, b) => b.score - a.score).map(x => x.path);
}

export function suggestPaths(riasecCounts, lifestyle) {
  const ranked = scorePaths(riasecCounts, lifestyle?.anchor);
  if (lifestyle?.wantsIncomeNow) {
    const incomeBoost = { high: 2, variable: 1, low: 0 };
    ranked.sort((a, b) => (incomeBoost[b.incomeFit] || 0) - (incomeBoost[a.incomeFit] || 0));
  }
  if (lifestyle?.studyOpen === false)
    ranked.sort((a, b) => (a.id === 'studium' ? 1 : 0) - (b.id === 'studium' ? 1 : 0));
  if (lifestyle?.explorer) {
    const gapIdx = ranked.findIndex(p => p.id === 'gap-year');
    if (gapIdx > 2) { const [gap] = ranked.splice(gapIdx, 1); ranked.splice(2, 0, gap); }
  }
  return ranked.slice(0, 3);
}

// Returns up to `count` wildcard paths (ranked paths not in the top 3)
export function getWildcards(riasecCounts, suggestedPaths, anchor, count = 1) {
  const ranked = scorePaths(riasecCounts, anchor);
  const suggestedIds = new Set(suggestedPaths.map(p => p.id));
  const wildcards = [];
  for (const p of ranked) {
    if (!suggestedIds.has(p.id)) {
      wildcards.push(p);
      if (wildcards.length >= count) break;
    }
  }
  return wildcards;
}

const ANCHOR_PHRASES = {
  tech:    'being really good at something specific',
  auto:    'working on your own terms',
  secure:  'having a stable, reliable path',
  impact:  'making a genuine difference',
  create:  'building something of your own',
  balance: 'a life where work fits around the rest',
};

// buildReasons now names both the RIASEC trait and the Schein anchor
// Structure: "[RIASEC label] + [anchor]  → [path]"
export function buildReasons(paths, riasecCounts, lifestyle) {
  const anchor = lifestyle?.anchor || null;
  const anchorPhrase = anchor ? ANCHOR_PHRASES[anchor] : null;

  const meaningfulCounts = Object.fromEntries(
    Object.entries(riasecCounts).filter(([k]) => k !== 'unsure')
  );
  const topType = Object.entries(meaningfulCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const modeLabels = {
    R: 'hands-on and practical work',
    I: 'deep thinking and problem solving',
    A: 'creative expression',
    S: 'helping and connecting with people',
    E: 'leading and making things happen',
    C: 'structure and doing things properly',
  };
  const topLabel = modeLabels[topType] || 'your answers';

  function reason(id) {
    const a = anchorPhrase;
    const r = {
      ausbildung: a
        ? `You scored high on ${topLabel} and care about ${a} — Ausbildung delivers both from day one.`
        : `Your answers point strongly to ${topLabel} — Ausbildung lets you earn while you build real skills from day one.`,
      studium: a
        ? `You scored high on ${topLabel} and value ${a} — studying gives you the depth and flexibility to go far.`
        : `You scored high on ${topLabel} — studying gives you the depth and time to go far in a field you care about.`,
      fsj: a
        ? `You gravitate towards people and helping, and ${a} matters to you — a voluntary year gives you real experience without a long commitment.`
        : `You gravitate towards people and helping — a voluntary year gives you real experience before committing to a longer path.`,
      freelancing: a
        ? `Your creative and independent streak came through clearly, and ${a} is central to you — freelancing is built around exactly that.`
        : `Your creative and independent streak came through clearly — freelancing lets you build on your own terms.`,
      bundeswehr: a
        ? `Your profile shows challenge-seeking and ${a} — the Bundeswehr is one of the few paths that delivers both from day one.`
        : `Your profile shows a preference for structure, challenge and earning from day one — Bundeswehr fits that well.`,
      'gap-year': a
        ? `Your answers suggest exploration over immediate commitment, and ${a} fits that — a gap year gives you time and experience before deciding.`
        : `Your answers suggest you value exploration over immediate commitment — a gap year gives you time and experience before deciding.`,
    };
    return r[id] || `Based on your ${topLabel} profile${a ? ` and ${a}` : ''}.`;
  }

  const out = {};
  for (const path of paths) out[path.id] = reason(path.id);
  return out;
}

export function filterByQuals(paths, quals) {
  const userCertRank = CERT_RANK[quals.cert] ?? 0;
  const out = {};
  for (const path of paths) {
    const open = userCertRank >= (CERT_RANK[path.minCert] ?? 0);
    let note = null;
    if (!open) note = `Typically requires ${path.minCert} — exceptions exist with strong work experience.`;
    else if (path.id === 'freelancing' && !quals.hasPortfolio)
      note = 'Open — building a client base takes time without a portfolio yet.';
    else if (path.id === 'studium' && quals.cert === 'Realschulabschluss')
      note = 'Open — you\'d need Fachhochschulreife or Abitur first, or via second-chance routes.';
    out[path.id] = { open, note };
  }
  return out;
}
