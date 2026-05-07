import { ROUND1_QUESTIONS, ROUND2_QUESTIONS, RIASEC_MODES } from './data/questions.js';
import { ALL_PATHS } from './data/paths.js';
import { computeRiasec, countUnsure, extractLifestyle, suggestPaths, buildReasons, filterByQuals, shouldEndRound1, getWildcards, computeExtraBoosts } from './logic/matching.js';

import { renderWelcome } from './screens/welcome.js';
import { renderOpener } from './screens/opener.js';
import { renderBrowse } from './screens/browse.js';
import { renderQuiz, renderRound2Intro } from './screens/quiz.js';
import { renderSavickas } from './screens/savickas.js';
import { renderBlocks } from './screens/blocks.js';
import { renderSuccessPicture } from './screens/success-picture.js';
import { renderPaths } from './screens/paths.js';
import { renderQualifications } from './screens/qualifications.js';
import { renderFieldNarrowing } from './screens/field-narrowing.js';
import { renderComparison } from './screens/comparison.js';
import { renderStories } from './screens/stories.js';
import { renderMap } from './screens/map.js';
import { initChat } from './chat.js';

const SCREENS = {
  WELCOME:         'welcome',
  OPENER:          'opener',
  BROWSE:          'browse',
  QUIZ_R1:         'quiz_r1',
  ROUND2_INTRO:    'round2_intro',
  SAVICKAS:        'savickas',
  QUIZ_R2:         'quiz_r2',
  BLOCKS:          'blocks',
  SUCCESS_PICTURE: 'success_picture',
  PATHS:           'paths',
  QUALIFICATIONS:  'qualifications',
  FIELD_NARROWING: 'field_narrowing',
  COMPARISON:      'comparison',
  STORIES:         'stories',
  MAP:             'map',
};

const FRESH_STATE = () => ({
  screen: SCREENS.WELCOME,
  userMode: null,             // 'lena' | 'malik' | 'clear' — opener + unsure auto-route
  round1Answers: {},
  round2Answers: {},
  round1Index: 0,
  round2Index: 0,
  round1Length: 0,
  unsureCount: 0,             // R1 'unsure' answers; ≥3 auto-routes to lena mode
  savickasAnswers: { roleModel: '', story: '', motto: '' },
  blocks: [],                 // selected block chip IDs
  blocksOther: '',
  successPicture: '',         // "good Tuesday" free text
  riasecCounts: {},
  lifestyle: {},
  suggestedPaths: [],
  wildcardPaths: [],          // Array<Path>, length depends on userMode
  reasons: {},
  quals: {
    cert: null,
    overallGrade: null,
    overallPoints: null,
    langs: ['German'],
    engLevel: null,
    experience: null,
    experienceOther: null,
    extras: [],
    hasPortfolio: false,
  },
  filterResult: {},
  selectedClusters: [],
  qualitativeBoosts: {},
});

let state = FRESH_STATE();
const root = document.getElementById('app');

function navigate(screen) {
  state.screen = screen;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getTopModes() {
  const counts = computeRiasec(state.round1Answers);
  return Object.entries(counts)
    .filter(([type]) => RIASEC_MODES[type])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => [type, RIASEC_MODES[type]]);
}

// Compute all matching results into state, then navigate to the next screen
function computeResults() {
  state.riasecCounts = computeRiasec(state.round1Answers);
  state.unsureCount  = countUnsure(state.round1Answers);

  // Auto-route to lena mode if user was unsure ≥3 times, regardless of opener choice
  if (state.unsureCount >= 3 && state.userMode !== 'lena') state.userMode = 'lena';

  state.lifestyle         = extractLifestyle(state.round2Answers);
  state.qualitativeBoosts = computeExtraBoosts(state.blocks, state.savickasAnswers, state.successPicture);
  state.suggestedPaths    = suggestPaths(state.riasecCounts, state.lifestyle, state.qualitativeBoosts);
  state.reasons           = buildReasons(state.suggestedPaths, state.riasecCounts, state.lifestyle);
  state.filterResult      = filterByQuals(state.suggestedPaths, state.quals);

  // Wildcard count by mode: lena=2 (more divergence), malik/clear=0 (more convergence), unknown=1
  const wildcardCount = state.userMode === 'lena' ? 2 : (state.userMode === null ? 1 : 0);
  state.wildcardPaths  = getWildcards(state.riasecCounts, state.suggestedPaths, state.lifestyle?.anchor, wildcardCount, state.qualitativeBoosts);
}

