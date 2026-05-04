const SESSION_KEY = "mi_admin_session";
const EMAIL_KEY = "mi_admin_email";

export function getAdminToken(): string | null {
  try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
}

export function getAdminEmail(): string | null {
  try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
}

export function setAdminSession(_token: string, email: string) {
  try {
    localStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem(EMAIL_KEY, email);
  } catch { }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch { }
}

export function isAdminLoggedIn(): boolean {
  try { return localStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

export async function adminLogin(_email: string, _password: string) {
  return { token: "1", email: _email };
}

export async function adminLogout() {
  clearAdminSession();
}

export async function verifyAdminToken(): Promise<boolean> {
  return isAdminLoggedIn();
}
