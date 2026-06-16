import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import { createCharacter, fetchCompendiumBootstrap } from '../../lib/api';
import {
    ABILITY_ORDER,
    collectLevelFeatureIds,
    formatSkillLabel,
    getExpertiseChoiceLimit,
    unique
} from './components/characterFormatters';
import BackgroundField from './components/BackgroundField';
import { ALIGNMENTS } from './components/characterConstants';
import ExpertiseSelector from './components/ExpertiseSelector';
import SkillSelector from './components/SkillSelector';

// Wizard step definitions - order matters, index is the step number.
const STEPS = [
    'Name',
    'Race',
    'Class',
    'Background and Alignment',
    'Ability Scores',
    'Skill Selection',
    'Review'
];

// Ability score methods available on the Ability Scores step.
const SCORE_METHODS = {
    STANDARD: 'standard',
    POINT_BUY: 'pointBuy',
    ROLL: 'roll'
};

// Standard array defaults so new characters are immediately playable.
const STANDARD_ARRAY = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };

// Point buy: each score's cost in points. Valid range 8-15.
// PHB table: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9.
const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_BUDGET = 27;
const POINT_BUY_MIN = 8;
const POINT_BUY_MAX = 15;

// Simulate 4d6 drop lowest for a single ability score.
function rollAbility() {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    // Drop the lowest (index 0 after ascending sort), sum the rest.
    return rolls.slice(1).reduce((sum, n) => sum + n, 0);
}

// Derive unique race group names from the races list, sorted alphabetically.
// Each group name maps to one or more specific race variants (subraces).
function getRaceGroups(races) {
    const groups = [...new Set(races.map((r) => r.raceGroup || r.name))];
    return groups.sort((a, b) => a.localeCompare(b));
}

const STEP_NAME = 0;
const STEP_RACE = 1;
const STEP_CLASS = 2;
const STEP_BACKGROUND = 3;
const STEP_ABILITIES = 4;
const STEP_SKILLS = 5;
const STEP_REVIEW = 6;

// Default form state. scoreMethod drives which ability score UI is shown.
const initialForm = {
    characterName: '',
    raceGroupId: '',   // UI-only: drives the base-race -> subrace two-step
    raceId: '',
    classId: '',
    subclassId: '',
    background: '',
    alignment: '',
    level: 1,
    scoreMethod: SCORE_METHODS.STANDARD,
    baseAbilityScores: { ...STANDARD_ARRAY },
    skillProficiencies: [],
    expertiseProficiencies: []
};

// Pre-fills race, class, subclass, and background from the first available
// compendium option so selects are never in an empty/invalid state on load.
// Also pre-selects the first race group and a valid subrace within that group.
function syncFormWithCompendium(currentForm, bootstrap) {
    const sortedRaces = [...(bootstrap.races || [])].sort((a, b) => a.name.localeCompare(b.name));
    const raceGroups = getRaceGroups(sortedRaces);

    // Pick the first race group alphabetically, then pick the first race in that group.
    const raceGroupId = currentForm.raceGroupId || raceGroups[0] || '';
    const racesInGroup = sortedRaces.filter((r) => (r.raceGroup || r.name) === raceGroupId);
    const raceId = currentForm.raceId && racesInGroup.some((r) => r.id === currentForm.raceId)
        ? currentForm.raceId
        : (racesInGroup[0]?.id || '');

    const sortedClasses = [...(bootstrap.classes || [])].sort((a, b) => a.name.localeCompare(b.name));
    const classId = currentForm.classId || sortedClasses[0]?.id || '';

    const matchingSubclasses = (bootstrap.subclasses || []).filter((s) => s.classId === classId);
    const subclassId = matchingSubclasses.some((s) => s.id === currentForm.subclassId)
        ? currentForm.subclassId
        : (matchingSubclasses[0]?.id || '');

    // Pre-select first background so the review step always has a value to show.
    const background = currentForm.background || bootstrap.backgrounds?.[0]?.id || '';

    return { ...currentForm, raceGroupId, raceId, classId, subclassId, background };
}

