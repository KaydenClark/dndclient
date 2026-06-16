// Shared display helpers and constants for the character sheet components.
// Extracted from playersCharacter.js so every panel formats values identically.
// Pure functions only - no React, no state - safe to import anywhere.

export const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
export const CURRENCY_ORDER = ['cp', 'sp', 'ep', 'gp', 'pp'];

// Maps each of the 18 D&D 5e skills to the ability score that drives it.
// Keys are camelCase to match the backend derivation engine's skill keys.
export const SKILL_ABILITIES = {
    acrobatics: 'dex',
    animalHandling: 'wis',
    arcana: 'int',
    athletics: 'str',
    deception: 'cha',
    history: 'int',
    insight: 'wis',
    intimidation: 'cha',
    investigation: 'int',
    medicine: 'wis',
    nature: 'int',
    perception: 'wis',
    performance: 'cha',
    persuasion: 'cha',
    religion: 'int',
    sleightOfHand: 'dex',
    stealth: 'dex',
    survival: 'wis'
};

// Renders a signed modifier, e.g. 3 -> "+3", -1 -> "-1". Used for attack
// bonuses, saving throws, initiative, and proficiency bonus.
export function formatModifier(value) {
    if (value === null || value === undefined) {
        return '--';
    }

    return value >= 0 ? `+${value}` : `${value}`;
}

// Turns a kebab-case id (e.g. "light-crossbow") into a display label.
export function formatSlug(value) {
    return String(value || '')
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

// Turns a camelCase skill key (e.g. "animalHandling") into a readable
// label ("Animal Handling"). Single-word skills pass through capitalized.
export function formatSkillLabel(skill) {
    const spaced = String(skill || '').replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Weapon range can be a plain string or a { normal, long } object.
export function formatRange(range) {
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

// Levels are clamped to the valid 1-20 D&D range.
export function clampLevel(value) {
    return Math.min(Math.max(Number(value) || 1, 1), 20);
}

// Drops falsy values and de-duplicates - mirrors the backend's unique().
export function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
}

export function collectLevelFeatureIds(levelProgression, level) {
    if (!levelProgression) {
        return [];
    }

    const currentLevel = clampLevel(level);

    return Object.entries(levelProgression)
        .filter(([requiredLevel]) => currentLevel >= Number(requiredLevel))
        .flatMap(([, entry]) => {
            if (Array.isArray(entry)) {
                return entry;
            }

            return entry?.featureIds || [];
        });
}

export function getExpertiseChoiceLimit(featureIds = []) {
    const featureSet = new Set(featureIds || []);
    let limit = 0;

    if (featureSet.has('expertise')) limit += 2;
    if (featureSet.has('bard-expertise')) limit += 2;
    if (featureSet.has('bard-expertise-2')) limit += 2;
    if (featureSet.has('ranger-expertise')) limit += 1;

    return limit;
}

// Sorts spells by level, then alphabetically by name.
export function sortSpells(spells) {
    return [...spells].sort((left, right) => {
        if (left.level !== right.level) {
            return left.level - right.level;
        }

        return left.name.localeCompare(right.name);
    });
}
