process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.ADMIN_USERNAME = 'miengineering17@gmail.com,sahilsabirshaikh256@gmail.com';
process.env.ADMIN_PASSWORD = '6392061892';
process.env.JWT_SECRET = 'test-secret-for-local-testing-only-rotate-immediately';
process.env.PORT = '3099';
process.env.NODE_ENV = 'production';

require('./cpanel-backend/server.cjs');
setTimeout(async () => {
  const tests = [
    { name: "health", url: "http://127.0.0.1:3099/api/health", method: "GET" },
    { name: "admin login (bad pass)", url: "http://127.0.0.1:3099/api/admin/login", method: "POST", body: { username: "miengineering17@gmail.com", password: "wrong" } },
    { name: "admin login (correct)", url: "http://127.0.0.1:3099/api/admin/login", method: "POST", body: { username: "miengineering17@gmail.com", password: "6392061892" } },
    { name: "user login (existing)", url: "http://127.0.0.1:3099/api/auth/login", method: "POST", body: { email: "s6392061892@gmail.com", password: "test123" } },
    { name: "user register (new)", url: "http://127.0.0.1:3099/api/auth/register", method: "POST", body: { email: "newtest@example.com", password: "Test1234!", name: "Test User" } },
  ];
  for (const t of tests) {
    try {
      const r = await fetch(t.url, {
        method: t.method,
        headers: { 'content-type': 'application/json' },
        body: t.body ? JSON.stringify(t.body) : undefined,
      });
      const txt = await r.text();
      console.log(`\n[${t.name}] status=${r.status}`);
      console.log("  body:", txt.substring(0, 300));
    } catch(e) {
      console.log(`[${t.name}] FAILED:`, e.message);
    }
  }
  process.exit(0);
}, 2500);
