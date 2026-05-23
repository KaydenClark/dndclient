import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

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

function syncEditForm(character) {
    return {
        characterName: character?.characterName || '',
        raceId: character?.raceId || '',
        classId: character?.classId || '',
        subclassId: character?.subclassId || '',
        background: character?.background || '',
        alignment: character?.alignment || '',
        level: character?.level || 1,
        baseAbilityScores: {
            str: character?.baseAbilityScores?.str ?? character?.abilityScores?.str ?? 8,
            dex: character?.baseAbilityScores?.dex ?? character?.abilityScores?.dex ?? 8,
            con: character?.baseAbilityScores?.con ?? character?.abilityScores?.con ?? 8,
            int: character?.baseAbilityScores?.int ?? character?.abilityScores?.int ?? 8,
            wis: character?.baseAbilityScores?.wis ?? character?.abilityScores?.wis ?? 8,
            cha: character?.baseAbilityScores?.cha ?? character?.abilityScores?.cha ?? 8
        },
        currentHp: character?.currentHp ?? '',
        tempHp: character?.tempHp ?? 0,
        armorId: character?.armorId || '',
        shieldId: character?.shieldId || '',
        equippedWeaponIds: character?.equippedWeaponIds || [],
        currency: {
            cp: character?.currency?.cp ?? 0,
            sp: character?.currency?.sp ?? 0,
            ep: character?.currency?.ep ?? 0,
            gp: character?.currency?.gp ?? 0,
            pp: character?.currency?.pp ?? 0
        },
        traits: character?.traits || '',
        ideals: character?.ideals || '',
        bonds: character?.bonds || '',
        flaws: character?.flaws || '',
        backstory: character?.backstory || ''
    };
}

