export interface TranslationResult {
  translated: string;
  detectedSourceLang?: string;
  service: 'deepl' | 'openai' | 'fallback';
}

async function translateWithDeepL(
  text: string,
  sourceLang: string | null,
  targetLang: string
): Promise<TranslationResult> {
  const res = await fetch('/api/deepl-translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      text,
      sourceLang: sourceLang || 'auto',
      targetLang,
    }),
  });

  if (res.status === 501) throw new Error('DeepL not configured');
  if (!res.ok) throw new Error(`DeepL error: ${res.status}`);

  return await res.json();
}

async function translateWithOpenAI(
  text: string,
  sourceLang: string | null,
  targetLang: string
): Promise<TranslationResult> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      text,
      sourceLang: sourceLang || 'auto',
      targetLang,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI translation error: ${res.status}`);

  const data = await res.json();
  return {
    translated: data.translated,
    detectedSourceLang: data.sourceLang,
    service: 'openai',
  };
}

async function translateWithFallback(
  text: string,
  sourceLang: string | null,
  targetLang: string
): Promise<TranslationResult> {
  const langPair = `${sourceLang && sourceLang !== 'auto' ? sourceLang : 'en'}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory error: ${res.status}`);

  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Translation failed');

  return {
    translated: data.responseData.translatedText,
    service: 'fallback',
  };
}

export async function translateText(
  text: string,
  sourceLang: string | null,
  targetLang: string
): Promise<TranslationResult> {
  try {
    return await translateWithDeepL(text, sourceLang, targetLang);
  } catch (e) {
    console.warn('DeepL unavailable, trying OpenAI:', e);
  }

  try {
    return await translateWithOpenAI(text, sourceLang, targetLang);
  } catch (e) {
    console.warn('OpenAI failed, falling back to MyMemory:', e);
  }

  return await translateWithFallback(text, sourceLang, targetLang);
}
