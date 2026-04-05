import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import { fetchCharacterById } from '../../lib/api';

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
                            <p>{spell.school} • {spell.range} • {spell.duration}</p>
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
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { characterId } = useParams();
    const { token } = useAuth();

    useEffect(() => {
        let ignore = false;

        async function loadCharacter() {
            setIsLoading(true);
            setError('');

            try {
                const result = await fetchCharacterById(token, characterId);

                if (!ignore) {
                    setCharacter(result);
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

    if (isLoading) {
        return <section className="page-card"><p className="status-copy">Loading character...</p></section>;
    }

    if (error) {
        return <section className="page-card"><p className="form-error">{error}</p></section>;
    }

    if (!character) {
        return <section className="page-card"><p className="status-copy">Character not found.</p></section>;
    }

    const subtitle = [character.raceName, character.className, character.subclassName]
        .filter(Boolean)
        .join(' • ');
    const attacks = character.attacks || [];
    const cantrips = character.resolvedSpells?.cantrips || [];
    const knownSpells = character.resolvedSpells?.known || [];
    const preparedSpells = character.resolvedSpells?.prepared || [];
    const features = character.features || [];

    return (
        <section className="page-card character-detail-card">
            <Link to="/characters" className="secondary-action">
                Back to Characters
            </Link>
            <h1>{character.characterName}</h1>
            <p className="character-subtitle">{subtitle || 'Unassigned adventurer'}</p>
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
