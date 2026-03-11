/**
 * Gemini API client — calls the REST endpoint directly from the browser.
 * Uses the generativelanguage.googleapis.com/v1beta endpoint.
 */

const STORAGE_KEY_API = 'gemini_api_key';
const STORAGE_KEY_MODEL = 'gemini_model';

const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const getStoredApiKey = () => localStorage.getItem(STORAGE_KEY_API) ?? '';
export const getStoredModel = () => localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;

export const setStoredApiKey = (key) => localStorage.setItem(STORAGE_KEY_API, key);
export const setStoredModel = (model) => localStorage.setItem(STORAGE_KEY_MODEL, model);

/**
 * Build conversation history for the Gemini API from our messages array.
 * Each message has { sender: 'user' | 'ai', text }.
 */
const buildContents = (messages) =>
  messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

/**
 * Send a chat request to Gemini and return the text response.
 * Throws on network / API errors.
 */
export async function sendGeminiMessage(history, userText, options = {}) {
  const apiKey = options.apiKey || getStoredApiKey();
  const model = options.model || getStoredModel();

  if (!apiKey) {
    throw new Error('API key not configured. Click the ⚙️ button to set your Gemini API key.');
  }

  const contents = [
    ...buildContents(history),
    { role: 'user', parts: [{ text: userText }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let detail = '';
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed.error?.message || errorBody;
    } catch {
      detail = errorBody;
    }
    throw new Error(`Gemini API error (${response.status}): ${detail}`);
  }

  const data = await response.json();

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('No response from Gemini model.');
  }

  const textParts = candidate.content?.parts?.filter((p) => p.text) ?? [];
  return textParts.map((p) => p.text).join('\n') || '(empty response)';
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash-Lite' },
  { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];
