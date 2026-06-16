import React from 'react';

import { formatModifier, formatRange } from './characterFormatters';

// Equipped-weapon attack cards. Attack bonus, damage string, and the
// proficiency flag are all derived server-side.
export default function AttacksPanel({ attacks }) {
    return (
        <div className="detail-panel">
            <h3>Attacks</h3>
            {attacks.length === 0 ? <p className="status-copy">No equipped weapons.</p> : null}
            {attacks.length > 0 ? (
                <div className="detail-list-card">
                    {attacks.map((attack) => (
                        <article key={attack.weaponId} className="attack-card">
                            <div className="spell-card-header">
                                <strong>{attack.name}</strong>
                                <span>{attack.proficient ? 'Proficient' : 'Not proficient'}</span>
                            </div>
                            <p>Attack bonus: {formatModifier(attack.attackBonus)} using {attack.attackAbility.toUpperCase()}</p>
                            <p>Damage: {attack.damageSummary}</p>
                            {formatRange(attack.range) ? <p>Range: {formatRange(attack.range)}</p> : null}
                        </article>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
