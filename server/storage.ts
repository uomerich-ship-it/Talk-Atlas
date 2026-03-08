import { db } from "./db";
import {
  settings,
  translations,
  type Setting,
  type InsertSetting,
  type Translation,
  type InsertTranslation,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Settings
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  createOrUpdateSetting(setting: InsertSetting): Promise<Setting>;

  // Translations
  getTranslations(): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting;
  }

  async createOrUpdateSetting(insertSetting: InsertSetting): Promise<Setting> {
    const [existing] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, insertSetting.key));

    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: insertSetting.value })
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(settings)
      .values(insertSetting)
      .returning();
    return created;
  }

  async getTranslations(): Promise<Translation[]> {
    return await db
      .select()
      .from(translations)
      .orderBy(desc(translations.createdAt));
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const [created] = await db
      .insert(translations)
      .values(insertTranslation)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
