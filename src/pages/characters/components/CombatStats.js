import React, { useState } from 'react';

import { formatModifier } from './characterFormatters';

// Combat summary tiles plus the Phase 1 HP quick-control tracker.
// The page owns the character document; HP changes call onHpChange(nextHp)
// and tempHp changes call onTempHpChange(nextTempHp).
// HP controls only show in view mode so they do not collide with the edit form.
export default function CombatStats({ character, showHpControls, onHpChange, onTempHpChange, isSaving }) {
    // Local-only input value for the heal/damage amount. Transient UI state.
    const [amount, setAmount] = useState('1');
    // Local-only input for setting temp HP.
    const [tempHpInput, setTempHpInput] = useState('');

    const maxHp = Number(character.maxHp) || 0;
    const currentHp = Number(character.currentHp) || 0;
    const tempHp = Number(character.tempHp) || 0;
    const step = Math.max(1, Number(amount) || 1);

    // Percentage 0-100 for the HP bar, clamped so it never overflows the bar.
    const hpPercent = maxHp > 0 ? Math.min(100, Math.round((currentHp / maxHp) * 100)) : 0;
    // Bar color: red below 25%, yellow below 50%, green otherwise.
    const hpBarColor = hpPercent < 25 ? 'hp-bar-critical' : hpPercent < 50 ? 'hp-bar-low' : 'hp-bar-ok';

    // Clamp to 0..maxHp so the tracker never shows an impossible value.
    function applyDelta(delta) {
        const nextHp = Math.min(Math.max(currentHp + delta, 0), maxHp);

        if (nextHp !== currentHp) {
            onHpChange(nextHp);
        }
    }

    function applyTempHp() {
        const nextTempHp = Math.max(0, Number(tempHpInput) || 0);
        onTempHpChange(nextTempHp);
        setTempHpInput('');
    }

    return (
        <>
            <div className="summary-stat-grid">
                <div className="summary-stat"><span className="detail-label">Armor Class</span><strong>{character.armorClass}</strong></div>
                <div className="summary-stat">
                    <span className="detail-label">HP</span>
                    <strong>{character.currentHp}/{character.maxHp}</strong>
                    {/* HP bar: visual fill so low-HP state is immediately visible at the table */}
                    <div className="hp-bar-track" role="progressbar" aria-valuenow={currentHp} aria-valuemin={0} aria-valuemax={maxHp} aria-label="Hit points">
                        <div className={`hp-bar-fill ${hpBarColor}`} style={{ width: `${hpPercent}%` }} />
                    </div>
                </div>
                {tempHp > 0 ? (
                    <div className="summary-stat"><span className="detail-label">Temp HP</span><strong>{tempHp}</strong></div>
                ) : null}
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

                    <div className="levelup-level-card">
                        <span className="detail-label">Temp HP</span>
                        <div className="levelup-level-controls">
                            <input
                                type="number"
                                min="0"
                                value={tempHpInput}
                                onChange={(event) => setTempHpInput(event.target.value)}
                                placeholder={String(tempHp)}
                                aria-label="Temporary hit points"
                            />
                            <button
                                type="button"
                                className="secondary-action"
                                onClick={applyTempHp}
                                disabled={isSaving}
                            >
                                Set
                            </button>
                        </div>
                        <small>{tempHp > 0 ? `${tempHp} temp HP active` : 'No temp HP'}</small>
                    </div>
                </div>
            ) : null}
        </>
    );
}
