/** Private, battle-scoped consent; no team data is stored in this state machine. */
export class MoveSheetConsent {
 generation = 0;
 identities = '';
 accepted = new Set<string>();
 enabled = false;
 sync(players: readonly string[]) {
  const identities = JSON.stringify(players);
  if (this.identities !== identities) {
   this.identities = identities;
   this.reset();
  }
 }
 reset() { this.generation++; this.accepted.clear(); this.enabled = false; }
 decide(player: string, players: readonly string[], action: string, generation: number) {
  this.sync(players);
  if (players.length !== 2 || !players.includes(player)) throw new Error('Only the two battle players can consent.');
  if (generation !== this.generation) throw new Error('This request has expired. Open the current move sheet controls.');
  if (this.enabled) return false;
  if (action === 'cancel' || action === 'decline') { this.reset(); return false; }
  if (action !== 'request' && action !== 'accept') throw new Error('Unknown move sheet action.');
  if (action === 'accept' && !this.accepted.size) throw new Error('There is no pending request.');
  this.accepted.add(player);
  if (this.accepted.size === 2) { this.enabled = true; return true; }
  return false;
 }
}
