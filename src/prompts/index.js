export { default as AGENT_1_PROMPT } from './agent1-exegesis.js';
export { default as AGENT_2_PROMPT } from './agent2-translator.js';
export { default as AGENT_3_PROMPT } from './agent3-style-reviewer.js';
export { default as AGENT_4_PROMPT } from './agent4-theological-checker.js';
export { default as AGENT_5_PROMPT } from './agent5-audio-reader.js';

export const AGENT_INFO = [
  {
    id: 1,
    name: 'Exegesis Analyst',
    shortName: 'Exegesis',
    description: 'Analyzes source text for oral translation',
    inputLabel: 'Source passage reference',
    outputLabel: 'Exegesis Report'
  },
  {
    id: 2,
    name: 'Oral Translator',
    shortName: 'Translate',
    description: 'Produces natural spoken Hindi translation',
    inputLabel: 'Exegesis report',
    outputLabel: 'Oral Hindi Script + Notes'
  },
  {
    id: 3,
    name: 'Oral Style Reviewer',
    shortName: 'Style Review',
    description: 'Checks oral naturalness and boundary compliance',
    inputLabel: 'Translation + notes',
    outputLabel: 'Style Review Report'
  },
  {
    id: 4,
    name: 'Theological Checker',
    shortName: 'Theology',
    description: 'Verifies meaning preservation',
    inputLabel: 'All previous outputs',
    outputLabel: 'Accuracy Assessment'
  },
  {
    id: 5,
    name: 'Audio Reader',
    shortName: 'TTS Prep',
    description: 'Formats for ElevenLabs TTS',
    inputLabel: 'Approved script',
    outputLabel: 'TTS-Ready Files'
  }
];
