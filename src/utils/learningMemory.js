const STORAGE_KEY = 'obh_agent_learning_v1';
const MAX_ENTRIES_PER_AGENT = 20;
const MAX_ENTRY_CHARS = 280;
const MAX_SEEN_EDITS = 50;

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getEmptyStore = () => ({
  version: 1,
  agents: {},
  seenEdits: {}
});

const loadStore = () => {
  if (!isBrowser) return getEmptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyStore();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getEmptyStore();
    return {
      version: 1,
      agents: parsed.agents || {},
      seenEdits: parsed.seenEdits || {}
    };
  } catch (err) {
    return getEmptyStore();
  }
};

const saveStore = (store) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const normalizeText = (text) => {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_ENTRY_CHARS);
};

export const hashText = (text) => {
  let hash = 5381;
  const str = String(text || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

export const parseLearningText = (learningText) => {
  if (!learningText) return [];
  return String(learningText)
    .split('\n')
    .map(line => line.replace(/^\s*(?:[-*]|\d+\.)\s*/, ''))
    .map(normalizeText)
    .filter(Boolean);
};

export const getAgentEntries = (agentId) => {
  const store = loadStore();
  const list = store.agents[String(agentId)] || [];
  return Array.isArray(list) ? list : [];
};

export const hasSeenEdit = (agentId, editHash) => {
  if (!editHash) return false;
  const store = loadStore();
  const list = store.seenEdits[String(agentId)] || [];
  return Array.isArray(list) && list.includes(editHash);
};

const markSeenEdit = (store, agentId, editHash) => {
  if (!editHash) return;
  const key = String(agentId);
  const seen = new Set(store.seenEdits[key] || []);
  seen.add(editHash);
  store.seenEdits[key] = Array.from(seen).slice(-MAX_SEEN_EDITS);
};

export const addLearningEntries = (agentId, entries, editHash) => {
  const store = loadStore();
  const key = String(agentId);
  const list = Array.isArray(store.agents[key]) ? store.agents[key] : [];
  const existingTexts = new Set(list.map(entry => entry.text));

  entries.forEach((entryText) => {
    const normalized = normalizeText(entryText);
    if (!normalized || existingTexts.has(normalized)) return;
    list.unshift({
      id: hashText(`${key}:${normalized}`),
      text: normalized,
      createdAt: new Date().toISOString()
    });
    existingTexts.add(normalized);
  });

  store.agents[key] = list.slice(0, MAX_ENTRIES_PER_AGENT);
  markSeenEdit(store, agentId, editHash);
  saveStore(store);
};

export const formatLearningNotes = (agentId, options = {}) => {
  const { maxEntries = 8, maxChars = 1800 } = options;
  const entries = getAgentEntries(agentId).slice(0, maxEntries);
  if (!entries.length) return '';

  const lines = [];
  let usedChars = 0;

  for (const entry of entries) {
    const line = `- ${entry.text}`;
    if (lines.length === 0 && line.length > maxChars) {
      lines.push(`${line.slice(0, Math.max(0, maxChars - 3))}...`);
      break;
    }
    if (usedChars + line.length > maxChars) break;
    lines.push(line);
    usedChars += line.length + 1;
  }

  return lines.join('\n');
};

export const clearLearning = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
};
