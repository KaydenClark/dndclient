import React from 'react';

import { ABILITY_ORDER, formatModifier } from './characterFormatters';

// Read-only 6-ability grid showing each score and its derived modifier.
export default function AbilityScores({ character }) {
    return (
        <div className="detail-panel">
            <h3>Ability Scores</h3>
            <div className="ability-score-grid detail-ability-grid">
                {ABILITY_ORDER.map((ability) => (
                    <div key={ability} className="ability-score-field ability-score-card">
                        <span>{ability.toUpperCase()}</span>
                        <strong>{character.abilityScores?.[ability] ?? '--'}</strong>
                        <small>{formatModifier(character.abilityMods?.[ability] ?? 0)}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
