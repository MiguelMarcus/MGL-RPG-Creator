import type { CreationEntry } from "../types/entry";

type ApiFailure = { message?: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options);
  if (!response.ok) {
    const failure = await response.json().catch(() => ({})) as ApiFailure;
    throw new Error(failure.message || "Não foi possível sincronizar a criação.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function fetchRemoteEntries() {
  return request<CreationEntry[]>("/api/entries");
}

export async function saveRemoteEntry(entry: CreationEntry) {
  try {
    return await request<CreationEntry>(`/api/entries/${encodeURIComponent(entry.id)}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry),
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("não encontrada")) throw error;
    return request<CreationEntry>("/api/entries", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry),
    });
  }
}

export async function deleteRemoteEntry(id: string) {
  try {
    await request<void>(`/api/entries/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("não encontrada")) throw error;
  }
}
