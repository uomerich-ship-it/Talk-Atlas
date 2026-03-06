const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

async function openAIChat(systemPrompt: string, userPrompt: string, model = 'gpt-4o-mini'): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OpenAI API key not configured');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

export interface Phrase {
  english: string;
  translated: string;
  phonetic: string;
  category: string;
}

export async function getPhrasebook(countryName: string, targetLanguage: string): Promise<Phrase[]> {
  const system = `You are a travel language expert. Always respond with valid JSON only, no markdown.`;
  const prompt = `Give me exactly 10 essential travel phrases for visiting ${countryName} in ${targetLanguage}.
Return a JSON array of objects with these exact fields:
- english: the phrase in English
- translated: the phrase in ${targetLanguage}
- phonetic: pronunciation guide in English letters
- category: one of "Greeting", "Food", "Navigation", "Emergency", "Shopping", "Polite"

Example format: [{"english":"Hello","translated":"Hola","phonetic":"OH-lah","category":"Greeting"}]`;
  const raw = await openAIChat(system, prompt);
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as Phrase[];
}

export interface CulturalTip {
  title: string;
  tip: string;
  icon: string;
}

export async function getCulturalTips(countryName: string): Promise<CulturalTip[]> {
  const system = `You are a cultural travel expert. Always respond with valid JSON only, no markdown.`;
  const prompt = `Give me 6 important cultural tips, customs, and etiquette for visiting ${countryName}.
Return a JSON array with fields:
- title: short title (max 4 words)
- tip: one sentence of advice (max 20 words)
- icon: a single relevant emoji

Example: [{"title":"Remove Your Shoes","tip":"Always remove shoes before entering homes and some restaurants.","icon":"👟"}]`;
  const raw = await openAIChat(system, prompt);
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as CulturalTip[];
}

export async function translateImageText(
  base64Image: string,
  mediaType: string,
  targetLanguage: string
): Promise<{ original: string; translated: string }> {
  if (!OPENAI_KEY) throw new Error('OpenAI API key not configured');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${base64Image}`, detail: 'low' },
          },
          {
            type: 'text',
            text: `Extract ALL text visible in this image. Then translate it to ${targetLanguage}.
Return JSON only: {"original": "extracted text here", "translated": "translation here"}`,
          },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error(`Vision API error: ${res.status}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function transcribeAudio(audioBlob: Blob, language?: string): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OpenAI API key not configured');
  const formData = new FormData();
  formData.append('file', new File([audioBlob], 'audio.webm', { type: audioBlob.type }));
  formData.append('model', 'whisper-1');
  if (language && language !== 'auto') formData.append('language', language);
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Whisper error: ${res.status}`);
  const data = await res.json();
  return data.text ?? '';
}