// Phase 2: guided multi-step character creation wizard.
// Steps: Name -> Race -> Class -> Background + Alignment -> Ability Scores
//         -> Skill Selection -> Review.
// The Review step shows a proficiency summary (background + class skills)
// before the player submits.
export default function CharacterNew() {
    const [step, setStep] = useState(STEP_NAME);
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
                    setForm((prev) => syncFormWithCompendium(prev, bootstrap));
                }
            } catch (loadError) {
                if (!ignore) {
                    setError(loadError.response?.data?.error || 'Unable to load character options.');
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

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateAbilityScore(ability, value) {
        setForm((prev) => ({
            ...prev,
            baseAbilityScores: { ...prev.baseAbilityScores, [ability]: value }
        }));
    }

    // Changing the base race group resets raceId to the first subrace in that group.
    // Clears any prior subrace pick so the UI doesn't hold a stale id.
    function changeRaceGroup(nextGroupId) {
        const racesInNextGroup = sortedRacesForGroup(nextGroupId);
        const nextRaceId = racesInNextGroup[0]?.id || '';
        setForm((prev) => ({ ...prev, raceGroupId: nextGroupId, raceId: nextRaceId }));
    }

    // Changing class resets subclass and clears skill picks since the new
    // class has its own skill choice rules.
    function changeClass(nextClassId) {
        const nextSubclasses = compendium.subclasses.filter((s) => s.classId === nextClassId);

        setForm((prev) => ({
            ...prev,
            classId: nextClassId,
            subclassId: nextSubclasses[0]?.id || '',
            skillProficiencies: [],
            expertiseProficiencies: []
        }));
    }

    function toggleSkill(skill) {
        setForm((prev) => {
            const isSelected = prev.skillProficiencies.includes(skill);
            const skillProficiencies = isSelected
                ? prev.skillProficiencies.filter((s) => s !== skill)
                : [...prev.skillProficiencies, skill];

            return {
                ...prev,
                skillProficiencies,
                expertiseProficiencies: prev.expertiseProficiencies.filter((s) => skillProficiencies.includes(s))
            };
        });
    }

    function toggleExpertise(skill) {
        setForm((prev) => {
            const isSelected = prev.expertiseProficiencies.includes(skill);

            return {
                ...prev,
                expertiseProficiencies: isSelected
                    ? prev.expertiseProficiencies.filter((s) => s !== skill)
                    : [...prev.expertiseProficiencies, skill]
            };
        });
    }

    function getStepError(targetStep = step) {
        if (targetStep === STEP_NAME && !form.characterName.trim()) {
            return 'Character name is required.';
        }

        if (targetStep === STEP_RACE && !form.raceId) {
            return 'Choose a race before continuing.';
        }

        if (targetStep === STEP_CLASS && !form.classId) {
            return 'Choose a class before continuing.';
        }

        return '';
    }

    function goToNextStep() {
        const validationError = getStepError();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setStep((prev) => prev + 1);
    }

    // Point buy: increment/decrement a single score within budget and range.
    function adjustPointBuyScore(ability, delta) {
        setForm((prev) => {
            const currentScore = prev.baseAbilityScores[ability];
            const nextScore = currentScore + delta;

            if (nextScore < POINT_BUY_MIN || nextScore > POINT_BUY_MAX) return prev;

            // Compute spent points with the proposed change applied.
            const nextScores = { ...prev.baseAbilityScores, [ability]: nextScore };
            const spent = Object.values(nextScores).reduce(
                (sum, score) => sum + (POINT_BUY_COSTS[score] ?? 0),
                0
            );

            if (spent > POINT_BUY_BUDGET) return prev; // over budget, reject

            return { ...prev, baseAbilityScores: nextScores };
        });
    }

    // Roll: generate 4d6 drop-lowest for one or all ability scores.
    function rollScore(ability) {
        setForm((prev) => ({
            ...prev,
            baseAbilityScores: { ...prev.baseAbilityScores, [ability]: rollAbility() }
        }));
    }

    function rollAllScores() {
        setForm((prev) => ({
            ...prev,
            baseAbilityScores: Object.fromEntries(
                Object.keys(prev.baseAbilityScores).map((ability) => [ability, rollAbility()])
            )
        }));
    }

    // Switching score method resets scores to appropriate defaults so the
    // budget display and UI are immediately coherent.
    function changeScoreMethod(method) {
        const defaultScores =
            method === SCORE_METHODS.POINT_BUY
                ? { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
                : { ...STANDARD_ARRAY };

        setForm((prev) => ({
            ...prev,
            scoreMethod: method,
            baseAbilityScores: defaultScores
        }));
    }

    async function handleCreate() {
        const stepErrors = [STEP_NAME, STEP_RACE, STEP_CLASS]
            .map((nextStep) => getStepError(nextStep))
            .filter(Boolean);

        if (stepErrors.length > 0) {
            setError(stepErrors[0]);
            return;
        }

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
                    Object.entries(form.baseAbilityScores).map(([k, v]) => [k, Number(v) || 0])
                ),
                skillProficiencies: form.skillProficiencies,
                expertiseProficiencies: form.expertiseProficiencies
            });

            // Drop into level-up mode so the player picks spells immediately.
            navigate(`/characters/${nextCharacter._id}?mode=levelUp`);
        } catch (saveError) {
            setError(saveError.response?.data?.error || 'Unable to create character.');
        } finally {
            setIsSaving(false);
        }
    }

    // Derived values used across multiple step renderers.

    // Helper: races in a given group sorted alphabetically.
    function sortedRacesForGroup(groupId) {
        return [...compendium.races]
            .filter((r) => (r.raceGroup || r.name) === groupId)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    // All unique race group names, sorted alphabetically.
    const raceGroups = getRaceGroups(compendium.races);
    // Races available under the currently selected group.
    const racesInSelectedGroup = sortedRacesForGroup(form.raceGroupId);
    // Show the subrace picker only when a group has more than one variant.
    const groupHasSubraces = racesInSelectedGroup.length > 1;

    const subclassOptions = [...compendium.subclasses.filter((s) => s.classId === form.classId)]
        .sort((a, b) => a.name.localeCompare(b.name));
    const selectedClass = compendium.classes.find((c) => c.id === form.classId);
    const selectedRace = compendium.races.find((r) => r.id === form.raceId);
    const selectedBackground = compendium.backgrounds.find((b) => b.id === form.background);
    const selectedSubclass = subclassOptions.find((s) => s.id === form.subclassId);
    // Background-granted skills lock those slots in the SkillSelector so
    // the player does not waste a class pick on a skill they already have.
    const backgroundGrantedSkills = selectedBackground?.skillProficiencies || [];
    const classFeatureIds = collectLevelFeatureIds(selectedClass?.levelProgression, form.level);
    const expertiseChoiceLimit = getExpertiseChoiceLimit(classFeatureIds);
    const expertiseAvailableSkills = unique([...form.skillProficiencies, ...backgroundGrantedSkills]);

    const isLastContentStep = step === STEP_SKILLS;
    const isReview = step === STEP_REVIEW;

    // Each step renders only its own fields. State stays in the parent so
    // clicking Back never loses earlier answers.
    function renderStep() {
        switch (step) {
            case STEP_NAME:
                return (
                    <div className="wizard-step">
                        <label className="wizard-step-label">Character Name</label>
                        <input
                            type="text"
                            placeholder="Character Name"
                            value={form.characterName}
                            onChange={(event) => updateField('characterName', event.target.value)}
                        />
                    </div>
                );

            case STEP_RACE:
                return (
                    <div className="wizard-step">
                        {/* Base race select - shows unique groups (e.g. Dwarf, Elf, Halfling, Human). */}
                        <label className="wizard-step-label">Race</label>
                        <select
                            aria-label="Race"
                            value={form.raceGroupId}
                            onChange={(event) => changeRaceGroup(event.target.value)}
                        >
                            {raceGroups.map((group) => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>

                        {/* Subrace select - only shown when the group has multiple variants. */}
                        {groupHasSubraces ? (
                            <>
                                <label className="wizard-step-label">Subrace</label>
                                <select
                                    value={form.raceId}
                                    onChange={(event) => updateField('raceId', event.target.value)}
                                    aria-label="Subrace"
                                >
                                    {racesInSelectedGroup.map((race) => (
                                        <option key={race.id} value={race.id}>{race.name}</option>
                                    ))}
                                </select>
                            </>
                        ) : null}
                    </div>
                );

            case STEP_CLASS: {
                // Subclass unlock: hide the subclass picker until the starting level
                // meets the class's subclassLevel threshold (e.g. Fighter=3, Wizard=2, Cleric=1).
                // subclassLevel absent/null means no gate - show the picker if options exist.
                const classSubclassLevel = selectedClass?.subclassLevel ?? null;
                const subclassUnlocked =
                    classSubclassLevel === null || Number(form.level) >= classSubclassLevel;

                return (
                    <div className="wizard-step">
                        <label className="wizard-step-label">Class</label>
                        <select
                            value={form.classId}
                            onChange={(event) => changeClass(event.target.value)}
                        >
                            {[...compendium.classes]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((classDoc) => (
                                    <option key={classDoc.id} value={classDoc.id}>{classDoc.name}</option>
                                ))}
                        </select>
                        <label className="wizard-step-label" htmlFor="wizard-starting-level">Starting Level</label>
                        <input
                            id="wizard-starting-level"
                            type="number"
                            min="1"
                            max="20"
                            value={form.level}
                            aria-label="Starting level"
                            onChange={(event) => updateField('level', event.target.value)}
                        />
                        {subclassOptions.length > 0 && subclassUnlocked ? (
                            <>
                                <label className="wizard-step-label">Subclass</label>
                                <select
                                    aria-label="Subclass"
                                    value={form.subclassId}
                                    onChange={(event) => updateField('subclassId', event.target.value)}
                                >
                                    {subclassOptions.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </>
                        ) : null}
                        {subclassOptions.length > 0 && !subclassUnlocked ? (
                            <p className="status-copy">
                                Subclass picks at level {classSubclassLevel}. Raise starting level to unlock.
                            </p>
                        ) : null}
                    </div>
                );
            }

            case STEP_BACKGROUND:
                return (
                    <div className="wizard-step">
                        <BackgroundField
                            backgrounds={compendium.backgrounds}
                            value={form.background}
                            onChange={(value) => updateField('background', value)}
                        />
                        {/* Alignment: structured select rather than free text so values are consistent. */}
                        <label className="wizard-step-label">Alignment</label>
                        <select
                            value={form.alignment}
                            onChange={(event) => updateField('alignment', event.target.value)}
                            aria-label="Alignment"
                        >
                            <option value="">Select an alignment</option>
                            {ALIGNMENTS.map((alignment) => (
                                <option key={alignment} value={alignment}>{alignment}</option>
                            ))}
                        </select>
                    </div>
                );

            case STEP_ABILITIES: {
                // Point buy: show how many points are spent out of the budget.
                const pointsSpent = Object.values(form.baseAbilityScores).reduce(
                    (sum, score) => sum + (POINT_BUY_COSTS[score] ?? 0),
                    0
                );
                const pointsRemaining = POINT_BUY_BUDGET - pointsSpent;

                return (
                    <div className="wizard-step">
                        {/* Method selector: Standard Array / Point Buy / Roll. */}
                        <div className="wizard-method-tabs" role="group" aria-label="Ability score method">
                            {[
                                { key: SCORE_METHODS.STANDARD, label: 'Standard Array' },
                                { key: SCORE_METHODS.POINT_BUY, label: 'Point Buy' },
                                { key: SCORE_METHODS.ROLL, label: 'Roll' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`wizard-method-tab${form.scoreMethod === key ? ' wizard-method-tab--active' : ''}`}
                                    aria-pressed={form.scoreMethod === key ? 'true' : 'false'}
                                    onClick={() => changeScoreMethod(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Standard Array: free numeric inputs, pre-filled with 15/14/13/12/10/8. */}
                        {form.scoreMethod === SCORE_METHODS.STANDARD && (
                            <>
                                <span className="detail-label">
                                    Standard Array: 15 / 14 / 13 / 12 / 10 / 8 - assign to taste.
                                </span>
                                <div className="ability-score-grid">
                                    {ABILITY_ORDER.map((ability) => (
                                        <label key={ability} className="ability-score-field">
                                            <span>{ability.toUpperCase()}</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={form.baseAbilityScores[ability]}
                                                onChange={(event) =>
                                                    updateAbilityScore(ability, event.target.value)
                                                }
                                            />
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Point Buy: 27 points, scores locked to 8-15, PHB cost table. */}
                        {form.scoreMethod === SCORE_METHODS.POINT_BUY && (
                            <>
                                <span className="detail-label">
                                    Point Buy - {pointsRemaining} / {POINT_BUY_BUDGET} points remaining.
                                    Scores range 8-15.
                                </span>
                                <div className="ability-score-grid">
                                    {ABILITY_ORDER.map((ability) => {
                                        const score = form.baseAbilityScores[ability];
                                        const costToIncrease = POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score];
                                        const canIncrease =
                                            score < POINT_BUY_MAX && pointsRemaining >= costToIncrease;
                                        const canDecrease = score > POINT_BUY_MIN;

                                        return (
                                            <div key={ability} className="ability-score-field">
                                                <span>{ability.toUpperCase()}</span>
                                                <div className="point-buy-controls">
                                                    <button
                                                        type="button"
                                                        aria-label={`Decrease ${ability}`}
                                                        disabled={!canDecrease}
                                                        onClick={() => adjustPointBuyScore(ability, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span aria-label={`${ability} score`}>{score}</span>
                                                    <button
                                                        type="button"
                                                        aria-label={`Increase ${ability}`}
                                                        disabled={!canIncrease}
                                                        onClick={() => adjustPointBuyScore(ability, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <small>Cost: {POINT_BUY_COSTS[score]}</small>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Roll: 4d6 drop lowest per stat, re-rollable individually or all at once. */}
                        {form.scoreMethod === SCORE_METHODS.ROLL && (
                            <>
                                <span className="detail-label">
                                    Roll 4d6 drop lowest per ability. Re-roll any score individually.
                                </span>
                                <button
                                    type="button"
                                    className="secondary-action"
                                    onClick={rollAllScores}
                                >
                                    Roll All
                                </button>
                                <div className="ability-score-grid">
                                    {ABILITY_ORDER.map((ability) => (
                                        <div key={ability} className="ability-score-field">
                                            <span>{ability.toUpperCase()}</span>
                                            <span aria-label={`${ability} score`}>
                                                {form.baseAbilityScores[ability]}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label={`Reroll ${ability}`}
                                                onClick={() => rollScore(ability)}
                                            >
                                                Reroll
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            }

            case STEP_SKILLS:
                return (
                    <>
                        <SkillSelector
                            skillChoiceRules={selectedClass?.skillChoiceRules}
                            selectedSkills={form.skillProficiencies}
                            grantedSkills={backgroundGrantedSkills}
                            onToggle={toggleSkill}
                        />
                        <ExpertiseSelector
                            availableSkills={expertiseAvailableSkills}
                            selectedSkills={form.expertiseProficiencies}
                            maxChoices={expertiseChoiceLimit}
                            onToggle={toggleExpertise}
                        />
                    </>
                );

            case STEP_REVIEW:
                return (
                    <div className="wizard-step">
                        <h4>Review Your Character</h4>
                        <ul className="detail-list">
                            <li><span>Name</span><strong>{form.characterName || '-'}</strong></li>
                            <li><span>Race</span><strong>{selectedRace?.name || '-'}</strong></li>
                            <li>
                                <span>Class</span>
                                <strong>
                                    {selectedClass?.name || '-'}
                                    {selectedSubclass ? ` - ${selectedSubclass.name}` : ''}
                                </strong>
                            </li>
                            <li>
                                <span>Background</span>
                                <strong>{selectedBackground?.name || form.background || '-'}</strong>
                            </li>
                            <li><span>Alignment</span><strong>{form.alignment || '-'}</strong></li>
                            <li><span>Level</span><strong>{form.level}</strong></li>
                        </ul>

                        <h4>Proficiency Summary</h4>
                        <ul className="detail-list">
                            {backgroundGrantedSkills.length > 0 ? (
                                <li>
                                    <span>Background Skills</span>
                                    <strong>
                                        {backgroundGrantedSkills.map(formatSkillLabel).join(', ')}
                                    </strong>
                                </li>
                            ) : null}
                            {form.skillProficiencies.length > 0 ? (
                                <li>
                                    <span>Class Skills</span>
                                    <strong>
                                        {form.skillProficiencies.map(formatSkillLabel).join(', ')}
                                    </strong>
                                </li>
                            ) : null}
                            {form.expertiseProficiencies.length > 0 ? (
                                <li>
                                    <span>Expertise</span>
                                    <strong>
                                        {form.expertiseProficiencies.map(formatSkillLabel).join(', ')}
                                    </strong>
                                </li>
                            ) : null}
                            {form.skillProficiencies.length === 0 && backgroundGrantedSkills.length === 0 ? (
                                <li><span>No skill proficiencies selected yet.</span></li>
                            ) : null}
                        </ul>

                        {error ? <p className="form-error" role="alert">{error}</p> : null}
                    </div>
                );

            default:
                return null;
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

            {error && step !== STEP_REVIEW ? <p className="form-error" role="alert">{error}</p> : null}

            {isLoading ? (
                <p className="status-copy">Loading character options...</p>
            ) : (
                <>
                    {/* Tab bar: all steps visible so the player can see where
                        they are. Clicking a tab allows quick navigation without
                        losing state in any step. */}
                    <div role="tablist" className="wizard-tabs">
                        {STEPS.map((label, index) => (
                            <button
                                key={label}
                                role="tab"
                                type="button"
                                aria-selected={step === index ? 'true' : 'false'}
                                className={`wizard-tab${step === index ? ' wizard-tab--active' : ''}`}
                                onClick={() => setStep(index)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="wizard-step-content">
                        {renderStep()}
                    </div>

                    <div className="wizard-nav">
                        {step > 0 ? (
                            <button
                                type="button"
                                className="secondary-action"
                                onClick={() => setStep((prev) => prev - 1)}
                            >
                                Back
                            </button>
                        ) : null}

                        {isReview ? (
                            <button
                                type="button"
                                className="primary-action"
                                onClick={handleCreate}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Creating...' : 'Create Character'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="primary-action"
                                onClick={goToNextStep}
                            >
                                {isLastContentStep ? 'Review' : 'Next'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
