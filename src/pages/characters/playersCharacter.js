import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import { fetchCharacterById, fetchCompendiumBootstrap, updateCharacter } from '../../lib/api';
import { clampLevel, sortSpells, unique } from './components/characterFormatters';
import CharacterHeader from './components/CharacterHeader';
import CombatStats from './components/CombatStats';
import AbilityScores from './components/AbilityScores';
import SkillsAndSaves from './components/SkillsAndSaves';
import AttacksPanel from './components/AttacksPanel';
import EquipmentPanel from './components/EquipmentPanel';
import SpellPanel from './components/SpellPanel';
import FeaturesPanel from './components/FeaturesPanel';
import EditCharacterForm from './components/EditCharacterForm';
import LevelUpStudio from './components/LevelUpStudio';

// Builds the level-up planner snapshot from a character document.
function syncPlanner(character) {
    return {
        level: character?.level || 1,
        cantripIds: character?.cantripIds || [],
        knownSpellIds: character?.knownSpellIds || [],
        preparedSpellIds: character?.preparedSpellIds || []
    };
}

// Builds the edit-form snapshot from a character document. skillProficiencies
// holds only the character's own (class) picks - background-granted skills are
// applied by the backend and shown separately.
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
        skillProficiencies: character?.skillProficiencies || [],
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

// Returns a finite number, or undefined for blank input so the API can
// distinguish "not provided" from an explicit value.
function toNumberOrUndefined(value) {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

// Character sheet page. Owns all state (character, compendium, planner,
// editForm, mode). The extracted components under ./components are
// presentational and report changes back through callbacks.
export default function PlayersCharacter() {
    const [character, setCharacter] = useState(null);
    const [compendium, setCompendium] = useState({
        races: [],
        classes: [],
        subclasses: [],
        weapons: [],
        armor: [],
        spells: [],
        backgrounds: []
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
                        spells: bootstrap.spells || [],
                        backgrounds: bootstrap.backgrounds || []
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

    // Spell planner toggles. Known and prepared lists stay consistent: clearing
    // a known spell also unprepares it; preparing a spell adds it to known.
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

    // Phase 1: toggle a class skill proficiency in the edit form.
    function toggleEditSkill(skill) {
        setEditForm((currentForm) => {
            const isSelected = currentForm.skillProficiencies.includes(skill);

            return {
                ...currentForm,
                skillProficiencies: isSelected
                    ? currentForm.skillProficiencies.filter((value) => value !== skill)
                    : [...currentForm.skillProficiencies, skill]
            };
        });
    }

    // Changing class resets the subclass to the first match for the new class.
    function changeEditClass(nextClassId) {
        const nextSubclasses = compendium.subclasses.filter((subclass) => subclass.classId === nextClassId);

        setEditForm((currentForm) => ({
            ...currentForm,
            classId: nextClassId,
            subclassId: nextSubclasses[0]?.id || ''
        }));
    }

    function setPlannerLevel(value) {
        setPlanner((currentPlanner) => ({
            ...currentPlanner,
            level: clampLevel(value)
        }));
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
                skillProficiencies: editForm.skillProficiencies,
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

    // Phase 1: HP quick control. Persists currentHp without opening edit mode.
    async function handleHpChange(nextHp) {
        setIsSaving(true);
        setError('');
        setSaveMessage('');

        try {
            const nextCharacter = await updateCharacter(token, characterId, { currentHp: nextHp });

            setCharacter(nextCharacter);
            setPlanner(syncPlanner(nextCharacter));
            setEditForm(syncEditForm(nextCharacter));
            setSaveMessage('Hit points updated.');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Unable to update hit points.');
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
            <CharacterHeader
                character={character}
                subtitle={subtitle}
                mode={mode}
                isSaving={isSaving}
                saveMessage={saveMessage}
                error={error}
                onEdit={openEditMode}
                onLevelUp={openLevelUpMode}
            />

            <CombatStats
                character={character}
                showHpControls={mode === 'view'}
                onHpChange={handleHpChange}
                isSaving={isSaving}
            />

            {mode === 'edit' ? (
                <EditCharacterForm
                    editForm={editForm}
                    compendium={compendium}
                    character={character}
                    subclassOptions={subclassOptions}
                    armorOptions={armorOptions}
                    shieldOptions={shieldOptions}
                    isSaving={isSaving}
                    onSubmit={handleSaveEdit}
                    onCancel={closeActiveMode}
                    onFieldChange={updateEditField}
                    onAbilityChange={updateAbilityScore}
                    onCurrencyChange={updateCurrency}
                    onToggleWeapon={toggleEquippedWeapon}
                    onClassChange={changeEditClass}
                    onToggleSkill={toggleEditSkill}
                />
            ) : null}

            {mode === 'levelUp' ? (
                <LevelUpStudio
                    planner={planner}
                    character={character}
                    cantripOptions={cantripOptions}
                    leveledSpellOptions={leveledSpellOptions}
                    isSaving={isSaving}
                    onSetLevel={setPlannerLevel}
                    onReset={() => setPlanner(syncPlanner(character))}
                    onCancel={closeActiveMode}
                    onSave={handleSaveLevelUp}
                    onToggleSpell={toggleSelection}
                />
            ) : null}

            <AbilityScores character={character} />

            <SkillsAndSaves character={character} />

            <div className="detail-section-grid">
                <AttacksPanel attacks={attacks} />
                <EquipmentPanel character={character} attacks={attacks} />
            </div>

            <SpellPanel
                cantrips={cantrips}
                preparedSpells={preparedSpells}
                knownSpells={knownSpells}
                spellSlots={character.spellSlots}
            />

            <FeaturesPanel character={character} features={features} />
        </section>
    );
}
