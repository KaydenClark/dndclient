import React from 'react';

// One spell-card group (cantrips / prepared / known) with an empty state.
function SpellGroup({ title, spells, emptyCopy }) {
    return (
        <div className="detail-panel">
            <h3>{title}</h3>
            {spells.length === 0 ? <p className="status-copy">{emptyCopy}</p> : null}
            {spells.length > 0 ? (
                <div className="spell-list">
                    {spells.map((spell) => (
                        <article key={spell.id} className="spell-card">
                            <div className="spell-card-header">
                                <strong>{spell.name}</strong>
                                <span>Level {spell.level}</span>
                            </div>
                            <p>{spell.school} | {spell.range} | {spell.duration}</p>
                            {spell.damageSummary ? <p>Effect: {spell.damageSummary}</p> : null}
                            {spell.attackType ? <p>Attack: {spell.attackType}</p> : null}
                            {spell.saveType ? <p>Save: {spell.saveType.toUpperCase()} vs DC {spell.spellSaveDC}</p> : null}
                        </article>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

// Spell display: cantrips, prepared, and known lists plus the spell-slot
// tracker. Read-only - spell selection happens in the Level-Up Studio.
export default function SpellPanel({
    cantrips,
    preparedSpells,
    knownSpells,
    spellSlots,
    isSaving = false,
    onSpellSlotChange
}) {
    // Spell-slot levels only - the cantrips key is tracked separately.
    const slotEntries = Object.entries(spellSlots || {}).filter(([key]) => key !== 'cantrips');

    return (
        <>
            <div className="detail-section-grid">
                <SpellGroup title="Cantrips" spells={cantrips} emptyCopy="No cantrips prepared." />
                <SpellGroup title="Prepared Spells" spells={preparedSpells} emptyCopy="No prepared spells." />
            </div>

            <div className="detail-section-grid">
                <SpellGroup title="Known Spells" spells={knownSpells} emptyCopy="No known spells." />

                <div className="detail-panel">
                    <h3>Spell Slots</h3>
                    <ul className="detail-list">
                        {slotEntries.map(([key, slotData]) => {
                            const total = Number(slotData.slotTotal) || 0;
                            const expended = Number(slotData.slotsExpended) || 0;
                            const remaining = Math.max(0, total - expended);
                            const label = `${key.replace('level_', 'Level ')} spell slots`;

                            return (
                                <li key={key} role="group" aria-label={label}>
                                    <span>{key.replace('level_', 'Level ')}</span>
                                    <strong>{remaining}/{total}</strong>
                                    {onSpellSlotChange ? (
                                        <span className="slot-actions">
                                            <button
                                                type="button"
                                                className="secondary-action"
                                                disabled={isSaving || total === 0 || expended >= total}
                                                onClick={() => onSpellSlotChange(key, expended + 1)}
                                            >
                                                Expend
                                            </button>
                                            <button
                                                type="button"
                                                className="secondary-action"
                                                disabled={isSaving || expended === 0}
                                                onClick={() => onSpellSlotChange(key, 0)}
                                            >
                                                Refresh
                                            </button>
                                        </span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
}
