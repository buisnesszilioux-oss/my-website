const TOKEN_KEY = "mi_admin_token";
const EMAIL_KEY = "mi_admin_email";

export function getAdminToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getAdminEmail(): string | null {
  try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
}

export function setAdminSession(token: string, email: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  } catch { /* ignore */ }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch { /* ignore */ }
}

function realFetch(input: RequestInfo, init?: RequestInit) {
  const f = (typeof window !== "undefined" && (window as any).__realFetch__) || fetch;
  return f(input, init);
}

export async function adminLogin(email: string, password: string): Promise<{ token: string; email: string }> {
  const res = await realFetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
  });
  let data: any = {};
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok || !data?.token) {
    throw new Error(data?.error || `Sign-in failed (${res.status})`);
  }
  const cleanEmail = email.trim().toLowerCase();
  setAdminSession(data.token, cleanEmail);
  return { token: data.token, email: cleanEmail };
}

export async function verifyAdminToken(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await realFetch("/api/admin/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken());
}
