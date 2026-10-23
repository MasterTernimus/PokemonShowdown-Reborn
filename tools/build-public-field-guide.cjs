/** Build a direct-reference index, never infer mechanics from matching source text. */
const fs=require('fs'),ts=require('typescript'),crypto=require('crypto');
const {calculatorMetadata}=require('../dist/sim/custom-calculator');
const fields=calculatorMetadata().fields.filter(f=>f.id),index={};
for(const f of fields)index[f.id]={abilities:[],moves:[],items:[]};
const fieldStartMessages={};
const hash=crypto.createHash('sha256');
for(const kind of ['terrains','abilities','moves','items','conditions']){
 const path='data/'+kind+'.ts',text=fs.readFileSync(path,'utf8');hash.update(path).update(text);const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true);
 if(kind==='terrains') {
  function starts(node){
   if(ts.isPropertyAssignment(node)&&ts.isObjectLiteralExpression(node.initializer)&&node.parent.parent?.name?.getText(source)==='Terrains') {
    const id=node.name.getText(source).replace(/['"]/g,''),condition=node.initializer.properties.find(p=>p.name?.getText(source)==='condition');
    const start=condition&&ts.isPropertyAssignment(condition)&&ts.isObjectLiteralExpression(condition.initializer)&&condition.initializer.properties.find(p=>p.name?.getText(source)==='onFieldStart');
    if(start&&ts.isMethodDeclaration(start)&&start.body) for(const statement of start.body.statements) {
     if(!ts.isExpressionStatement(statement)||!ts.isCallExpression(statement.expression))continue;
     const call=statement.expression,args=call.arguments;
     if(call.expression.getText(source)==='this.add'&&args[0]&&ts.isStringLiteral(args[0])&&args[0].text==='-message'&&args[1]&&ts.isStringLiteral(args[1]))(fieldStartMessages[id]||=[]).push(args[1].text);
    }
   }
   ts.forEachChild(node,starts);
  }starts(source);
 }
 if(!['abilities','moves','items'].includes(kind))continue;
 function visit(node){if(ts.isPropertyAssignment(node)&&ts.isObjectLiteralExpression(node.initializer)&&node.parent.parent?.name?.getText(source)===kind[0].toUpperCase()+kind.slice(1)){
  const literals=[];function strings(n){if(ts.isStringLiteral(n))literals.push(n.text);ts.forEachChild(n,strings);}strings(node.initializer);
  for(const field of fields)if(literals.includes(field.id))index[field.id][kind].push(node.name.getText(source).replace(/['"]/g,''));
 }ts.forEachChild(node,visit);}visit(source);
}
// Nature Power's mapping now lives in an explicitly shared helper; retain its direct references.
{
 const path='data/nature-power.ts',text=fs.readFileSync(path,'utf8'),source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true),literals=[];
 function strings(n){if(ts.isStringLiteral(n))literals.push(n.text);ts.forEachChild(n,strings);}strings(source);
 for(const field of fields)if(literals.includes(field.id)&&!index[field.id].moves.includes('naturepower'))index[field.id].moves.push('naturepower');
}
// Include imported data helpers, shared simulator rules and format setup in freshness evidence.
for(const dir of ['data','sim','config']) for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.ts')).sort()){const path=dir+'/'+name;hash.update(path).update(fs.readFileSync(path));}
hash.update(fs.readFileSync('server/field-guide.ts'));
fs.writeFileSync('data/field-guide-index.json',JSON.stringify({fingerprint:hash.digest('hex'),fields:index,fieldStartMessages},null,2)+'\n');console.log('Indexed '+fields.length+' fields; only direct code references, no generated effect claims.');
