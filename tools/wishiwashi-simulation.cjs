const http = require('http');
const fs = require('fs');
const path = require('path');
const common = require('../test/common');

const client = path.resolve(__dirname, '..', '..', '..', 'showdown server', 'PokemonShowdown-Client', 'play.pokemonshowdown.com');
const port = 8634;
function battleLog(ability) {
	const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
		{species: 'Wishiwashi', ability, moves: ['splash']},
	], [{species: 'Pikachu', moves: ['splash']}]]);
	battle.makeChoices('team 1', 'team 1');
	battle.makeChoices('move splash', 'move splash');
	const log = battle.log.join('\n');
	battle.destroy();
	return log;
}
const regular = battleLog('Schooling');
const sevii = battleLog('Sevii Schooling');
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Wishiwashi School battle simulation</title>
<link rel="stylesheet" href="/client/style/battle.css"><link rel="stylesheet" href="/client/style/client.css">
<style>body{margin:0;background:#182432;color:#fff;font:16px Arial}.rows{display:flex;gap:24px;padding:24px}.column{width:640px}.battle{width:640px;height:360px;position:relative}.battle-log{display:none}h2{margin:0 0 10px;font-size:20px}</style>
<script src="/client/js/lib/jquery-2.2.4.min.js"></script><script src="/client/js/lib/html-css-sanitizer-minified.js"></script>
<script src="/client/js/lib/lodash.core.js"></script><script src="/client/js/lib/backbone.js"></script>
<script src="/client/js/battle-sound.js"></script><script src="/client/js/battledata.js"></script>
<script src="/client/data/pokedex-mini.js"></script><script src="/client/data/typechart.js"></script>
<script src="/client/data/text.js"></script>
<script src="/client/js/battle-animations-moves.js"></script><script src="/client/js/battle-text-parser.js"></script><script src="/client/js/battle-log.js"></script>
<script src="/client/js/battle-tooltips.js"></script>
<script src="/client/js/battle-animations.js"></script>
<script src="/client/js/battle.js"></script><script src="/client/data/pokedex.js"></script>
<script src="/client/data/moves.js"></script><script src="/client/data/items.js"></script><script src="/client/data/abilities.js"></script>
</head><body><div class="rows"><div class="column"><h2>Wishiwashi-School back</h2><div class="battle" id="regular"></div><div class="battle-log" id="regularlog"></div></div>
<div class="column"><h2>Wishiwashi-Sevii-Schooling back</h2><div class="battle" id="sevii"></div><div class="battle-log" id="seviilog"></div></div></div>
<pre id="error" style="color:#ffb3b3"></pre><script>
window.onerror=(m,s,l)=>{document.getElementById('error').textContent += m+' '+s+':'+l+'\\n'};
Dex.resourcePrefix='/client/';Dex.fxPrefix='/client/fx/';
const logs=[${JSON.stringify(regular)},${JSON.stringify(sevii)}];
const battles=logs.map((log,i)=>new Battle({$frame:$(i?'#sevii':'#regular'),$logFrame:$(i?'#seviilog':'#regularlog'),log:log.split('\\n'),isReplay:true,paused:true}));
window.battles=battles;
for(const battle of battles)battle.seekTurn(2);
</script></body></html>`;

const types = {'.js':'text/javascript','.css':'text/css','.png':'image/png','.gif':'image/gif','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'};
http.createServer((req,res)=>{
	if (req.url === '/save-screenshot' && req.method === 'POST') {
		const chunks = [];
		req.on('data', chunk => chunks.push(chunk));
		req.on('end', () => {
			fs.writeFileSync(path.resolve(__dirname, '..', '..', 'Wishiwashi-Showdown-battle-simulation.png'), Buffer.concat(chunks));
			res.writeHead(200);res.end('saved');
		});
		return;
	}
	if (req.url === '/' || req.url === '/sim.html') {
		res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});res.end(html);return;
	}
	const rel = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\/client\//,'');
	const filename = path.resolve(client, rel);
	if (!req.url.startsWith('/client/') || !filename.startsWith(client + path.sep)) {res.writeHead(404);res.end();return;}
	fs.readFile(filename,(err,data)=>{
		if(err){res.writeHead(404);res.end();return;}
		res.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream'});res.end(data);
	});
}).listen(port,'127.0.0.1',()=>console.log(`Wishiwashi Showdown simulation: http://127.0.0.1:${port}/sim.html`));
