import React, { useState } from 'react';

import { formatModifier } from './characterFormatters';

// Combat summary tiles plus the Phase 1 HP quick-control tracker.
// The page owns the character document; HP changes call onHpChange(nextHp),
// which persists through the API and re-derives the sheet. HP controls only
// show in view mode so they do not collide with the edit form's HP fields.
export default function CombatStats({ character, showHpControls, onHpChange, isSaving }) {
    // Local-only input value for the heal/damage amount. This is transient UI
    // state, not character data, so it stays in the component.
    const [amount, setAmount] = useState('1');

    const maxHp = Number(character.maxHp) || 0;
    const currentHp = Number(character.currentHp) || 0;
    const step = Math.max(1, Number(amount) || 1);

    // Clamp to 0..maxHp so the tracker never shows an impossible value.
    // Death saves are a separate Phase 3 tool.
    function applyDelta(delta) {
        const nextHp = Math.min(Math.max(currentHp + delta, 0), maxHp);

        if (nextHp !== currentHp) {
            onHpChange(nextHp);
        }
    }

    return (
        <>
            <div className="summary-stat-grid">
                <div className="summary-stat"><span className="detail-label">Armor Class</span><strong>{character.armorClass}</strong></div>
                <div className="summary-stat"><span className="detail-label">HP</span><strong>{character.currentHp}/{character.maxHp}</strong></div>
                <div className="summary-stat"><span className="detail-label">Initiative</span><strong>{formatModifier(character.initiative)}</strong></div>
                <div className="summary-stat"><span className="detail-label">Speed</span><strong>{character.speed} ft.</strong></div>
                <div className="summary-stat"><span className="detail-label">Passive Perception</span><strong>{character.passivePerception}</strong></div>
                <div className="summary-stat"><span className="detail-label">Proficiency</span><strong>{formatModifier(character.proficiencyBonus)}</strong></div>
                {character.spellSaveDC ? <div className="summary-stat"><span className="detail-label">Spell Save DC</span><strong>{character.spellSaveDC}</strong></div> : null}
                {character.spellAttackBonus !== null && character.spellAttackBonus !== undefined ? (
                    <div className="summary-stat"><span className="detail-label">Spell Attack</span><strong>{formatModifier(character.spellAttackBonus)}</strong></div>
                ) : null}
            </div>

            {showHpControls ? (
                <div className="levelup-toolbar">
                    <div className="levelup-level-card">
                        <span className="detail-label">Hit Point Tracker</span>
                        <div className="levelup-level-controls">
                            <button
                                type="button"
                                className="secondary-action"
                                onClick={() => applyDelta(-step)}
                                disabled={isSaving || currentHp <= 0}
                            >
                                Damage
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                aria-label="Hit point change amount"
                            />
                            <button
                                type="button"
                                className="secondary-action"
                                onClick={() => applyDelta(step)}
                                disabled={isSaving || currentHp >= maxHp}
                            >
                                Heal
                            </button>
                        </div>
                        <small>{currentHp}/{maxHp} HP{currentHp <= 0 ? ' - unconscious' : ''}</small>
                    </div>
                </div>
            ) : null}
        </>
    );
}
