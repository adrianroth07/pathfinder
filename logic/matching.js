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

// Blocks screen → direct path boosts based on what's holding the user back
const BLOCK_BOOSTS = {
  money:          { ausbildung: 2, bundeswehr: 2 },
  family:         { ausbildung: 1, studium: 1, bundeswehr: 1 },
  'wrong-choice': { fsj: 2, 'gap-year': 2 },
  behind:         { ausbildung: 2, bundeswehr: 1 },
};

// Narrative keyword signals — each matched theme adds boosts to relevant paths.
// Words checked against combined savickas + success-picture text (lowercased).
const NARRATIVE_SIGNALS = [
  {
    words: ['help', 'volunteer', 'care', 'social', 'people', 'community', 'teach', 'support',
            'helfen', 'freiwillig', 'sozial', 'menschen', 'pflege', 'ehrenamt'],
    boosts: { fsj: 2, studium: 1 },
  },
  {
    words: ['creative', 'design', 'art', 'music', 'video', 'write', 'express', 'film',
            'kreativ', 'kunst', 'gestalten', 'schreiben', 'eigenes projekt'],
    boosts: { freelancing: 2 },
  },
  {
    words: ['travel', 'explore', 'world', 'abroad', 'adventure', 'discover', 'experience',
            'reisen', 'welt', 'erfahrung', 'erkunden', 'ausland', 'abenteuer'],
    boosts: { 'gap-year': 2 },
  },
  {
    words: ['freedom', 'independent', 'own terms', 'flexible', 'my own', 'startup', 'self',
            'freiheit', 'unabhängig', 'selbst', 'eigener chef', 'selbstständig'],
    boosts: { freelancing: 1, 'gap-year': 1 },
  },
  {
    words: ['build', 'fix', 'hands', 'workshop', 'tool', 'repair', 'craft', 'make',
            'bauen', 'reparier', 'werkzeug', 'handwerk', 'herstellen'],
    boosts: { ausbildung: 1 },
  },
  {
    words: ['research', 'study', 'university', 'deep', 'science', 'knowledge', 'academic',
            'studier', 'universität', 'forschen', 'wissen', 'wissenschaft', 'tief'],
    boosts: { studium: 2 },
  },
  {
    words: ['structure', 'discipline', 'order', 'stable', 'secure', 'organized', 'reliable', 'team',
            'disziplin', 'ordnung', 'sicher', 'stabil', 'verlässlich', 'geregelt'],
    boosts: { bundeswehr: 2, ausbildung: 1 },
  },
  {
    words: ['lead', 'business', 'entrepreneur', 'manage', 'run', 'company', 'own business',
            'leiten', 'unternehmen', 'gründen', 'chef', 'eigenes unternehmen'],
    boosts: { freelancing: 1, studium: 1 },
  },
];

function scoreNarrative(text) {
  const lower = text.toLowerCase();
  const boosts = {};
  for (const signal of NARRATIVE_SIGNALS) {
    if (signal.words.some(w => lower.includes(w))) {
      for (const [pathId, boost] of Object.entries(signal.boosts)) {
        boosts[pathId] = (boosts[pathId] || 0) + boost;
      }
    }
  }
  return boosts;
}

// Combines block and narrative boosts into a single extra-score map { pathId: number }.
// Call once per session and pass the result into scorePaths / getWildcards.
export function computeExtraBoosts(blocks = [], savickasAnswers = {}, successPicture = '') {
  const extra = {};

  for (const blockId of blocks) {
    for (const [pathId, boost] of Object.entries(BLOCK_BOOSTS[blockId] || {})) {
      extra[pathId] = (extra[pathId] || 0) + boost;
    }
  }

  const narrativeText = [
    savickasAnswers?.roleModel || '',
    savickasAnswers?.story     || '',
    savickasAnswers?.motto     || '',
    successPicture             || '',
  ].join(' ').trim();

  if (narrativeText) {
    for (const [pathId, boost] of Object.entries(scoreNarrative(narrativeText))) {
      extra[pathId] = (extra[pathId] || 0) + boost;
    }
  }

  return extra;
}

export function scorePaths(riasecCounts, anchor, extraBoosts = {}) {
  const pathBoost = anchor ? (ANCHOR_BOOSTS[anchor] || {}) : {};
  return ALL_PATHS.map(path => {
    let score = 0;
    for (const type of path.riasecFit) score += riasecCounts[type] || 0;
    score += pathBoost[path.id] || 0;
    score += extraBoosts[path.id] || 0;
    return { path, score };
  }).sort((a, b) => b.score - a.score).map(x => x.path);
}

