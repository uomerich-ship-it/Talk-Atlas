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
