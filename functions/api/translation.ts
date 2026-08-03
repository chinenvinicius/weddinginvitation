export const translationLanguages = {
  en: 'English',
  ja: 'Japanese',
  ceb: 'Bisaya (Cebuano)',
  tl: 'Tagalog',
  pt: 'Portuguese',
} as const;

export type TranslationProvider = 'openrouter' | 'kilogateway' | 'opencode-zen' | 'nvidia' | 'gemini' | 'ollama' | 'openai' | 'groq' | 'together' | 'cerebras' | 'deepinfra' | 'openai-compatible';
export type TranslationMap = Partial<Record<keyof typeof translationLanguages, string>>;

export interface TranslationResult {
  sourceLanguage: string;
  translations: TranslationMap;
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
};

const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

const encryptionKey = async (adminToken: string) => crypto.subtle.importKey(
  'raw',
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode(adminToken)),
  'AES-GCM',
  false,
  ['encrypt', 'decrypt'],
);

export async function encryptApiKeys(keys: string[], adminToken: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await encryptionKey(adminToken),
    new TextEncoder().encode(JSON.stringify(keys)),
  );
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

export async function decryptApiKeys(value: string, adminToken: string): Promise<string[]> {
  if (!value) return [];
  const [iv, encrypted] = value.split('.');
  if (!iv || !encrypted) throw new Error('The saved API keys cannot be read. Save them again.');
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(iv) },
    await encryptionKey(adminToken),
    base64ToBytes(encrypted),
  );
  const keys = JSON.parse(new TextDecoder().decode(decrypted));
  return Array.isArray(keys) ? keys.filter((key): key is string => typeof key === 'string' && Boolean(key)) : [];
}

const stripJsonFence = (value: string) => value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

const parseTranslation = (content: string, original: string): TranslationResult => {
  const parsed = JSON.parse(stripJsonFence(content)) as TranslationResult;
  if (!parsed || typeof parsed.sourceLanguage !== 'string' || !parsed.translations) throw new Error('The model returned an invalid translation.');
  for (const code of Object.keys(translationLanguages) as Array<keyof typeof translationLanguages>) {
    if (typeof parsed.translations[code] !== 'string' || !parsed.translations[code]?.trim()) throw new Error(`The model omitted ${translationLanguages[code]}.`);
  }
  if (parsed.sourceLanguage in translationLanguages) parsed.translations[parsed.sourceLanguage as keyof typeof translationLanguages] = original;
  return parsed;
};

const promptFor = (message: string) => `Detect the language of this wedding message and translate it faithfully into English, Japanese, Bisaya/Cebuano, Tagalog, and Portuguese. Preserve names, tone, emoji, line breaks, and meaning. Do not add commentary. Return only valid JSON exactly shaped as {"sourceLanguage":"en|ja|ceb|tl|pt|other","translations":{"en":"...","ja":"...","ceb":"...","tl":"...","pt":"..."}}. If the source is one of those five languages, copy the original text exactly into that language field.\n\nMESSAGE:\n${message}`;

async function providerRequest(provider: TranslationProvider, model: string, baseUrl: string, apiKey: string, message: string) {
  const prompt = promptFor(message);
  if (provider === 'gemini') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } }),
    });
    const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!response.ok) throw new Error(result.error?.message ?? `Gemini returned ${response.status}.`);
    return result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  if (provider === 'ollama') {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], format: 'json', stream: false, options: { temperature: 0.1 } }),
    });
    const result = await response.json() as { message?: { content?: string }; error?: string };
    if (!response.ok) throw new Error(result.error ?? `Ollama returned ${response.status}.`);
    return result.message?.content ?? '';
  }

  const openAiBases: Partial<Record<TranslationProvider, string>> = {
    openrouter: 'https://openrouter.ai/api/v1',
    kilogateway: 'https://api.kilo.ai/api/gateway',
    'opencode-zen': 'https://opencode.ai/zen/v1',
    nvidia: 'https://integrate.api.nvidia.com/v1',
    openai: 'https://api.openai.com/v1',
    groq: 'https://api.groq.com/openai/v1',
    together: 'https://api.together.xyz/v1',
    cerebras: 'https://api.cerebras.ai/v1',
    deepinfra: 'https://api.deepinfra.com/v1/openai',
  };
  const endpoint = `${(openAiBases[provider] ?? baseUrl).replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 1800 }),
  });
  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message ?? `${provider} returned ${response.status}.`);
  return result.choices?.[0]?.message?.content ?? '';
}

export async function translateWithRotation(options: {
  provider: TranslationProvider;
  model: string;
  baseUrl: string;
  apiKeys: string[];
  startAt: number;
  message: string;
}) {
  let lastError: unknown;
  for (let offset = 0; offset < options.apiKeys.length; offset += 1) {
    const keyIndex = (options.startAt + offset) % options.apiKeys.length;
    try {
      const content = await providerRequest(options.provider, options.model, options.baseUrl, options.apiKeys[keyIndex], options.message);
      return { ...parseTranslation(content, options.message), nextKey: (keyIndex + 1) % options.apiKeys.length };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Every translation API key failed.');
}

export async function listProviderModels(provider: TranslationProvider, baseUrl: string, apiKey: string) {
  let url = '';
  const headers: Record<string, string> = {};
  if (provider === 'openrouter') url = 'https://openrouter.ai/api/v1/models';
  if (provider === 'kilogateway') url = 'https://api.kilo.ai/api/gateway/models';
  if (provider === 'opencode-zen') url = 'https://opencode.ai/zen/v1/models';
  if (provider === 'nvidia') url = 'https://integrate.api.nvidia.com/v1/models';
  if (provider === 'gemini') url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=1000`;
  if (provider === 'ollama') url = `${baseUrl.replace(/\/$/, '')}/api/tags`;
  if (['openai', 'groq', 'together', 'cerebras', 'deepinfra', 'openai-compatible'].includes(provider)) {
    const openAiBases: Partial<Record<TranslationProvider, string>> = {
      openai: 'https://api.openai.com/v1', groq: 'https://api.groq.com/openai/v1', together: 'https://api.together.xyz/v1',
      cerebras: 'https://api.cerebras.ai/v1', deepinfra: 'https://api.deepinfra.com/v1/openai',
    };
    url = `${(openAiBases[provider] ?? baseUrl).replace(/\/$/, '')}/models`;
  }
  if (provider !== 'gemini') headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(url, { headers });
  const result = await response.json() as {
    data?: Array<{ id?: string; name?: string }>;
    models?: Array<{ name?: string }>;
    error?: { message?: string } | string;
  };
  if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : result.error?.message ?? `Model list returned ${response.status}.`);
  const models = provider === 'gemini'
    ? (result.models ?? []).map(({ name }) => name?.replace(/^models\//, '') ?? '')
    : provider === 'ollama'
      ? (result.models ?? []).map(({ name }) => name ?? '')
      : (result.data ?? []).map(({ id }) => id ?? '');
  return [...new Set(models.filter(Boolean))].sort();
}
