const fs = require('fs');
const { execSync } = require('child_process');
const { token, accountId } = require('./config.js');

const API = 'https://api.cloudflare.com/client/v4';

function randName() {
  const a = ['red','blue','dark','ice','fire','void','steel','night','toxic','neon','ghost','silent','crimson','phantom','blaze','shadow','raven','cobra','shark','wolf'];
  const b = ['viper','storm','blade','fang','claw','bite','strike','haze','flux','core','link','node','gate','echo','pulse','spark','bolt','wave','riot','forge'];
  return `${a[Math.floor(Math.random()*a.length)]}-${b[Math.floor(Math.random()*b.length)]}-${Math.floor(Math.random()*9999)}`;
}

async function deploy(name) {
  try {
    const cmd = `wrangler deploy --name ${name} --compatibility-date 2025-11-08 --var VERSION:${Date.now()}`;
    console.log(`Spawning: ${cmd}`);

    const output = execSync(cmd, { 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        CLOUDFLARE_API_TOKEN: token 
      }
    });

    const url = `https://${name}.workers.dev`;
    fs.appendFileSync('live.txt', url + '\n');
    console.log(`LIVE → ${url}`);
  } catch (e) {
    const err = e.stderr?.toString() || e.message || 'unknown';
    console.log(`FAILED ${name} → ${err.split('\n')[0].substring(0, 120)}`);
    fs.appendFileSync('failed.log', `${new Date().toISOString()} | ${name} | ${err}\n`);
  }
}

async function burnOld() {
  if (!fs.existsSync('live.txt')) return;
  const lines = fs.readFileSync('live.txt', 'utf-8').split('\n').filter(Boolean);
  const keep = [];
  for (let url of lines) {
    const name = url.match(/https?:\/\/([^.]+)\.workers\.dev/)?.[1];
    if (!name) continue;
    try {
      const r = await fetch(`${API}/accounts/${accountId}/workers/scripts/${name}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!r.ok || Date.now() - new Date((await r.json()).result.uploaded_on).getTime() > 12*3600000) {
        await fetch(`${API}/accounts/${accountId}/workers/scripts/${name}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        console.log(`BURNED → ${url}`);
      } else keep.push(url);
    } catch { keep.push(url); }
  }
  fs.writeFileSync('live.txt', keep.join('\n') + '\n');
}

async function run() {
  console.log `\nREX FACTORY ONLINE - ${new Date().toLocaleString()}\n`;
  await burnOld();
  let need = 800 - (fs.existsSync('live.txt') ? fs.readFileSync('live.txt','utf-8').split('\n').filter(Boolean).length : 0);
  need = Math.max(50, need);
  console.log(`Deploying ${need} new workers...`);
  for (let i = 0; i < need; i++) {
    await deploy(randName());
    await new Promise(r => setTimeout(r, 4000 + Math.random()*3000));
  }
  console.log(`DONE → ${fs.readFileSync('live.txt','utf-8').split('\n').filter(Boolean).length} live URLs`);
}

run();
setInterval(run, 4*3600000);
