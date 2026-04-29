process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.ADMIN_USERNAME = 'miengineering17@gmail.com,sahilsabirshaikh256@gmail.com';
process.env.ADMIN_PASSWORD = '6392061892';
process.env.JWT_SECRET = 'split-test-' + Date.now();
process.env.PORT = '3097';
process.env.NODE_ENV = 'production';
process.chdir(__dirname + '/cpanel-backend');
require('./cpanel-backend/app.js');

setTimeout(async () => {
  const base = 'http://127.0.0.1:3097';
  console.log("\n========= SPLIT-DEPLOYMENT TEST (backend at /api) =========\n");
  const t = async (name, url, opts = {}) => {
    try {
      const r = await fetch(base + url, opts);
      const txt = await r.text();
      let json; try { json = JSON.parse(txt); } catch {}
      const summary = json ? JSON.stringify(json).substring(0, 150) : txt.substring(0, 80);
      console.log(`[${r.status}] ${name}  →  ${summary}`);
      return { status: r.status, body: json };
    } catch (e) { console.log(`[ERR] ${name}  →  ${e.message}`); return null; }
  };

  await t("/api/health", "/api/health");
  await t("/api/products  (split mode)", "/api/products");
  const al = await t("/api/admin/login (correct)", "/api/admin/login", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ username: "miengineering17@gmail.com", password: "6392061892" })
  });
  if (al?.body?.token) {
    await t("/api/admin/contacts (token)", "/api/admin/contacts", {
      headers: { authorization: "Bearer " + al.body.token }
    });
  }
  const email = "split_test_" + Date.now() + "@ex.com";
  const reg = await t("/api/auth/register (new)", "/api/auth/register", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ email, password: "Test1234!", name: "Split" })
  });
  await t("/api/auth/login (existing)", "/api/auth/login", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ email, password: "Test1234!" })
  });
  if (reg?.body?.token) {
    await t("/api/auth/me (user token)", "/api/auth/me", {
      headers: { authorization: "Bearer " + reg.body.token }
    });
  }
  // Test the new /api/uploads alias works (even if folder is empty, mount should respond 404 not error)
  const r = await fetch(base + "/api/uploads/__nonexistent.png");
  console.log(`[${r.status}] /api/uploads/__nonexistent.png  →  ${r.status === 404 ? '✓ alias mounted (404 expected)' : 'unexpected'}`);

  console.log("\n========= ALL SPLIT-DEPLOYMENT TESTS DONE =========");
  process.exit(0);
}, 4000);
