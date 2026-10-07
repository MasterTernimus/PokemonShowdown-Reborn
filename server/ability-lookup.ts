import {Utils} from '../lib';
import {type ModdedDex} from '../sim/dex';
import {getAbilityDisplayComponents, abilityDescriptionLines} from '../data/ability-display';

/** Full command output lives outside the compact selector row. */
export function getAbilityMechanicsHTML(ability: Ability, dex: ModdedDex): string {
 const escape = Utils.escapeHTML;
 let html = '<div class="infobox"><strong>' + escape(ability.name) + '</strong>';
 const parts = getAbilityDisplayComponents(ability.id).map(id => dex.abilities.get(id)).filter(part => part.exists);
 if (parts.length) {
  html += '<p><strong>Components:</strong> ' + parts.map(part =>
   '<button class="button" name="send" value="/dt ' + escape(part.name) + ', gen' + dex.gen + '">' + escape(part.name) + '</button>'
  ).join(' + ') + '</p>';
 }
 html += '<ul>' + abilityDescriptionLines(ability.desc || ability.shortDesc || 'No description available.')
  .map(line => '<li>' + escape(line) + '</li>').join('') + '</ul>';
 if (parts.length) html += '<small>The effects above include this ability\'s specific conditions and exceptions.</small>';
 return html + '</div>';
}
