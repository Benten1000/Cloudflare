// factory.mjs — REX FACTORY v3: INFINITE ESM DEPLOYER
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { token } = require('./config.js');

function randName() {
  const a = ['red','blue','dark','ice','fire','void','steel','night','toxic','neon','ghost','silent','crimson','phantom','blaze','shadow','raven','cobra','shark','wolf'];
  const b = ['viper','storm','blade','fang','claw','bite','strike','haze','flux','core','link','node','gate','echo','pulse','spark','bolt','wave','riot','forge'];
  return `${a[Math.floor(Math.random()*a.length)]}-${b[Math.floor(Math.random()*b.length)]}-${Math.floor(Math.random()*9999)}`;
}

async function deploy(name) {
  try {
    const cmd = `wrangler deploy --name ${name} --compatibility-date 2025-11-08 --var VERSION:${Date.now()}`;
    console.log(`[+] Deploying: ${name}`);

    execSync(cmd, { 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        CLOUDFLARE_API_TOKEN: token 
      }
    });

    const url = `https://${name}.workers.dev`;
    appendFileSync('live.txt', url + '\n');
    console.log(`LIVE → ${url}`);
    return true;
  } catch (e) {
    const err = e.stderr?.toString() || e.message || 'unknown';
    console.log(`FAILED ${name} → ${err.split('\n')[0].substring(0, 120)}`);
    appendFileSync('failed.log', `${new Date().toISOString()} | ${name} | ${err}\n`);
    return false;
  }
}

async function run() {
  console.log(`\nREX FACTORY ONLINE - ITALY - ${new Date().toLocaleString('it-IT')}\n`);

  const existing = existsSync('live.txt') 
    ? readFileSync('live.txt', 'utf-8').split('\n').filter(Boolean) 
    : [];

  const currentCount = existing.length;
  let need = 800 - currentCount;
  need = Math.max(50, need);

  console.log(`Current live: ${currentCount} | Deploying ${need} new workers...`);

  let success = 0;
  for (let i = 0; i < need; i++) {
    const name = randName();
    if (await deploy(name)) success++;
    await new Promise(r => setTimeout(r, 4000 + Math.random() * 3000));
  }

  const finalCount = readFileSync('live.txt', 'utf-8').split('\n').filter(Boolean).length;
  console.log(`DONE → ${finalCount} TOTAL LIVE WORKERS (Δ +${success})`);
}

run();
setInterval(run, 4 * 3600000); // Every 4 hours
