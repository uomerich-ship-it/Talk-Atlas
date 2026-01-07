import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// ============================================
// TRANSLATION HOOKS
// ============================================

export function useTranslate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.translation.translate.input>) => {
      const validated = api.translation.translate.input.parse(data);
      const res = await fetch(api.translation.translate.path, {
        method: api.translation.translate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.translation.translate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Translation failed');
      }
      return api.translation.translate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.translation.history.path] });
    },
  });
}

export function useTranslationHistory() {
  return useQuery({
    queryKey: [api.translation.history.path],
    queryFn: async () => {
      const res = await fetch(api.translation.history.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch history');
      return api.translation.history.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// SETTINGS HOOKS
// ============================================

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.list.path],
    queryFn: async () => {
      const res = await fetch(api.settings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return api.settings.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.settings.update.input>) => {
      const validated = api.settings.update.input.parse(data);
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.settings.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to update setting');
      }
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.list.path] });
    },
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: [api.settings.get.path, key],
    queryFn: async () => {
      const url = buildUrl(api.settings.get.path, { key });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch setting');
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}
