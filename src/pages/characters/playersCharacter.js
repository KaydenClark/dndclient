import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import { fetchCharacterById, fetchCompendiumBootstrap, updateCharacter } from '../../lib/api';

const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const CURRENCY_ORDER = ['cp', 'sp', 'ep', 'gp', 'pp'];

function formatModifier(value) {
    if (value === null || value === undefined) {
        return '--';
    }

    return value >= 0 ? `+${value}` : `${value}`;
}

function formatSlug(value) {
    return String(value || '')
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatRange(range) {
    if (!range) {
        return null;
    }

    if (typeof range === 'string') {
        return range;
    }

    if (typeof range === 'object' && range.normal) {
        return `${range.normal}/${range.long}`;
    }

    return null;
}

function clampLevel(value) {
    return Math.min(Math.max(Number(value) || 1, 1), 20);
}

function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
}

function sortSpells(spells) {
    return [...spells].sort((left, right) => {
        if (left.level !== right.level) {
            return left.level - right.level;
        }

        return left.name.localeCompare(right.name);
    });
}

function syncPlanner(character) {
    return {
        level: character?.level || 1,
        cantripIds: character?.cantripIds || [],
        knownSpellIds: character?.knownSpellIds || [],
        preparedSpellIds: character?.preparedSpellIds || []
    };
}

