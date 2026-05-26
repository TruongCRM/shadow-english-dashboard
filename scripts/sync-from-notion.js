// scripts/sync-from-notion.js — runs in GitHub Action
// Pulls Topics database from Notion → writes content.json

const fs = require('fs');
const https = require('https');

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_TOPICS_DB;

if (!TOKEN || !DB_ID) {
  console.error('❌ Missing NOTION_TOKEN or NOTION_TOPICS_DB env vars');
  process.exit(1);
}

function notion(path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = { hostname: 'api.notion.com', path: path, method: body ? 'POST' : 'GET', headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' } };
    const req = https.request(opts, res => {
      let buf = ''; res.on('data', c => buf += c);
      res.on('end', () => { try { const j = JSON.parse(buf); res.statusCode >= 400 ? reject(new Error(buf)) : resolve(j); } catch(e) { reject(e); } });
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

function rt(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  if (prop.select) return (prop.select && prop.select.name) || '';
  return '';
}

function parsePhrases(t) { if (!t) return []; return t.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const p = l.split(/\s+[—\-\|]\s+/); return p.length >= 2 ? [p[0].trim(), p.slice(1).join(' — ').trim()] : [l,'']; }); }
function parseLines(t) { if (!t) return []; return t.split('\n').map(l => l.replace(/^[\-\*\d\.]\s*/,'').trim()).filter(Boolean); }
function parseDialogues(t) {
  if (!t) return []; return t.split(/\n\s*\n/).map(b => { const ls = b.split('\n').filter(Boolean); if (ls.length < 2) return null; return { title: ls[0].trim(), lines: ls.slice(1).map(l => { const m = l.match(/^([^:]+):\s*(.*)$/); return m ? [m[1].trim(), m[2].trim()] : ['', l.trim()]; }) }; }).filter(Boolean);
}

async function main() {
  console.log('🔄 Fetching from Notion...');
  const result = await notion('/v1/databases/' + DB_ID + '/query', { page_size: 100 });
  console.log('  Found ' + result.results.length + ' pages');
  const topics = {};
  for (const page of result.results) {
    const p = page.properties;
    const tid = rt(p['Topic ID']) || page.id.substring(0,8);
    const name = rt(p['Topic Name']);
    if (!name) continue;
    topics[tid] = {
      why: rt(p['Why']),
      scene: rt(p['Scene']),
      phrases: { before: parsePhrases(rt(p['Phrases Before'])), during: parsePhrases(rt(p['Phrases During'])), after: parsePhrases(rt(p['Phrases After'])) },
      dialogues: parseDialogues(rt(p['Dialogues'])),
      shadow_script: rt(p['Shadow Script']),
      missions: parseLines(rt(p['Real Life Missions'])),
      active_recall: parseLines(rt(p['Active Recall'])),
      real_english: parseLines(rt(p['Real English'])),
      _notion_page_id: page.id,
      _name_canonical: name
    };
  }
  const out = { schema: 'shadow-english-content-v1', generatedAt: new Date().toISOString(), source: 'notion', notionDbId: DB_ID, topics: topics };
  fs.writeFileSync('content.json', JSON.stringify(out, null, 2));
  console.log('✅ Wrote ' + Object.keys(topics).length + ' topics');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
