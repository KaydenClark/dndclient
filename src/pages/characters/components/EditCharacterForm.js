import React from 'react';

import { ABILITY_ORDER, CURRENCY_ORDER, formatSlug } from './characterFormatters';
import BackgroundField from './BackgroundField';
import SkillSelector from './SkillSelector';

// Full edit form for the character sheet. All state lives in the page
// component; this component renders editForm and reports every change through
// callbacks. Phase 1 additions: structured background field, class skill
// selection, and weapon proficiency markers in the equipment picker.
export default function EditCharacterForm({
    editForm,
    compendium,
    character,
    subclassOptions,
    armorOptions,
    shieldOptions,
    isSaving,
    onSubmit,
    onCancel,
    onFieldChange,
    onAbilityChange,
    onCurrencyChange,
    onToggleWeapon,
    onClassChange,
    onToggleSkill
}) {
    // The class document drives the available skill choices (skillChoiceRules).
    const selectedClass = compendium.classes.find((classDoc) => classDoc.id === editForm.classId);
    // A weapon is proficient when the derived availableWeaponIds list includes
    // it - that list already accounts for race + class + character overrides.
    const proficientWeaponIds = character.availableWeaponIds || [];

    return (
        <form className="detail-panel character-edit-panel" onSubmit={onSubmit}>
            <div className="section-heading">
                <div>
                    <h3>Edit Character</h3>
                    <p className="status-copy">Update sheet details, then save and apply to refresh derived stats.</p>
                </div>
                <div className="levelup-actions">
                    <button type="button" className="secondary-action" onClick={onCancel} disabled={isSaving}>
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
                    onChange={(event) => onFieldChange('characterName', event.target.value)}
                />
                <select
                    value={editForm.raceId}
                    onChange={(event) => onFieldChange('raceId', event.target.value)}
                >
                    {compendium.races.map((race) => (
                        <option key={race.id} value={race.id}>{race.name}</option>
                    ))}
                </select>
                <select
                    value={editForm.classId}
                    onChange={(event) => onClassChange(event.target.value)}
                >
                    {compendium.classes.map((classDoc) => (
                        <option key={classDoc.id} value={classDoc.id}>{classDoc.name}</option>
                    ))}
                </select>
                <select
                    value={editForm.subclassId}
                    onChange={(event) => onFieldChange('subclassId', event.target.value)}
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
                    onChange={(event) => onFieldChange('level', event.target.value)}
                />
                <BackgroundField
                    backgrounds={compendium.backgrounds}
                    value={editForm.background}
                    onChange={(value) => onFieldChange('background', value)}
                />
                <input
                    type="text"
                    placeholder="Alignment"
                    value={editForm.alignment}
                    onChange={(event) => onFieldChange('alignment', event.target.value)}
                />
                <input
                    type="number"
                    placeholder="Current HP"
                    value={editForm.currentHp}
                    onChange={(event) => onFieldChange('currentHp', event.target.value)}
                />
                <input
                    type="number"
                    placeholder="Temp HP"
                    value={editForm.tempHp}
                    onChange={(event) => onFieldChange('tempHp', event.target.value)}
                />
                <select
                    value={editForm.armorId}
                    onChange={(event) => onFieldChange('armorId', event.target.value)}
                >
                    <option value="">No armor</option>
                    {armorOptions.map((armor) => (
                        <option key={armor.id} value={armor.id}>{armor.name}</option>
                    ))}
                </select>
                <select
                    value={editForm.shieldId}
                    onChange={(event) => onFieldChange('shieldId', event.target.value)}
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
                                onChange={(event) => onAbilityChange(ability, event.target.value)}
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
                                onChange={(event) => onCurrencyChange(type, event.target.value)}
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
                                    onChange={() => onToggleWeapon(weapon.id)}
                                />
                                <span className="spell-selector-copy">
                                    <strong>{weapon.name}</strong>
                                    {/* Phase 1: show whether the character is
                                        proficient with this weapon. */}
                                    <small>
                                        {formatSlug(weapon.category || weapon.weaponType)}
                                        {' - '}
                                        {proficientWeaponIds.includes(weapon.id) ? 'Proficient' : 'Not proficient'}
                                    </small>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Phase 1: class skill proficiency selection. */}
                <SkillSelector
                    skillChoiceRules={selectedClass?.skillChoiceRules}
                    selectedSkills={editForm.skillProficiencies}
                    grantedSkills={character.backgroundSkillProficiencies || []}
                    onToggle={onToggleSkill}
                />

                {['traits', 'ideals', 'bonds', 'flaws', 'backstory'].map((field) => (
                    <textarea
                        key={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={editForm[field]}
                        onChange={(event) => onFieldChange(field, event.target.value)}
                    />
                ))}
            </div>
        </form>
    );
}
