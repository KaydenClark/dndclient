import React from 'react';

import { ABILITY_ORDER, formatModifier, formatSkillLabel } from './characterFormatters';

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
                            <strong>{formatModifier(bonus)}</strong>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
