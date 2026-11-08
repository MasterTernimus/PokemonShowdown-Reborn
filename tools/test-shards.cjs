'use strict';
// Run the normal Mocha inventory in bounded processes without changing test expectations.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts', 'test-shards');
fs.mkdirSync(output, {recursive: true});
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e =>
 e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const files = ['lib','server','sim','tools','random-battles'].flatMap(dir =>
 walk(path.join(root,'test',dir)).filter(file => file.endsWith('.js')).sort());
const results = [];
const includeSlow = process.argv.includes('--include-slow');
const limit = Number(process.env.TEST_SHARD_TIMEOUT_MS || 120000);
function run(batch, name) {
 const args = [require.resolve('mocha/bin/mocha.js'), '--no-config', '--reporter','json',
  '--timeout','10000','--forbid-only','--exit',
  ...(!includeSlow ? ['--grep','^((?!\\(slow\\)).)*$'] : []),
  'test/bootstrap.mjs', ...batch];
 const child = cp.spawnSync(process.execPath, args, {cwd:root, encoding:'utf8',
  timeout:limit,maxBuffer:64*1024*1024,windowsHide:true});
 const log = (child.stdout || '') + '\n' + (child.stderr || '');
 fs.writeFileSync(path.join(output,name+'.log'), log);
 let report;
 const start = log.search(/\{\s*"stats"\s*:/);
 if (start >= 0) { try { report=JSON.parse(log.slice(start,log.lastIndexOf('}')+1)); } catch {} }
 // Retrying an unreported batch individually identifies hangs without hiding failures.
 if (!report && batch.length > 1) {
  console.log(name+': no complete report; isolating '+batch.length+' files');
  batch.forEach((file,i)=>run([file],name+'-'+i));
  return;
 }
 results.push({files:batch.map(file=>path.relative(root,file)),exit:child.status,
  error:child.error?.message,signal:child.signal,stats:report?.stats,
  failures:report?.failures,log:name+'.log'});
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
 console.log(name+': '+(report ? `${report.stats.passes} passed, ${report.stats.failures} failed, ${report.stats.pending} pending` : 'FAILED: no report'));
}
for(let i=0;i<files.length;i+=15) run(files.slice(i,i+15),String(i/15).padStart(3,'0'));
const summary={files:files.length,includeSlow,passes:0,failures:0,pending:0,incomplete:0};
for(const r of results) { for(const key of ['passes','failures','pending'])summary[key]+=r.stats?.[key]||0; if(!r.stats)summary.incomplete++; }
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
process.exitCode=results.some(r=>r.exit!==0||!r.stats||r.stats.failures)?1:0;
