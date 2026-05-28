import React from 'react';

import { SKILL_ABILITIES, formatSkillLabel } from './characterFormatters';

// Phase 1: class skill proficiency picker. Driven by the selected class's
// skillChoiceRules ({ choose, options }) from the compendium. Unchecked
// options lock once the player has picked the allowed number, so the class
// rules are enforced in the UI. Skills the background already grants are
// shown checked and locked so the player does not waste a class pick on them.
export default function SkillSelector({
    skillChoiceRules,
    selectedSkills = [],
    grantedSkills = [],
    onToggle
}) {
    const options = Array.isArray(skillChoiceRules?.options) ? skillChoiceRules.options : [];

    // Empty state: class has no skill choices, or class rules have not loaded
    // (e.g. the compendium bootstrap has not been re-seeded with skillChoiceRules).
    if (options.length === 0) {
        return (
            <div className="weapon-picker">
                <span className="detail-label">Skill Proficiencies</span>
                <p className="status-copy">No skill choices for this class.</p>
            </div>
        );
    }

    const choose = Number(skillChoiceRules.choose) || 0;
    // Only count picks that are actually valid options for this class.
    const chosen = selectedSkills.filter((skill) => options.includes(skill));
    const limitReached = chosen.length >= choose;

    return (
        <div className="weapon-picker">
            <span className="detail-label">
                Skill Proficiencies ({chosen.length}/{choose} chosen)
            </span>
            <div className="spell-selector-list">
                {options.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    const isGranted = grantedSkills.includes(skill);
                    // Lock a checkbox when picking it would exceed the limit,
                    // or when the background already grants it for free.
                    const isDisabled = isGranted || (!isSelected && limitReached);

                    return (
                        <label key={skill} className="spell-selector-card">
                            <input
                                type="checkbox"
                                checked={isSelected || isGranted}
                                disabled={isDisabled}
                                onChange={() => onToggle(skill)}
                            />
                            <span className="spell-selector-copy">
                                <strong>{formatSkillLabel(skill)}</strong>
                                <small>
                                    {isGranted
                                        ? 'Granted by background'
                                        : (SKILL_ABILITIES[skill] || '').toUpperCase()}
                                </small>
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