export function suggestPaths(riasecCounts, lifestyle, extraBoosts = {}) {
  const ranked = scorePaths(riasecCounts, lifestyle?.anchor, extraBoosts);
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
export function getWildcards(riasecCounts, suggestedPaths, anchor, count = 1, extraBoosts = {}) {
  const ranked = scorePaths(riasecCounts, anchor, extraBoosts);
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

// Grade tips per path — called only when a grade flag is raised.
// grade is German 1–6 scale (1 = best).
function getGradeTips(pathId, grade) {
  if (pathId === 'studium') {
    const tips = [
      'FH (Fachhochschule) and Duales Studium often have lower or no NC — both give you a recognised degree.',
    ];
    if (grade >= 3.0) {
      tips.push(
        'The TMS (Test für Medizinische Studiengänge) can offset a weak Abitur grade at many medical schools — it\'s worth sitting if medicine is your goal.',
        'Austria admits German students via the EMS entrance test, bypassing the German NC entirely — a real option for medicine.',
        'A year doing an FSJ in a hospital (or a Praktikum in a clinical setting) significantly strengthens any medicine or health-science application.',
        'Wartesemester (waiting semesters) accumulate while you work or study something related — many students get into medicine this way after 3–6 years.',
        'Private medical schools (Witten/Herdecke, Brandenburg, etc.) use interviews and tests instead of NC — different criteria, genuinely worth exploring.',
      );
    } else {
      tips.push(
        'Highly competitive programmes like Medicine (NC typically 1.0–1.5) or Psychology will be harder to access directly.',
        'A gap year or FSJ in a relevant field adds experience that some universities consider alongside your grade.',
      );
    }
    return tips;
  }

  if (pathId === 'bundeswehr') {
    return [
      'The officer track (Offizierlaufbahn) requires strong grades — enlisted and NCO tracks have much lower requirements.',
      'Specialist roles in IT, medical, or logistics each have their own criteria — ask at your nearest Karrierecenter der Bundeswehr.',
      'Freiwilliger Wehrdienst (7–23 months) is open without strong grades and is a good way to find out if the Bundeswehr suits you before committing.',
    ];
  }

  if (pathId === 'ausbildung') {
    return [
      'Most companies care far more about attitude and practical skills than grades — apply broadly.',
      'Grade-sensitive fields (banking, pharmaceutical, large corporates) are tougher; trades, logistics, and tech apprenticeships usually are not.',
      'A short Praktikum or volunteer stint in your target field makes an application stand out more than any grade improvement.',
      'The Bundesagentur für Arbeit offers free Bewerbungscoaching — worth using if rejections come in.',
    ];
  }

  return [];
}

// Cert-based progression routes shown when a path is blocked by qualification level.
function getCertTips(pathId, cert) {
  if (pathId === 'studium') {
    if (cert === 'Hauptschulabschluss') {
      return [
        'Hauptschule → Realschulabschluss → Fachoberschule (FOS) → Fachabitur → Fachhochschule (FH) — the most common stepping-stone route.',
        'Hauptschule → Ausbildung → work experience → higher vocational qualification → university access in most federal states.',
        'Completing a Meister or technical academy qualification (Techniker/Fachwirt) also opens university access without Abitur.',
        'Some universities offer aptitude tests or trial semesters for applicants without formal entry qualifications — worth checking per federal state.',
      ];
    }
    if (cert === 'Realschulabschluss') {
      return [
        'Realschule → Fachoberschule (FOS) → Fachabitur → Fachhochschule (FH) — the most direct route, typically 1–2 extra years.',
        'Realschule → Gymnasium upper level (Klasse 11–13) → Abitur → full university access.',
        'Realschule → Ausbildung → work experience → higher vocational qualification → possible university access without Abitur.',
        'Duales Studium is reachable later via a completed Ausbildung plus professional experience — companies apply, not universities.',
      ];
    }
  }
  return [];
}

export function filterByQuals(paths, quals) {
  const userCertRank = CERT_RANK[quals.cert] ?? 0;
  const grade = quals.overallGrade;
  const out = {};

  for (const path of paths) {
    const open = userCertRank >= (CERT_RANK[path.minCert] ?? 0);
    let note = null;
    let gradeFlag = false;
    let gradeTips = [];
    let certTips = [];

    if (!open) {
      note = `Requires ${path.minCert} — you're not blocked permanently, there are clear routes.`;
      certTips = getCertTips(path.id, quals.cert);
    } else if (path.id === 'freelancing' && !quals.hasPortfolio) {
      note = 'Open — building a client base takes time without a portfolio yet.';
    } else if (path.id === 'studium' && quals.cert === 'Realschulabschluss') {
      note = 'Not yet — you\'d need Fachabitur or Abitur first, but there are direct routes to get there.';
      certTips = getCertTips(path.id, quals.cert);
    }

    if (grade !== null && grade !== undefined) {
      if (path.id === 'studium' && grade >= 2.5) gradeFlag = true;
      if (path.id === 'bundeswehr' && grade >= 3.0) gradeFlag = true;
      if (path.id === 'ausbildung' && grade >= 3.5) gradeFlag = true;
      if (gradeFlag) gradeTips = getGradeTips(path.id, grade);
    }

    out[path.id] = { open, note, gradeFlag, gradeTips, certTips };
  }
  return out;
}
