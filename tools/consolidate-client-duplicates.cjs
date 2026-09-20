'use strict';
const fs = require('fs');
const ts = require('typescript');
const file = process.argv[2];
const text = fs.readFileSync(file, 'utf8');
const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
const edits = [];
function visit(node) {
	if (ts.isObjectLiteralExpression(node)) {
		const groups = new Map();
		for (const p of node.properties) {
			const key = p.name?.text;
			if (key !== undefined) groups.set(key, [...(groups.get(key) || []), p]);
		}
		for (const [key, entries] of groups) {
			if (entries.length !== 2) continue;
			const [first, last] = entries;
			let replacement;
			if (key === 'bogbody') {
				replacement = "bogbody: ['thickfat' as ID, 'levitate' as ID, 'dryskin' as ID]";
			} else if (ts.isObjectLiteralExpression(first.initializer) && ts.isObjectLiteralExpression(last.initializer)) {
				const fields = new Map();
				// The earlier sprite rows contain the verified dimensions and shiny data.
				const isSprite = first.initializer.properties.some(p => p.name?.text === 'front');
				for (const entry of isSprite ? [last, first] : [first, last]) {
					for (const p of entry.initializer.properties) fields.set(p.name.text, p.getText(source));
				}
				replacement = `${key}: {\n\t\t${[...fields.values()].join(',\n\t\t')},\n\t}`;
			} else throw new Error(`Unreviewed duplicate ${key}`);
			edits.push({start: first.getStart(), end: first.end, replacement});
			const next = node.properties[node.properties.indexOf(last) + 1];
			edits.push({start: last.getFullStart(), end: next ? next.getFullStart() : last.end, replacement: ''});
		}
	}
	ts.forEachChild(node, visit);
}
visit(source);
let result = text;
for (const e of edits.sort((a, b) => b.start - a.start)) result = result.slice(0, e.start) + e.replacement + result.slice(e.end);
fs.writeFileSync(file, result);
console.log(`Consolidated ${edits.length / 2} duplicate entries.`);
