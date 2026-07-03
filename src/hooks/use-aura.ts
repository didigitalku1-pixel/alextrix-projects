"use client";

import { useQuery } from "@tanstack/react-query";
import type { ManifestItem, ItemType } from "@/lib/aura-library";

export interface QueryResult {
  items: ManifestItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ItemQuery {
  type?: ItemType | "all";
  sort?: "views" | "recent" | "forks" | "az";
  tag?: string;
  q?: string;
  premium?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function useItems(query: ItemQuery) {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  if (query.sort) params.set("sort", query.sort);
  if (query.tag) params.set("tag", query.tag);
  if (query.q) params.set("q", query.q);
  if (query.premium) params.set("premium", "true");
  if (query.featured) params.set("featured", "true");
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  return useQuery<QueryResult>({
    queryKey: ["items", query],
    queryFn: async () => {
      const r = await fetch(`/api/items?${params.toString()}`);
      if (!r.ok) throw new Error("Failed to fetch items");
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useItem(type: ItemType, id: number | null) {
  return useQuery({
    queryKey: ["item", type, id],
    queryFn: async () => {
      if (id === null) return null;
      const r = await fetch(`/api/item/${type}/${id}`);
      if (!r.ok) throw new Error("Failed to fetch item");
      return r.json();
    },
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const r = await fetch(`/api/stats`);
      if (!r.ok) throw new Error("Failed to fetch stats");
      return r.json();
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const r = await fetch(`/api/tags`);
      if (!r.ok) throw new Error("Failed to fetch tags");
      return r.json();
    },
    staleTime: 60 * 60 * 1000,
  });
}
