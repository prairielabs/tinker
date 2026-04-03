// lib/engineAutoCache.ts

const warmed = new Set<string>();

export async function ensureEngineCachedOnce(
  key: string,
  fn: () => Promise<void> | void
) {
  if (warmed.has(key)) return;
  await fn();
  warmed.add(key);
}
