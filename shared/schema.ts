import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'openai_api_key', 'global_rules'
  value: text("value").notNull(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedText: text("translated_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true, createdAt: true });

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type TranslateRequest = {
  text: string;
  sourceLang?: string; // Optional, auto-detect if missing
  targetLang: string;
};

export type TranslateResponse = {
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
};