function render() {
  root.innerHTML = '';
  let screen;

  switch (state.screen) {

    case SCREENS.WELCOME:
      screen = renderWelcome({
        onStart: () => {
          Object.assign(state, { round1Answers: {}, round2Answers: {}, round1Index: 0, round2Index: 0, userMode: null });
          navigate(SCREENS.OPENER);
        },
        onBrowse: () => navigate(SCREENS.BROWSE),
        onMap:    () => navigate(SCREENS.MAP),
      });
      break;

    case SCREENS.OPENER:
      screen = renderOpener({
        onSelect: (mode) => { state.userMode = mode; navigate(SCREENS.QUIZ_R1); },
      });
      break;

    case SCREENS.BROWSE:
      screen = renderBrowse({
        onBack: () => navigate(SCREENS.WELCOME),
        onStartQuiz: () => {
          Object.assign(state, { round1Answers: {}, round2Answers: {}, round1Index: 0, round2Index: 0, userMode: null });
          navigate(SCREENS.OPENER);
        },
      });
      break;

    case SCREENS.QUIZ_R1: {
      const idx = state.round1Index;
      screen = renderQuiz({
        round: 1,
        questionIndex: idx,
        selections: state.round1Answers[idx] || [],
        onAnswer: (i, selected) => { state.round1Answers[i] = selected; },
        onNext: () => {
          const answeredSoFar = Object.values(state.round1Answers);
          const isLast  = idx >= ROUND1_QUESTIONS.length - 1;
          const earlyStop = idx >= 2 && shouldEndRound1(answeredSoFar);
          if (!isLast && !earlyStop) {
            state.round1Index += 1;
            navigate(SCREENS.QUIZ_R1);
          } else {
            state.round1Length = idx + 1;
            navigate(SCREENS.ROUND2_INTRO);
          }
        },
        onBack: () => {
          if (idx > 0) { state.round1Index -= 1; navigate(SCREENS.QUIZ_R1); }
          else navigate(SCREENS.OPENER);
        },
        onBrowse: () => navigate(SCREENS.WELCOME),
      });
      break;
    }

    case SCREENS.ROUND2_INTRO:
      screen = renderRound2Intro({
        dominantTypes: getTopModes(),
        onContinue: () => navigate(SCREENS.SAVICKAS),
      });
      break;

    case SCREENS.SAVICKAS:
      screen = renderSavickas({
        answers: state.savickasAnswers,
        onContinue: (answers) => { state.savickasAnswers = answers; navigate(SCREENS.QUIZ_R2); },
        onBack: () => navigate(SCREENS.ROUND2_INTRO),
      });
      break;

    case SCREENS.QUIZ_R2: {
      const idx = state.round2Index;
      screen = renderQuiz({
        round: 2,
        questionIndex: idx,
        selections: state.round2Answers[idx] || [],
        onAnswer: (i, selected) => { state.round2Answers[i] = selected; },
        onNext: () => {
          if (idx < ROUND2_QUESTIONS.length - 1) {
            state.round2Index += 1;
            navigate(SCREENS.QUIZ_R2);
          } else {
            navigate(SCREENS.BLOCKS);
          }
        },
        onBack: () => {
          if (idx > 0) { state.round2Index -= 1; navigate(SCREENS.QUIZ_R2); }
          else navigate(SCREENS.SAVICKAS);
        },
        onBrowse: () => navigate(SCREENS.WELCOME),
      });
      break;
    }

    case SCREENS.BLOCKS:
      screen = renderBlocks({
        selected:   state.blocks,
        otherText:  state.blocksOther,
        onContinue: (blocks, other) => {
          state.blocks = blocks;
          state.blocksOther = other;
          navigate(SCREENS.SUCCESS_PICTURE);
        },
        onBack: () => {
          state.round2Index = ROUND2_QUESTIONS.length - 1;
          navigate(SCREENS.QUIZ_R2);
        },
      });
      break;

    case SCREENS.SUCCESS_PICTURE:
      screen = renderSuccessPicture({
        text: state.successPicture,
        onContinue: (text) => {
          state.successPicture = text;
          computeResults();
          navigate(SCREENS.PATHS);
        },
        onBack: () => navigate(SCREENS.BLOCKS),
      });
      break;

    case SCREENS.PATHS:
      screen = renderPaths({
        suggestedPaths:  state.suggestedPaths,
        wildcardPaths:   state.wildcardPaths,
        reasons:         state.reasons,
        userMode:        state.userMode,
        unsureCount:     state.unsureCount,
        successPicture:  state.successPicture,
        blocks:          state.blocks,
        blocksOther:     state.blocksOther,
        savickasAnswers: state.savickasAnswers,
        onConfirm: () => navigate(SCREENS.QUALIFICATIONS),
        onSwap: (slotIndex, newPath) => {
          state.suggestedPaths[slotIndex] = newPath;
          const wildcardCount = state.userMode === 'lena' ? 2 : (state.userMode === null ? 1 : 0);
          state.wildcardPaths = getWildcards(state.riasecCounts, state.suggestedPaths, state.lifestyle?.anchor, wildcardCount, state.qualitativeBoosts);
          state.reasons = buildReasons(state.suggestedPaths, state.riasecCounts, state.lifestyle);
          state.filterResult = filterByQuals(state.suggestedPaths, state.quals);
        },
      });
      break;

    case SCREENS.QUALIFICATIONS:
      screen = renderQualifications({
        quals: state.quals,
        paths: state.suggestedPaths,
        filterResult: state.filterResult,
        onChange: (updatedQuals) => {
          state.quals = updatedQuals;
          state.filterResult = filterByQuals(state.suggestedPaths, state.quals);
        },
        onBack: () => navigate(SCREENS.PATHS),
        onNext: () => navigate(SCREENS.FIELD_NARROWING),
      });
      break;

    case SCREENS.FIELD_NARROWING:
      screen = renderFieldNarrowing({
        selectedClusters: state.selectedClusters,
        paths: state.suggestedPaths,
        onToggle: (clusters) => { state.selectedClusters = clusters; },
        onNext: () => navigate(SCREENS.COMPARISON),
        onBack: () => navigate(SCREENS.QUALIFICATIONS),
      });
      break;

    case SCREENS.COMPARISON:
      screen = renderComparison({
        paths: state.suggestedPaths,
        selectedClusters: state.selectedClusters,
        onNext: () => navigate(SCREENS.STORIES),
        onBack: () => navigate(SCREENS.FIELD_NARROWING),
      });
      break;

    case SCREENS.STORIES:
      screen = renderStories({
        paths: state.suggestedPaths,
        selectedClusters: state.selectedClusters,
        onBack: () => navigate(SCREENS.COMPARISON),
        onRestart: () => { state = FRESH_STATE(); navigate(SCREENS.WELCOME); },
      });
      break;

    case SCREENS.MAP:
      screen = renderMap({ onBack: () => navigate(SCREENS.WELCOME) });
      break;
  }

  if (screen) root.appendChild(screen);
}

render();

function getChatContext() {
  const lines = [];
  lines.push(`Screen: ${state.screen}`);
  if (state.userMode) lines.push(`User mode: ${state.userMode}`);
  if (state.unsureCount >= 3) lines.push(`User was unsure on ${state.unsureCount} questions`);
  if (state.lifestyle?.anchor) lines.push(`Career anchor: ${state.lifestyle.anchor}`);
  if (state.suggestedPaths?.length) lines.push(`Suggested paths: ${state.suggestedPaths.map(p => p.name).join(', ')}`);
  if (state.successPicture) lines.push(`Success picture: "${state.successPicture}"`);
  if (state.blocks?.length) lines.push(`Concerns: ${state.blocks.join(', ')}`);
  return lines.join('\n');
}

initChat(getChatContext);
