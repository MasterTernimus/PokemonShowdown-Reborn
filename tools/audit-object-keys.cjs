'use strict';
const fs = require('fs');
const ts = require('typescript');
let duplicates = 0;
for (const file of process.argv.slice(2)) {
	const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
	function visit(node) {
		if (ts.isObjectLiteralExpression(node)) {
			const seen = new Map();
			for (const property of node.properties) {
				if (!property.name || ts.isComputedPropertyName(property.name)) continue;
				const key = property.name.text;
				if (key === undefined) continue;
				const line = source.getLineAndCharacterOfPosition(property.getStart()).line + 1;
				if (seen.has(key)) {
					console.log(`${file}:${line}: duplicate ${key} (first at ${seen.get(key)})`);
					duplicates++;
				}
				seen.set(key, line);
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(source);
}
console.log(`Duplicate object keys: ${duplicates}`);
process.exitCode = duplicates ? 1 : 0;
