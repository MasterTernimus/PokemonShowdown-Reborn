'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../..');
function loadBuild() {
	const calls = { inputs: [], declarations: 0, cacheRuns: [] };
 const exports = {};
	const buildRequire = require('module').createRequire(path.join(root, 'tools/build-utils.js'));
	const mockRequire = name => {
		if (name === 'fs') return { ...fs, mkdirSync() {}, copyFileSync() {}, writeFileSync() {} };
		if (name === 'esbuild') return { buildSync(options) { calls.inputs = options.entryPoints; } };
		if (name === 'child_process') return { execFileSync() { calls.declarations++; throw new Error('declaration failed'); } };
		if (name === './build-cache') return { run(inputs, force, compile) {
			calls.cacheRuns.push({ inputs, force });
			// Exercise compilation while keeping test output isolated from the real cache/dist.
			calls.outputs = compile('test-build-stage', null);
		} };
		return buildRequire(name);
	};
	mockRequire.resolve = buildRequire.resolve;
 vm.runInNewContext(fs.readFileSync(path.join(root, 'tools/build-utils.js'), 'utf8'), {
		exports, process, console: { log() {} }, require: mockRequire,
 });
 return {build: exports, calls};
}
function loadAdmin(error = null, stderr = '') {
 const calls = {builds: 0, clears: 0, replies: []};
 const context = {canUseConsole() {}, stafflog() {}, sendReply(s) {calls.replies.push(s);}, parse() {throw new Error('Unexpected command recursion');}};
 const exports = {};
 const modules = {};
 const sandbox = {
  exports, module: {exports}, process, console,
  Monitor: {updateServerLock: false, hotpatchLock: {}},
  Config: {}, Chat: {ErrorMessage: Error}, toID: s => s.toLowerCase(),
  Rooms: {global: {notifyRooms() {}}},
  require(name) {
   if (name === 'child_process') return {exec(command, options, callback) {calls.builds++; callback(error, '', stderr);}};
   if (name === '../../lib') return {FS: {ROOT_PATH: root}, Utils: {clearRequireCache() {calls.clears++;}}};
   if (name === 'path') return path;
   if (modules[name]) return modules[name];
   throw new Error('Unexpected require ' + name);
  },
 };
 vm.runInNewContext('(function () {' + fs.readFileSync(path.join(root, 'dist/server/chat-commands/admin.js'), 'utf8') + '\n})()', sandbox);
 return {commands: sandbox.module.exports.commands, context, calls, sandbox, modules};
}
describe('Build and reload reliability', () => {
 it('force builds skip declarations and exclude saved/generated TypeScript', () => {
  const {build, calls} = loadBuild();
  build.transpile(true, false);
		assert.equal(calls.declarations, 0);
		assert.equal(calls.cacheRuns.length, 1);
		assert.equal(calls.cacheRuns[0].force, true);
		assert(calls.cacheRuns[0].inputs.includes(require.resolve('esbuild/package.json')));
		assert(calls.outputs.some(f => f.replace(/\\/g, '/') === 'dist/sim/battle.js'));
  assert(calls.inputs.some(f => f.replace(/\\/g, '/') === 'sim/battle.ts'));
  assert(calls.inputs.every(f => !/^(dist|artifacts|test|node_modules)[\\/]/.test(f)));
 });
 it('declaration failures propagate', () => {
  const {build, calls} = loadBuild();
  assert.throws(() => build.transpile(true, true), /declaration failed/);
		assert.equal(calls.declarations, 1);
 });
 it('a failed build stops hotpatching before cache invalidation', async () => {
  const {commands, context, calls} = loadAdmin({code: 1});
  await assert.rejects(commands.hotpatch.call(context, 'all'), /Build failed/);
		assert.equal(calls.builds, 1);
		assert.equal(calls.clears, 0);
 });
 it('warnings alone do not fail a successful rebuild', async () => {
  const {commands, context, calls} = loadAdmin(null, 'warning');
  await commands.rebuild.call(context);
		assert.deepEqual(calls.replies, ['Rebuilt.']);
 });
 it('a killed build without an exit code is still a failure', async () => {
  const {commands, context} = loadAdmin({killed: true});
  await assert.rejects(commands.rebuild.call(context), /Build failed/);
 });
 it('hotpatch all uses the internal sequence and stops at a failed component', async () => {
  const {commands, context, calls, sandbox} = loadAdmin();
  sandbox.Monitor.hotpatchLock.chat = {by: 'test', reason: 'locked'};
  await assert.rejects(commands.hotpatch.call(context, 'all', null, {name: 'Test', getIdentity() {return 'Test';}}), /disabled/);
		assert.equal(calls.builds, 1);
		assert.equal(calls.clears, 2);
 });
 it('hotpatch all completes all nine components with one build', async () => {
  const {context, calls, sandbox, modules} = loadAdmin();
  const noop = () => {};
  class Stub {}
  const pm = Object.fromEntries(['QueryProcessManager', 'StreamProcessManager', 'ProcessManager', 'RawProcessManager', 'QueryProcessWrapper', 'StreamProcessWrapper', 'RawProcessWrapper'].map(name => [name, Stub]));
  const fileSystem = () => ({unwatch: noop});
  fileSystem.ROOT_PATH = root;
  // Replace the imported library before loading a fresh copy of the command module.
  const originalRequire = sandbox.require;
  sandbox.require = name => name === '../../lib' ? {FS: fileSystem, ProcessManager: pm, Utils: {clearRequireCache() {calls.clears++;}}} : originalRequire(name);
  sandbox.Chat = {ErrorMessage: Error, allCommands: () => [], destroy: noop, start: noop, loadPlugins: noop, plugins: {}, count: n => String(n)};
  sandbox.Config = {usesqlite: true, usesqlitemodlog: true};
  sandbox.Rooms = {BasicRoom: Stub, PM: {respawn: noop}, Modlog: {restart: noop}, global: {notifyRooms: noop, sendAll: noop}};
  sandbox.Users = {User: Stub};
  sandbox.TeamValidatorAsync = {PM: {respawn: noop}};
  sandbox.global = sandbox;
  Object.assign(modules, {
   '../chat': {Chat: sandbox.Chat}, '../tournaments': {Tournaments: {}},
   '../../sim/dex': {Dex: {}}, '../../sim/teams': {Teams: {}},
   '../loginserver': {LoginServer: {}}, '../punishments': {Punishments: {}},
   '../ip-tools': {IPTools: {loadHostsAndRanges: noop}}, '../../lib/process-manager': pm,
   '../users': {User: Stub}, '../rooms': {BasicRoom: Stub},
  });
  vm.runInNewContext('(function () {' + fs.readFileSync(path.join(root, 'dist/server/chat-commands/admin.js'), 'utf8') + '\n})()', sandbox);
  await sandbox.module.exports.commands.hotpatch.call(context, 'all', null, {name: 'Test', getIdentity() {return 'Test';}});
		assert.equal(calls.builds, 1);
  assert(calls.replies.includes('Hotpatching formats...'));
  assert(calls.replies.includes('Hotpatching user prototypes...'));
 });
 it('update errors always release the update lock', async () => {
  const {commands, context, sandbox} = loadAdmin();
  await assert.rejects(commands.updateserver.call(context, 'private'), /privatecodepath/);
		assert.equal(sandbox.Monitor.updateServerLock, false);
 });
});
