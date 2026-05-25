import React from 'react';

import { CURRENCY_ORDER, formatSkillLabel, formatSlug } from './characterFormatters';

// Features, proficiency lists, and the currency/notes panel, two-up.
// Background-granted skills are shown on their own line so the player can
// see exactly what the background contributed versus their class picks.
export default function FeaturesPanel({ character, features }) {
    return (
        <div className="detail-section-grid">
            <div className="detail-panel">
                <h3>Features & Proficiencies</h3>
                <ul className="detail-list">
                    <li><span>Languages</span><strong>{(character.languages || []).join(', ') || 'None'}</strong></li>
                    <li><span>Saving Throws</span><strong>{(character.savingThrowProficiencies || []).map((value) => value.toUpperCase()).join(', ') || 'None'}</strong></li>
                    <li><span>Skills</span><strong>{(character.skillProficiencies || []).map(formatSkillLabel).join(', ') || 'None'}</strong></li>
                    <li><span>Background Skills</span><strong>{(character.backgroundSkillProficiencies || []).map(formatSkillLabel).join(', ') || 'None'}</strong></li>
                    <li><span>Weapons</span><strong>{(character.weaponProficiencies || []).map(formatSlug).join(', ') || 'None'}</strong></li>
                    <li><span>Armor</span><strong>{(character.armorProficiencies || []).map(formatSlug).join(', ') || 'None'}</strong></li>
                </ul>
                <div className="tag-list">
                    {features.map((feature) => (
                        <span key={feature.id} className="detail-tag">
                            {feature.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="detail-panel">
                <h3>Currency & Notes</h3>
                <ul className="detail-list">
                    <li>
                        <span>Coin</span>
                        <strong>{CURRENCY_ORDER.map((type) => `${character.currency?.[type] ?? 0} ${type.toUpperCase()}`).join(', ')}</strong>
                    </li>
                    <li><span>Traits</span><strong>{character.traits || 'Unset'}</strong></li>
                    <li><span>Ideals</span><strong>{character.ideals || 'Unset'}</strong></li>
                    <li><span>Bonds</span><strong>{character.bonds || 'Unset'}</strong></li>
                    <li><span>Flaws</span><strong>{character.flaws || 'Unset'}</strong></li>
                </ul>
            </div>
        </div>
    );
}
