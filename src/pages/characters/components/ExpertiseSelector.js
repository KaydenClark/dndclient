import React from 'react';

import { formatSkillLabel, unique } from './characterFormatters';

export default function ExpertiseSelector({
    availableSkills = [],
    selectedSkills = [],
    maxChoices = 0,
    onToggle
}) {
    const options = unique(availableSkills).sort((left, right) =>
        formatSkillLabel(left).localeCompare(formatSkillLabel(right))
    );
    const selected = selectedSkills.filter((skill) => options.includes(skill));
    const limitReached = selected.length >= maxChoices;

    if (maxChoices <= 0) {
        return null;
    }

    return (
        <div className="weapon-picker">
            <span className="detail-label">
                Expertise ({selected.length}/{maxChoices} chosen)
            </span>
            {options.length === 0 ? (
                <p className="status-copy">Choose skill proficiencies before selecting expertise.</p>
            ) : null}
            {options.length > 0 ? (
                <div className="spell-selector-list">
                    {options.map((skill) => {
                        const isSelected = selected.includes(skill);
                        const isDisabled = !isSelected && limitReached;

                        return (
                            <label key={skill} className="spell-selector-card">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => onToggle(skill)}
                                />
                                <span className="spell-selector-copy">
                                    <strong>{formatSkillLabel(skill)}</strong>
                                    <small>Double proficiency bonus</small>
                                </span>
                            </label>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
