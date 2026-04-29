// Firestore adapter has been removed — the app now uses Postgres-backed APIs
// on the Node backend (`/api/*`). This stub keeps the imports compiling.
export class AdapterError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function tryFirestoreFetch(_path: string, _opts: RequestInit = {}): Promise<any | null> {
  return null;
}

export function installFetchInterceptor() {
  if (typeof window === "undefined") return;
  if ((window as any).__realFetch__) return;
  (window as any).__realFetch__ = window.fetch.bind(window);
}

// Legacy migration helper — Firestore is gone, so this is a no-op stub.
export async function importBatchToCollection(
  _collection: string,
  _items: any[],
): Promise<{ ok: boolean; count: number }> {
  return { ok: false, count: 0 };
}
