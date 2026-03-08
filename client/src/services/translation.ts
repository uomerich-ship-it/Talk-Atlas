export interface TranslationResult {
  translated: string;
  detectedSourceLang?: string;
  service: 'deepl' | 'openai' | 'fallback';
}

const DEEPL_KEY   = import.meta.env.VITE_DEEPL_API_KEY as string;
const OPENAI_KEY  = import.meta.env.VITE_OPENAI_API_KEY as string;

const DEEPL_LANG_MAP: Record<string, string> = {
  en: 'EN-GB', pt: 'PT-PT', zh: 'ZH', nb: 'NB', uk: 'UK',
};
function toDeepLCode(code: string): string {
  return DEEPL_LANG_MAP[code.toLowerCase()] ?? code.toUpperCase();
}

async function translateWithDeepL(
  text: string, sourceLang: string | null, targetLang: string
): Promise<TranslationResult> {
  if (!DEEPL_KEY) throw new Error('No DeepL key');
  const body = new URLSearchParams({ text, target_lang: toDeepLCode(targetLang) });
  if (sourceLang && sourceLang !== 'auto') body.set('source_lang', toDeepLCode(sourceLang));
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}`);
  const data = await res.json();
  const t = data.translations?.[0];
  return {
    translated: t?.text ?? '',
    detectedSourceLang: t?.detected_source_language?.toLowerCase(),
    service: 'deepl',
  };
}

async function translateWithOpenAI(
  text: string, sourceLang: string | null, targetLang: string
): Promise<TranslationResult> {
  if (!OPENAI_KEY) throw new Error('No OpenAI key');
  const langNames: Record<string, string> = {
    en:'English', es:'Spanish', fr:'French', de:'German', it:'Italian',
    pt:'Portuguese', ru:'Russian', ja:'Japanese', ko:'Korean', zh:'Chinese',
    ar:'Arabic', hi:'Hindi', tr:'Turkish', pl:'Polish', nl:'Dutch',
    sv:'Swedish', da:'Danish', fi:'Finnish', no:'Norwegian', uk:'Ukrainian',
  };
  const targetName = langNames[targetLang] ?? targetLang.toUpperCase();
  const sourceName = sourceLang && sourceLang !== 'auto' ? (langNames[sourceLang] ?? sourceLang) : 'auto-detected language';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the user's text from ${sourceName} to ${targetName}. Reply with ONLY the translated text, nothing else.`,
        },
        { role: 'user', content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return {
    translated: data.choices?.[0]?.message?.content?.trim() ?? '',
    service: 'openai',
  };
}

async function translateWithServer(
  text: string, sourceLang: string | null, targetLang: string
): Promise<TranslationResult> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text, sourceLang: sourceLang || 'auto', targetLang }),
  });
  if (!res.ok) throw new Error(`Server translation error: ${res.status}`);
  const data = await res.json();
  return { translated: data.translated, detectedSourceLang: data.sourceLang, service: 'openai' };
}

async function translateWithFallback(
  text: string, sourceLang: string | null, targetLang: string
): Promise<TranslationResult> {
  const pair = `${sourceLang && sourceLang !== 'auto' ? sourceLang : 'en'}|${targetLang}`;
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`
  );
  const data = await res.json();
  return { translated: data.responseData?.translatedText ?? text, service: 'fallback' };
}

export async function translateText(
  text: string, sourceLang: string | null, targetLang: string
): Promise<TranslationResult> {
  try { return await translateWithDeepL(text, sourceLang, targetLang); } catch {}
  try { return await translateWithOpenAI(text, sourceLang, targetLang); } catch {}
  try { return await translateWithServer(text, sourceLang, targetLang); } catch {}
  return translateWithFallback(text, sourceLang, targetLang);
}
