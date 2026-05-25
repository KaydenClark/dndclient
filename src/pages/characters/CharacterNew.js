import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import { createCharacter, fetchCompendiumBootstrap } from '../../lib/api';
import { ABILITY_ORDER } from './components/characterFormatters';
import BackgroundField from './components/BackgroundField';
import SkillSelector from './components/SkillSelector';

// Phase 2-friendly default ability spread (standard array) so the form is
// usable immediately without forcing the player to type six numbers.
const initialForm = {
    characterName: '',
    raceId: '',
    classId: '',
    subclassId: '',
    background: '',
    alignment: '',
    level: 1,
    baseAbilityScores: {
        str: 15,
        dex: 14,
        con: 13,
        int: 12,
        wis: 10,
        cha: 8
    },
    // Phase 1: class skill proficiency picks.
    skillProficiencies: []
};

// Fills race/class/subclass with the first valid compendium option once the
// bootstrap data loads, so the selects are never empty.
function syncFormWithCompendium(currentForm, bootstrap) {
    const raceId = currentForm.raceId || bootstrap.races?.[0]?.id || '';
    const classId = currentForm.classId || bootstrap.classes?.[0]?.id || '';
    const matchingSubclasses = (bootstrap.subclasses || []).filter((subclass) => subclass.classId === classId);
    const subclassId = matchingSubclasses.some((subclass) => subclass.id === currentForm.subclassId)
        ? currentForm.subclassId
        : (matchingSubclasses[0]?.id || '');

    return {
        ...currentForm,
        raceId,
        classId,
        subclassId
    };
}

// Dedicated character creation page at /characters/new. Split out of the
// roster list (Phase 0, Milestone 2) so creation has its own route and the
// list page stays a simple roster.
export default function CharacterNew() {
    const [compendium, setCompendium] = useState({
        races: [],
        classes: [],
        subclasses: [],
        backgrounds: []
    });
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;

        async function loadCompendium() {
            setIsLoading(true);
            setError('');

            try {
                const bootstrap = await fetchCompendiumBootstrap();

                if (!ignore) {
                    setCompendium({
                        races: bootstrap.races || [],
                        classes: bootstrap.classes || [],
                        subclasses: bootstrap.subclasses || [],
                        backgrounds: bootstrap.backgrounds || []
                    });
                    setForm((currentForm) => syncFormWithCompendium(currentForm, bootstrap));
                }
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.response?.data?.error || 'Unable to load character options.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCompendium();

        return () => {
            ignore = true;
        };
    }, []);

    const subclassOptions = compendium.subclasses.filter((subclass) => subclass.classId === form.classId);
    const selectedClass = compendium.classes.find((classDoc) => classDoc.id === form.classId);

    function updateField(key, value) {
        setForm((currentForm) => ({ ...currentForm, [key]: value }));
    }

    function updateAbilityScore(ability, value) {
        setForm((currentForm) => ({
            ...currentForm,
            baseAbilityScores: {
                ...currentForm.baseAbilityScores,
                [ability]: value
            }
        }));
    }

    // Changing class resets the subclass and clears skill picks, since skill
    // options are class-specific.
    function changeClass(nextClassId) {
        const nextSubclasses = compendium.subclasses.filter((subclass) => subclass.classId === nextClassId);

        setForm((currentForm) => ({
            ...currentForm,
            classId: nextClassId,
            subclassId: nextSubclasses[0]?.id || '',
            skillProficiencies: []
        }));
    }

    function toggleSkill(skill) {
        setForm((currentForm) => {
            const isSelected = currentForm.skillProficiencies.includes(skill);

            return {
                ...currentForm,
                skillProficiencies: isSelected
                    ? currentForm.skillProficiencies.filter((value) => value !== skill)
                    : [...currentForm.skillProficiencies, skill]
            };
        });
    }

    async function handleCreate(event) {
        event.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const nextCharacter = await createCharacter(token, {
                characterName: form.characterName,
                raceId: form.raceId,
                classId: form.classId,
                subclassId: form.subclassId || undefined,
                background: form.background,
                alignment: form.alignment,
                level: Number(form.level) || 1,
                baseAbilityScores: Object.fromEntries(
                    Object.entries(form.baseAbilityScores).map(([ability, value]) => [ability, Number(value) || 0])
                ),
                skillProficiencies: form.skillProficiencies
            });

            // Hand off to the level-up flow so the player picks spells next.
            navigate(`/characters/${nextCharacter._id}?mode=levelUp`);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Unable to create character.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className="page-card">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">New Character</p>
                    <h1>Create a Character</h1>
                </div>
                <Link to="/characters" className="secondary-action">
                    Back to Characters
                </Link>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {isLoading ? <p className="status-copy">Loading character options...</p> : null}

            {!isLoading ? (
                <form className="character-create-form" onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="Character Name"
                        value={form.characterName}
                        onChange={(event) => updateField('characterName', event.target.value)}
                    />
                    <select
                        value={form.raceId}
                        onChange={(event) => updateField('raceId', event.target.value)}
                    >
                        {compendium.races.map((race) => (
                            <option key={race.id} value={race.id}>{race.name}</option>
                        ))}
                    </select>
                    <select
                        value={form.classId}
                        onChange={(event) => changeClass(event.target.value)}
                    >
                        {compendium.classes.map((classDoc) => (
                            <option key={classDoc.id} value={classDoc.id}>{classDoc.name}</option>
                        ))}
                    </select>
                    <select
                        value={form.subclassId}
                        onChange={(event) => updateField('subclassId', event.target.value)}
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
                        value={form.level}
                        onChange={(event) => updateField('level', event.target.value)}
                    />
                    <BackgroundField
                        backgrounds={compendium.backgrounds}
                        value={form.background}
                        onChange={(value) => updateField('background', value)}
                    />
                    <input
                        type="text"
                        placeholder="Alignment"
                        value={form.alignment}
                        onChange={(event) => updateField('alignment', event.target.value)}
                    />
                    <div className="ability-score-grid">
                        {ABILITY_ORDER.map((ability) => (
                            <label key={ability} className="ability-score-field">
                                <span>{ability.toUpperCase()}</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={form.baseAbilityScores[ability]}
                                    onChange={(event) => updateAbilityScore(ability, event.target.value)}
                                />
                            </label>
                        ))}
                    </div>

                    {/* Phase 1: class skill proficiency selection. */}
                    <SkillSelector
                        skillChoiceRules={selectedClass?.skillChoiceRules}
                        selectedSkills={form.skillProficiencies}
                        onToggle={toggleSkill}
                    />

                    <button type="submit" className="primary-action" disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create Character'}
                    </button>
                </form>
            ) : null}
        </section>
    );
}
