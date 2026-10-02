import {Utils} from '../lib';
import {type ModdedDex} from '../sim/dex';
import {getAbilityDisplayComponents} from '../data/ability-display';

/** Full command output lives outside the compact selector row. */
export function getAbilityMechanicsHTML(ability: Ability, dex: ModdedDex): string {
 const escape = Utils.escapeHTML;
 let html = '<div class="infobox"><strong>Full mechanics</strong><p>' +
  escape(ability.desc || ability.shortDesc || 'No description available.') + '</p>';
 const parts = getAbilityDisplayComponents(ability.id).map(id => dex.abilities.get(id)).filter(part => part.exists);
 if (parts.length) {
  html += '<p><strong>Components:</strong> ' + parts.map(part =>
   '<button class="button" name="send" value="/dt ' + escape(part.name) + ', gen' + dex.gen + '">' + escape(part.name) + '</button>'
  ).join(' + ') + '</p><small>Component references describe the individual abilities. The composite description above controls its conditions and overrides.</small>';
 }
 return html + '</div>';
}
