import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Using Replit AI Integrations for OpenAI access
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Translation API
  app.post(api.translation.translate.path, async (req, res) => {
    try {
      const input = api.translation.translate.input.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5", // Latest gpt-5 model
        messages: [
          {
            role: "system",
            content: `You are a helpful translation assistant. Translate the user's text to ${input.targetLang}. Only provide the translated text. Do not include any explanations or extra words.`,
          },
          {
            role: "user",
            content: input.text,
          },
        ],
        max_completion_tokens: 1024,
      });

      const translatedText = response.choices[0].message.content || "";
      
      await storage.createTranslation({
        sourceText: input.text,
        targetLanguage: input.targetLang,
        translatedText: translatedText,
      });

      res.json({
        original: input.text,
        translated: translatedText,
        sourceLang: input.sourceLang || "auto",
        targetLang: input.targetLang,
      });
    } catch (err) {
      console.error("Translation error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.translation.history.path, async (req, res) => {
    const history = await storage.getTranslations();
    res.json(history);
  });

  // Settings API
  app.get(api.settings.list.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const updated = await storage.createOrUpdateSetting(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.settings.get.path, async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  });

  // DeepL proxy route (keeps API key server-side)
  app.post('/api/deepl-translate', async (req, res) => {
    try {
      const { text, sourceLang, targetLang } = req.body;
      const apiKey = process.env.DEEPL_API_KEY;
      if (!apiKey) {
        return res.status(501).json({ message: 'DeepL not configured' });
      }

      const deeplLangMap: Record<string, string> = {
        en: 'EN-GB', pt: 'PT-PT', zh: 'ZH', nb: 'NB', uk: 'UK',
      };
      const mapLang = (code: string) => deeplLangMap[code] || code.toUpperCase();

      const params = new URLSearchParams({
        text,
        target_lang: mapLang(targetLang),
        auth_key: apiKey,
      });
      if (sourceLang && sourceLang !== 'auto') {
        params.set('source_lang', mapLang(sourceLang));
      }

      const deeplRes = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!deeplRes.ok) {
        return res.status(deeplRes.status).json({ message: `DeepL error: ${deeplRes.status}` });
      }

      const data = await deeplRes.json();
      res.json({
        translated: data.translations?.[0]?.text || '',
        detectedSourceLang: data.translations?.[0]?.detected_source_language?.toLowerCase(),
        service: 'deepl',
      });
    } catch (err) {
      console.error('DeepL proxy error:', err);
      res.status(500).json({ message: 'DeepL translation failed' });
    }
  });

  // Google Places text search proxy
  const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY || process.env.VITE_GOOGLE_PLACES_KEY || '';

  app.get('/api/places/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: 'query required' });
      if (!GOOGLE_KEY) return res.status(501).json({ error: 'Google API key not configured' });

      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query as string)}&key=${GOOGLE_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Google Directions proxy
  app.get('/api/directions', async (req, res) => {
    try {
      const { origin, destination, mode } = req.query;
      if (!origin || !destination) return res.status(400).json({ error: 'origin and destination required' });
      if (!GOOGLE_KEY) return res.status(501).json({ error: 'Google API key not configured' });

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin as string)}&destination=${encodeURIComponent(destination as string)}&mode=${mode || 'driving'}&key=${GOOGLE_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Stripe checkout session (requires STRIPE_SECRET_KEY env var)
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(501).json({ message: 'Stripe is not configured on the server. Set STRIPE_SECRET_KEY.' });
      }

      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(stripeKey);
      const { priceId, email, successUrl, cancelUrl } = req.body;

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email || undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ sessionId: session.id });
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      res.status(500).json({ message: err.message || 'Checkout session creation failed' });
    }
  });

  return httpServer;
}

// Seed function (can be called from server/index.ts or run manually)
export async function seedDatabase() {
  const existingSettings = await storage.getSettings();
  if (existingSettings.length === 0) {
    await storage.createOrUpdateSetting({ key: "openai_api_key", value: "" });
    await storage.createOrUpdateSetting({ key: "global_rules", value: "Be polite and concise." });
  }
}