function toNumberOrUndefined(value) {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
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
    const [compendium, setCompendium] = useState({
        races: [],
        classes: [],
        subclasses: [],
        weapons: [],
        armor: [],
        spells: []
    });
    const [planner, setPlanner] = useState(syncPlanner(null));
    const [editForm, setEditForm] = useState(syncEditForm(null));
    const [mode, setMode] = useState('view');
    const [error, setError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { characterId } = useParams();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode');
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
                    setEditForm(syncEditForm(nextCharacter));
                    setMode(initialMode === 'levelUp' ? 'levelUp' : 'view');
                    setCompendium({
                        races: bootstrap.races || [],
                        classes: bootstrap.classes || [],
                        subclasses: bootstrap.subclasses || [],
                        weapons: bootstrap.weapons || [],
                        armor: bootstrap.armor || [],
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
    }, [characterId, initialMode, token]);

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

    function openEditMode() {
        setEditForm(syncEditForm(character));
        setMode('edit');
        setError('');
        setSaveMessage('');
    }

    function openLevelUpMode() {
        setPlanner(syncPlanner(character));
        setMode('levelUp');
        setError('');
        setSaveMessage('');
    }

    function closeActiveMode() {
        setEditForm(syncEditForm(character));
        setPlanner(syncPlanner(character));
        setMode('view');
        setError('');
    }

    function updateEditField(key, value) {
        setEditForm((currentForm) => ({
            ...currentForm,
            [key]: value
        }));
    }

    function updateAbilityScore(ability, value) {
        setEditForm((currentForm) => ({
            ...currentForm,
            baseAbilityScores: {
                ...currentForm.baseAbilityScores,
                [ability]: value
            }
        }));
    }

    function updateCurrency(type, value) {
        setEditForm((currentForm) => ({
            ...currentForm,
            currency: {
                ...currentForm.currency,
                [type]: value
            }
        }));
    }

    function toggleEquippedWeapon(weaponId) {
        setEditForm((currentForm) => {
            const isEquipped = currentForm.equippedWeaponIds.includes(weaponId);

            return {
                ...currentForm,
                equippedWeaponIds: isEquipped
                    ? currentForm.equippedWeaponIds.filter((value) => value !== weaponId)
                    : [...currentForm.equippedWeaponIds, weaponId]
            };
        });
    }

    async function handleSaveEdit(event) {
        event.preventDefault();
        setIsSaving(true);
        setError('');
        setSaveMessage('');

        try {
            const nextCharacter = await updateCharacter(token, characterId, {
                characterName: editForm.characterName,
                raceId: editForm.raceId,
                classId: editForm.classId,
                subclassId: editForm.subclassId || undefined,
                background: editForm.background,
                alignment: editForm.alignment,
                level: clampLevel(editForm.level),
                baseAbilityScores: Object.fromEntries(
                    Object.entries(editForm.baseAbilityScores).map(([ability, value]) => [ability, Number(value) || 0])
                ),
                currentHp: toNumberOrUndefined(editForm.currentHp),
                tempHp: toNumberOrUndefined(editForm.tempHp) || 0,
                armorId: editForm.armorId || null,
                shieldId: editForm.shieldId || null,
                equippedWeaponIds: editForm.equippedWeaponIds,
                currency: Object.fromEntries(
                    Object.entries(editForm.currency).map(([type, value]) => [type, Number(value) || 0])
                ),
                traits: editForm.traits,
                ideals: editForm.ideals,
                bonds: editForm.bonds,
                flaws: editForm.flaws,
                backstory: editForm.backstory
            });

            setCharacter(nextCharacter);
            setPlanner(syncPlanner(nextCharacter));
            setEditForm(syncEditForm(nextCharacter));
            setMode('view');
            setSaveMessage('Character sheet updated.');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Unable to update character.');
        } finally {
            setIsSaving(false);
        }
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
            setEditForm(syncEditForm(nextCharacter));
            setMode('view');
            setSaveMessage('Character sheet updated. Features, spell slots, and derived stats refreshed.');
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
    const subclassOptions = compendium.subclasses.filter((subclass) => subclass.classId === editForm.classId);
    const armorOptions = compendium.armor.filter((armor) => armor.category !== 'shield');
    const shieldOptions = compendium.armor.filter((armor) => armor.category === 'shield');

    return (
        <section className="page-card character-detail-card">
            <div className="section-heading character-sheet-heading">
                <Link to="/characters" className="secondary-action">
                    Back to Characters
                </Link>
                <div className="levelup-actions">
                    <button
                        type="button"
                        className="secondary-action"
                        onClick={openEditMode}
                        disabled={isSaving || mode === 'edit'}
                    >
                        Edit Character
                    </button>
                    <button
                        type="button"
                        className="primary-action"
                        onClick={openLevelUpMode}
                        disabled={isSaving || mode === 'levelUp'}
                    >
                        Level Up
                    </button>
                </div>
            </div>
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

            {mode === 'edit' ? (
                <form className="detail-panel character-edit-panel" onSubmit={handleSaveEdit}>
                    <div className="section-heading">
                        <div>
                            <h3>Edit Character</h3>
                            <p className="status-copy">Update sheet details, then save and apply to refresh derived stats.</p>
                        </div>
                        <div className="levelup-actions">
                            <button type="button" className="secondary-action" onClick={closeActiveMode} disabled={isSaving}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-action" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save and Apply'}
                            </button>
                        </div>
                    </div>

                    <div className="character-create-form character-edit-form">
                        <input
                            type="text"
                            placeholder="Character Name"
                            value={editForm.characterName}
                            onChange={(event) => updateEditField('characterName', event.target.value)}
                        />
                        <select
                            value={editForm.raceId}
                            onChange={(event) => updateEditField('raceId', event.target.value)}
                        >
                            {compendium.races.map((race) => (
                                <option key={race.id} value={race.id}>{race.name}</option>
                            ))}
                        </select>
                        <select
                            value={editForm.classId}
                            onChange={(event) => {
                                const nextClassId = event.target.value;
                                const nextSubclasses = compendium.subclasses.filter((subclass) => subclass.classId === nextClassId);

                                setEditForm((currentForm) => ({
                                    ...currentForm,
                                    classId: nextClassId,
                                    subclassId: nextSubclasses[0]?.id || ''
                                }));
                            }}
                        >
                            {compendium.classes.map((classDoc) => (
                                <option key={classDoc.id} value={classDoc.id}>{classDoc.name}</option>
                            ))}
                        </select>
                        <select
                            value={editForm.subclassId}
                            onChange={(event) => updateEditField('subclassId', event.target.value)}
                        >
                            {subclassOptions.length === 0 ? <option value="">No subclass</option> : null}
                            {subclassOptions.map((subclass) => (
                                <option key={subclass.id} value={subclass.id}>{subclass.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            placeholder="Level"
                            value={editForm.level}
                            onChange={(event) => updateEditField('level', event.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Background"
                            value={editForm.background}
                            onChange={(event) => updateEditField('background', event.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Alignment"
                            value={editForm.alignment}
                            onChange={(event) => updateEditField('alignment', event.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Current HP"
                            value={editForm.currentHp}
                            onChange={(event) => updateEditField('currentHp', event.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Temp HP"
                            value={editForm.tempHp}
                            onChange={(event) => updateEditField('tempHp', event.target.value)}
                        />
                        <select
                            value={editForm.armorId}
                            onChange={(event) => updateEditField('armorId', event.target.value)}
                        >
                            <option value="">No armor</option>
                            {armorOptions.map((armor) => (
                                <option key={armor.id} value={armor.id}>{armor.name}</option>
                            ))}
                        </select>
                        <select
                            value={editForm.shieldId}
                            onChange={(event) => updateEditField('shieldId', event.target.value)}
                        >
                            <option value="">No shield</option>
                            {shieldOptions.map((armor) => (
                                <option key={armor.id} value={armor.id}>{armor.name}</option>
                            ))}
                        </select>

                        <div className="ability-score-grid">
                            {ABILITY_ORDER.map((ability) => (
                                <label key={ability} className="ability-score-field">
                                    <span>{ability.toUpperCase()}</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={editForm.baseAbilityScores[ability]}
                                        onChange={(event) => updateAbilityScore(ability, event.target.value)}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="currency-grid">
                            {CURRENCY_ORDER.map((type) => (
                                <label key={type} className="ability-score-field">
                                    <span>{type.toUpperCase()}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.currency[type]}
                                        onChange={(event) => updateCurrency(type, event.target.value)}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="weapon-picker">
                            <span className="detail-label">Equipped Weapons</span>
                            <div className="spell-selector-list">
                                {compendium.weapons.map((weapon) => (
                                    <label key={weapon.id} className="spell-selector-card">
                                        <input
                                            type="checkbox"
                                            checked={editForm.equippedWeaponIds.includes(weapon.id)}
                                            onChange={() => toggleEquippedWeapon(weapon.id)}
                                        />
                                        <span className="spell-selector-copy">
                                            <strong>{weapon.name}</strong>
                                            <small>{formatSlug(weapon.category || weapon.weaponType)}</small>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {['traits', 'ideals', 'bonds', 'flaws', 'backstory'].map((field) => (
                            <textarea
                                key={field}
                                placeholder={formatSlug(field)}
                                value={editForm[field]}
                                onChange={(event) => updateEditField(field, event.target.value)}
                            />
                        ))}
                    </div>
                </form>
            ) : null}

            {mode === 'levelUp' ? (
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
                            className="secondary-action"
                            onClick={closeActiveMode}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="primary-action"
                            onClick={handleSaveLevelUp}
                            disabled={isSaving}
                        >
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
            ) : null}

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
