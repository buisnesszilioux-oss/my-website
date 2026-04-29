process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.ADMIN_USERNAME = 'miengineering17@gmail.com,sahilsabirshaikh256@gmail.com';
process.env.ADMIN_PASSWORD = '6392061892';
process.env.JWT_SECRET = 'test-secret-rotate-immediately-' + Date.now();
process.env.PORT = '3098';
process.env.NODE_ENV = 'production';
process.chdir(__dirname + '/cpanel-backend');
require('./cpanel-backend/app.js');

setTimeout(async () => {
  const base = 'http://127.0.0.1:3098';
  const tests = [];
  const t = async (name, url, opts = {}) => {
    try {
      const r = await fetch(base + url, opts);
      const txt = await r.text();
      let json; try { json = JSON.parse(txt); } catch {}
      const summary = json
        ? JSON.stringify(json).substring(0, 200)
        : txt.substring(0, 100);
      console.log(`[${r.status}] ${name}  →  ${summary}`);
      return { status: r.status, body: json || txt };
    } catch (e) {
      console.log(`[ERR] ${name}  →  ${e.message}`);
      return null;
    }
  };
  console.log("\n========= END-TO-END DEPLOYMENT TEST =========\n");

  // 1. Health
  await t("GET  /api/health", "/api/health");

  // 2. Frontend served
  const home = await fetch(base + "/").then(r => r.text()).catch(()=>null);
  console.log("[200] GET  /  →  index.html served:", home && home.includes("M.I. Engineering") ? "YES ✓" : "NO ✗");

  // 3. Static asset
  const r = await fetch(base + "/favicon.png").catch(()=>null);
  console.log(`[${r?.status}] GET  /favicon.png  →  ${r?.status === 200 ? 'served ✓' : 'MISSING ✗'}`);

  // 4. Public reads
  await t("GET  /api/products  (count)", "/api/products");
  await t("GET  /api/industries (count)", "/api/industries");
  await t("GET  /api/standards (count)", "/api/standards");

  // 5. Admin login - WRONG password
  await t("POST /api/admin/login (wrong pw)", "/api/admin/login", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ username: "miengineering17@gmail.com", password: "WRONG" })
  });

  // 6. Admin login - CORRECT password
  const adminLogin = await t("POST /api/admin/login (correct)", "/api/admin/login", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ username: "miengineering17@gmail.com", password: "6392061892" })
  });
  const adminToken = adminLogin?.body?.token;

  // 7. Admin protected route
  if (adminToken) {
    await t("GET  /api/admin/contacts (with token)", "/api/admin/contacts", {
      headers: { authorization: "Bearer " + adminToken }
    });
  }

  // 8. NEW user register (random email)
  const email = "deploytest_" + Date.now() + "@example.com";
  const reg = await t("POST /api/auth/register (new)", "/api/auth/register", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ email, password: "Test1234!", name: "Deploy Test" })
  });
  const userToken = reg?.body?.token;

  // 9. EXISTING user login
  await t("POST /api/auth/login (existing)", "/api/auth/login", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ email, password: "Test1234!" })
  });

  // 10. Wrong password
  await t("POST /api/auth/login (wrong pw)", "/api/auth/login", {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ email, password: "WRONG" })
  });

  // 11. /api/auth/me
  if (userToken) {
    await t("GET  /api/auth/me (with user token)", "/api/auth/me", {
      headers: { authorization: "Bearer " + userToken }
    });
  }

  // 12. SPA fallback - random route returns index.html
  const spa = await fetch(base + "/some/random/route").then(r => r.text()).catch(()=>null);
  console.log("[200] GET  /some/random/route  →  SPA fallback:", spa && spa.includes("<div id=\"root\"") ? "YES ✓" : "NO ✗");

  console.log("\n========= TESTS DONE =========");
  process.exit(0);
}, 4000);
