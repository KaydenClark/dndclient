import React, { useState } from 'react';

import { formatModifier } from './characterFormatters';

// One checkbox group for the spell planner (cantrips / known / prepared).
function SpellSelectionGroup({ title, description, options, selectedIds, onToggle }) {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLowerCase();
    const filteredOptions = normalizedQuery
        ? options.filter((spell) => spell.name.toLowerCase().includes(normalizedQuery))
        : options;

    return (
        <div className="levelup-spell-group">
            <div className="levelup-group-header">
                <strong>{title}</strong>
                <span>{description}</span>
            </div>
            {options.length > 8 ? (
                <input
                    type="search"
                    className="spell-filter-input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Filter ${title.toLowerCase()}`}
                    aria-label={`Filter ${title}`}
                />
            ) : null}
            {options.length === 0 ? <p className="status-copy">No spells available for this list.</p> : null}
            {options.length > 0 && filteredOptions.length === 0 ? (
                <p className="status-copy">No spells match that filter.</p>
            ) : null}
            {options.length > 0 ? (
                <div className="spell-selector-list">
                    {filteredOptions.map((spell) => (
                        <label key={spell.id} className="spell-selector-card">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(spell.id)}
                                onChange={() => onToggle(spell.id)}
                            />
                            <span className="spell-selector-copy">
                                <strong>{spell.name}</strong>
                                <small>{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</small>
                            </span>
                        </label>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

// Level-Up Studio: adjust level 1-20 and update spell picks, then save to
// re-derive the sheet. The planner state lives in the page component; this
// component renders it and reports changes through callbacks.
export default function LevelUpStudio({
    planner,
    character,
    cantripOptions,
    leveledSpellOptions,
    isSaving,
    onSetLevel,
    onReset,
    onCancel,
    onSave,
    onToggleSpell
}) {
    return (
        <div className="detail-panel levelup-panel">
            <div className="section-heading">
                <div>
                    <h3>Level-Up Studio</h3>
                    <p className="status-copy">Adjust level, update spell picks, then save to re-derive the sheet.</p>
                </div>
                <div className="levelup-actions">
                    <button type="button" className="secondary-action" onClick={onReset} disabled={isSaving}>
                        Reset
                    </button>
                    <button type="button" className="secondary-action" onClick={onCancel} disabled={isSaving}>
                        Cancel
                    </button>
                    <button type="button" className="primary-action" onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save and Apply'}
                    </button>
                </div>
            </div>

            <div className="levelup-toolbar">
                <div className="levelup-level-card">
                    <span className="detail-label">Level</span>
                    <div className="levelup-level-controls">
                        <button
                            type="button"
                            className="secondary-action"
                            aria-label="Decrease level"
                            onClick={() => onSetLevel(planner.level - 1)}
                            disabled={isSaving || planner.level <= 1}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={planner.level}
                            onChange={(event) => onSetLevel(event.target.value)}
                            aria-label="Character level"
                        />
                        <button
                            type="button"
                            className="secondary-action"
                            aria-label="Increase level"
                            onClick={() => onSetLevel(planner.level + 1)}
                            disabled={isSaving || planner.level >= 20}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="levelup-summary-card">
                    <span className="detail-label">Current Sheet</span>
                    <strong>HP {character.currentHp}/{character.maxHp}</strong>
                    <small>Proficiency {formatModifier(character.proficiencyBonus)} | Spell DC {character.spellSaveDC ?? '--'}</small>
                </div>
            </div>

            {character.spellcasting?.ability ? (
                <div className="levelup-spell-grid">
                    <SpellSelectionGroup
                        title="Cantrips"
                        description="Choose the cantrips you want on the sheet."
                        options={cantripOptions}
                        selectedIds={planner.cantripIds}
                        onToggle={(spellId) => onToggleSpell('cantripIds', spellId)}
                    />
                    <SpellSelectionGroup
                        title="Known Spells"
                        description="Known spells remain available for preparation."
                        options={leveledSpellOptions}
                        selectedIds={planner.knownSpellIds}
                        onToggle={(spellId) => onToggleSpell('knownSpellIds', spellId)}
                    />
                    <SpellSelectionGroup
                        title="Prepared Spells"
                        description="Preparing a spell also adds it to known spells if needed."
                        options={leveledSpellOptions}
                        selectedIds={planner.preparedSpellIds}
                        onToggle={(spellId) => onToggleSpell('preparedSpellIds', spellId)}
                    />
                </div>
            ) : (
                <p className="status-copy">This class does not use spell selection. Save to refresh level-based features and combat stats.</p>
            )}
        </div>
    );
}
