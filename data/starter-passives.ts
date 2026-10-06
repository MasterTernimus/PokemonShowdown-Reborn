/** Only the existing Proficient-bearing gimmick starter forms. These are species traits, never selectable abilities. */
export const StarterPassives: {[id: string]: readonly string[]} = {};
export const ProficientPassiveForms = new Set(('venusaurmega venusaurgmax charizardmegax charizardmegaxalt charizardmegay charizardgmax blastoisemega blastoisegmax meganiummega meganiummegay typhlosionmega feraligatrmega feraligatrgmax sceptilemega blazikenmega swampertmega torterramegax torterramegay infernapemega empoleonmega serperiormega emboarmega emboarmegareborn chesnaughtmega delphoxmega greninjaash greninjamega rillaboomgmax cinderacegmax cinderacemega inteleongmax').split(' '));
for (const id of ProficientPassiveForms) StarterPassives[id] = Object.freeze(['proficient']);
Object.freeze(StarterPassives);