function SpellSelectionGroup({ title, description, options, selectedIds, onToggle }) {
    return (
        <div className="levelup-spell-group">
            <div className="levelup-group-header">
                <strong>{title}</strong>
                <span>{description}</span>
            </div>
            {options.length === 0 ? <p className="status-copy">No spells available for this list.</p> : null}
            {options.length > 0 ? (
                <div className="spell-selector-list">
                    {options.map((spell) => (
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

export default function PlayersCharacter() {
    const [character, setCharacter] = useState(null);
    const [compendium, setCompendium] = useState({ spells: [] });
    const [planner, setPlanner] = useState(syncPlanner(null));
    const [error, setError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { characterId } = useParams();
    const { token } = useAuth();

    useEffect(() => {
        let ignore = false;

        async function loadCharacter() {
            setIsLoading(true);
            setError('');
            setSaveMessage('');

            try {
                const [nextCharacter, bootstrap] = await Promise.all([
                    fetchCharacterById(token, characterId),
                    fetchCompendiumBootstrap()
                ]);

                if (!ignore) {
                    setCharacter(nextCharacter);
                    setPlanner(syncPlanner(nextCharacter));
                    setCompendium({
                        spells: bootstrap.spells || []
                    });
                }
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.response?.data?.error || 'Unable to load character.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCharacter();

        return () => {
            ignore = true;
        };
    }, [characterId, token]);

    function toggleSelection(key, spellId) {
        setPlanner((currentPlanner) => {
            const values = currentPlanner[key];
            const isSelected = values.includes(spellId);
            const nextValues = isSelected
                ? values.filter((value) => value !== spellId)
                : [...values, spellId];

            if (key === 'knownSpellIds' && isSelected) {
                return {
                    ...currentPlanner,
                    knownSpellIds: nextValues,
                    preparedSpellIds: currentPlanner.preparedSpellIds.filter((value) => value !== spellId)
                };
            }

            if (key === 'preparedSpellIds' && !isSelected && !currentPlanner.knownSpellIds.includes(spellId)) {
                return {
                    ...currentPlanner,
                    knownSpellIds: [...currentPlanner.knownSpellIds, spellId],
                    preparedSpellIds: [...currentPlanner.preparedSpellIds, spellId]
                };
            }

            return {
                ...currentPlanner,
                [key]: nextValues
            };
        });
    }

    async function handleSaveLevelUp() {
        setIsSaving(true);
        setError('');
        setSaveMessage('');

        try {
            const nextCharacter = await updateCharacter(token, characterId, {
                level: clampLevel(planner.level),
                cantripIds: planner.cantripIds,
                knownSpellIds: planner.knownSpellIds,
                preparedSpellIds: planner.preparedSpellIds
            });

            setCharacter(nextCharacter);
            setPlanner(syncPlanner(nextCharacter));
            setSaveMessage('Character updated. Features, spell slots, and derived stats refreshed.');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Unable to update character.');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <section className="page-card"><p className="status-copy">Loading character...</p></section>;
    }

    if (error && !character) {
        return <section className="page-card"><p className="form-error">{error}</p></section>;
    }

    if (!character) {
        return <section className="page-card"><p className="status-copy">Character not found.</p></section>;
    }

    const subtitle = [character.raceName, character.className, character.subclassName]
        .filter(Boolean)
        .join(' | ');
    const attacks = character.attacks || [];
    const cantrips = character.resolvedSpells?.cantrips || [];
    const knownSpells = character.resolvedSpells?.known || [];
    const preparedSpells = character.resolvedSpells?.prepared || [];
    const features = character.features || [];
    const availableSpellIds = unique([
        ...(character.availableSpellIds || []),
        ...planner.cantripIds,
        ...planner.knownSpellIds,
        ...planner.preparedSpellIds
    ]);
    const availableSpells = sortSpells(
        (compendium.spells || []).filter((spell) => availableSpellIds.includes(spell.id))
    );
    const cantripOptions = availableSpells.filter((spell) => spell.level === 0);
    const leveledSpellOptions = availableSpells.filter((spell) => spell.level > 0);

    return (
        <section className="page-card character-detail-card">
            <Link to="/characters" className="secondary-action">
                Back to Characters
            </Link>
            <h1>{character.characterName}</h1>
            <p className="character-subtitle">{subtitle || 'Unassigned adventurer'}</p>
            {saveMessage ? <p className="form-success">{saveMessage}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <div className="character-detail-grid">
                <div>
                    <span className="detail-label">User</span>
                    <strong>{character.userName || 'Unknown'}</strong>
                </div>
                <div>
                    <span className="detail-label">Class</span>
                    <strong>{character.className || 'Unassigned'}</strong>
                </div>
                <div>
                    <span className="detail-label">Level</span>
                    <strong>{character.level || 1}</strong>
                </div>
                <div>
                    <span className="detail-label">Race</span>
                    <strong>{character.raceName || 'Unknown'}</strong>
                </div>
                <div>
                    <span className="detail-label">Alignment</span>
                    <strong>{character.alignment || 'Unset'}</strong>
                </div>
                <div>
                    <span className="detail-label">Background</span>
                    <strong>{character.background || 'Unset'}</strong>
                </div>
            </div>

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

            <div className="detail-panel levelup-panel">
                <div className="section-heading">
                    <div>
                        <h3>Level-Up Studio</h3>
                        <p className="status-copy">Adjust level, update spell picks, then save to re-derive the sheet.</p>
                    </div>
                    <div className="levelup-actions">
                        <button
                            type="button"
                            className="secondary-action"
                            onClick={() => setPlanner(syncPlanner(character))}
                            disabled={isSaving}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            className="primary-action"
                            onClick={handleSaveLevelUp}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Level-Up'}
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
                                onClick={() => setPlanner((currentPlanner) => ({
                                    ...currentPlanner,
                                    level: clampLevel(currentPlanner.level - 1)
                                }))}
                                disabled={isSaving || planner.level <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={planner.level}
                                onChange={(event) => setPlanner((currentPlanner) => ({
                                    ...currentPlanner,
                                    level: clampLevel(event.target.value)
                                }))}
                                aria-label="Character level"
                            />
                            <button
                                type="button"
                                className="secondary-action"
                                aria-label="Increase level"
                                onClick={() => setPlanner((currentPlanner) => ({
                                    ...currentPlanner,
                                    level: clampLevel(currentPlanner.level + 1)
                                }))}
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
                            onToggle={(spellId) => toggleSelection('cantripIds', spellId)}
                        />
                        <SpellSelectionGroup
                            title="Known Spells"
                            description="Known spells remain available for preparation."
                            options={leveledSpellOptions}
                            selectedIds={planner.knownSpellIds}
                            onToggle={(spellId) => toggleSelection('knownSpellIds', spellId)}
                        />
                        <SpellSelectionGroup
                            title="Prepared Spells"
                            description="Preparing a spell also adds it to known spells if needed."
                            options={leveledSpellOptions}
                            selectedIds={planner.preparedSpellIds}
                            onToggle={(spellId) => toggleSelection('preparedSpellIds', spellId)}
                        />
                    </div>
                ) : (
                    <p className="status-copy">This class does not use spell selection. Save to refresh level-based features and combat stats.</p>
                )}
            </div>

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
                                <span>{formatSlug(skill)}</span>
                                <strong>{formatModifier(bonus)}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="detail-section-grid">
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

                <div className="detail-panel">
                    <h3>Equipment</h3>
                    <ul className="detail-list">
                        <li><span>Armor</span><strong>{character.armorId ? formatSlug(character.armorId) : 'None'}</strong></li>
                        <li><span>Shield</span><strong>{character.shieldId ? formatSlug(character.shieldId) : 'None'}</strong></li>
                        <li><span>Weapons</span><strong>{attacks.length > 0 ? attacks.map((attack) => attack.name).join(', ') : 'None'}</strong></li>
                    </ul>
                </div>
            </div>

            <div className="detail-section-grid">
                <SpellGroup title="Cantrips" spells={cantrips} emptyCopy="No cantrips prepared." />
                <SpellGroup title="Prepared Spells" spells={preparedSpells} emptyCopy="No prepared spells." />
            </div>

            <div className="detail-section-grid">
                <SpellGroup title="Known Spells" spells={knownSpells} emptyCopy="No known spells." />

                <div className="detail-panel">
                    <h3>Features & Proficiencies</h3>
                    <ul className="detail-list">
                        <li><span>Languages</span><strong>{(character.languages || []).join(', ') || 'None'}</strong></li>
                        <li><span>Saving Throws</span><strong>{(character.savingThrowProficiencies || []).map((value) => value.toUpperCase()).join(', ') || 'None'}</strong></li>
                        <li><span>Skills</span><strong>{(character.skillProficiencies || []).map(formatSlug).join(', ') || 'None'}</strong></li>
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
            </div>

            <div className="detail-section-grid">
                <div className="detail-panel">
                    <h3>Spell Slots</h3>
                    <ul className="detail-list">
                        {Object.entries(character.spellSlots || {})
                            .filter(([key]) => key !== 'cantrips')
                            .map(([key, slotData]) => (
                                <li key={key}>
                                    <span>{key.replace('level_', 'Level ')}</span>
                                    <strong>{slotData.slotTotal - slotData.slotsExpended}/{slotData.slotTotal}</strong>
                                </li>
                            ))}
                    </ul>
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
        </section>
    );
}
