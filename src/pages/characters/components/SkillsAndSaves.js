import React from 'react';

import { ABILITY_ORDER, formatModifier, formatSkillLabel, SKILL_ABILITIES } from './characterFormatters';

function getSkillBreakdown(character, skill, bonus) {
    const ability = SKILL_ABILITIES[skill];
    const abilityMod = character.abilityMods?.[ability] ?? 0;
    const classSkills = new Set(character.skillProficiencies || []);
    const backgroundSkills = new Set(character.backgroundSkillProficiencies || []);
    const expertiseSkills = new Set(character.expertiseProficiencies || []);
    const proficiencyBonus = classSkills.has(skill) || backgroundSkills.has(skill)
        ? character.proficiencyBonus || 0
        : 0;
    const expertiseBonus = expertiseSkills.has(skill) ? character.proficiencyBonus || 0 : 0;
    const otherBonus = bonus - abilityMod - proficiencyBonus - expertiseBonus;
    const parts = [`${ability?.toUpperCase() || 'Ability'} ${formatModifier(abilityMod)}`];

    if (proficiencyBonus) {
        const source = backgroundSkills.has(skill) ? 'background proficiency' : 'class proficiency';
        parts.push(`${source} ${formatModifier(proficiencyBonus)}`);
    }

    if (expertiseBonus) {
        parts.push(`expertise ${formatModifier(expertiseBonus)}`);
    }

    if (otherBonus) {
        parts.push(`other ${formatModifier(otherBonus)}`);
    }

    return `${formatSkillLabel(skill)}: ${parts.join(' + ')} = ${formatModifier(bonus)}`;
}

// Read-only saving throws and the 18-skill list, rendered as a two-up pair.
// Skill values come pre-derived from the backend (class + background + race
// proficiencies are already folded into skillValues).
export default function SkillsAndSaves({ character }) {
    return (
        <div className="detail-section-grid">
            <div className="detail-panel">
                <h3>Saving Throws</h3>
                <ul className="detail-list">
                    {ABILITY_ORDER.map((ability) => (
                        <li key={ability}>
                            <span>{ability.toUpperCase()}</span>
                            <strong>{formatModifier(character.savingThrows?.[ability] ?? 0)}</strong>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="detail-panel">
                <h3>Skills</h3>
                <ul className="detail-list">
                    {Object.entries(character.skillValues || {}).map(([skill, bonus]) => (
                        <li key={skill}>
                            <span>{formatSkillLabel(skill)}</span>
                            <strong
                                aria-label={getSkillBreakdown(character, skill, bonus)}
                                className="skill-breakdown"
                                title={getSkillBreakdown(character, skill, bonus)}
                            >
                                {formatModifier(bonus)}
                            </strong>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
