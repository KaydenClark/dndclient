import React, { useEffect, useState } from 'react';

import CharacterSheet from '../../components/characters/characterSheet';
import { useAuth } from '../../context/auth';
import { createCharacter, fetchCharacters, fetchCompendiumBootstrap } from '../../lib/api';

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
    }
};

function syncFormWithCompendium(currentForm, bootstrap) {
    const raceId = currentForm.raceId || bootstrap.races[0]?.id || '';
    const classId = currentForm.classId || bootstrap.classes[0]?.id || '';
    const matchingSubclasses = bootstrap.subclasses.filter((subclass) => subclass.classId === classId);
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

export default function CharactersList() {
    const [characters, setCharacters] = useState([]);
    const [compendium, setCompendium] = useState({
        races: [],
        classes: [],
        subclasses: []
    });
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { token } = useAuth();

    useEffect(() => {
        let ignore = false;

        async function loadCharacters() {
            setIsLoading(true);
            setError('');

            try {
                const [results, bootstrap] = await Promise.all([
                    fetchCharacters(token),
                    fetchCompendiumBootstrap()
                ]);

                if (!ignore) {
                    setCharacters(results);
                    setCompendium({
                        races: bootstrap.races || [],
                        classes: bootstrap.classes || [],
                        subclasses: bootstrap.subclasses || []
                    });
                    setForm((currentForm) => syncFormWithCompendium(currentForm, bootstrap));
                }
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.response?.data?.error || 'Unable to load character list.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCharacters();

        return () => {
            ignore = true;
        };
    }, [token]);

    const subclassOptions = compendium.subclasses.filter((subclass) => subclass.classId === form.classId);

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
                )
            });

            setCharacters((currentCharacters) => [
                {
                    _id: nextCharacter._id,
                    email: nextCharacter.email,
                    userName: nextCharacter.userName,
                    characterName: nextCharacter.characterName,
                    raceName: nextCharacter.raceName,
                    className: nextCharacter.className,
                    level: nextCharacter.level
                },
                ...currentCharacters
            ]);
            setForm((currentForm) => syncFormWithCompendium(initialForm, compendium));
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
                    <p className="eyebrow">Character Roster</p>
                    <h1>Your Characters</h1>
                </div>
            </div>

            <form className="character-create-form" onSubmit={handleCreate}>
                <input
                    type="text"
                    placeholder="Character Name"
                    value={form.characterName}
                    onChange={(event) => setForm((current) => ({
                        ...current,
                        characterName: event.target.value
                    }))}
                />
                <select
                    value={form.raceId}
                    onChange={(event) => setForm((current) => ({
                        ...current,
                        raceId: event.target.value
                    }))}
                >
                    {compendium.races.map((race) => (
                        <option key={race.id} value={race.id}>
                            {race.name}
                        </option>
                    ))}
                </select>
                <select
                    value={form.classId}
                    onChange={(event) => setForm((current) => {
                        const nextClassId = event.target.value;
                        const nextSubclasses = compendium.subclasses.filter((subclass) => subclass.classId === nextClassId);

                        return {
                            ...current,
                            classId: nextClassId,
                            subclassId: nextSubclasses[0]?.id || ''
                        };
                    })}
                >
                    {compendium.classes.map((classDoc) => (
                        <option key={classDoc.id} value={classDoc.id}>
                            {classDoc.name}
                        </option>
                    ))}
                </select>
                <select
                    value={form.subclassId}
                    onChange={(event) => setForm((current) => ({
                        ...current,
                        subclassId: event.target.value
                    }))}
                >
                    {subclassOptions.length === 0 ? <option value="">No subclass</option> : null}
                    {subclassOptions.map((subclass) => (
                        <option key={subclass.id} value={subclass.id}>
                            {subclass.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Level"
                    value={form.level}
                    onChange={(event) => setForm((current) => ({
                        ...current,
                        level: event.target.value
                    }))}
                />
                <input
                    type="text"
                    placeholder="Background"
                    value={form.background}
                    onChange={(event) => setForm((current) => ({
                        ...current,
                        background: event.target.value
                    }))}
                />
                <input
                    type="text"
                    placeholder="Alignment"
                    value={form.alignment}
                    onChange={(event) => setForm((current) => ({
                        ...current,
                        alignment: event.target.value
                    }))}
                />
                <div className="ability-score-grid">
                    {Object.entries(form.baseAbilityScores).map(([ability, value]) => (
                        <label key={ability} className="ability-score-field">
                            <span>{ability.toUpperCase()}</span>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={value}
                                onChange={(event) => setForm((current) => ({
                                    ...current,
                                    baseAbilityScores: {
                                        ...current.baseAbilityScores,
                                        [ability]: event.target.value
                                    }
                                }))}
                            />
                        </label>
                    ))}
                </div>
                <button type="submit" className="primary-action" disabled={isSaving}>
                    {isSaving ? 'Creating...' : 'Create Character'}
                </button>
            </form>

            {error ? <p className="form-error">{error}</p> : null}
            {isLoading ? <p className="status-copy">Loading characters...</p> : null}
            {!isLoading && characters.length === 0 ? (
                <p className="status-copy">No characters yet. Create your first sheet above.</p>
            ) : null}

            <div className="character-list">
                {characters.map((character) => (
                    <CharacterSheet key={character._id} data={character} />
                ))}
            </div>
        </section>
    );
}
