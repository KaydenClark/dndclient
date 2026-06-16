// Unit tests for all pure helpers in characterFormatters.js.
// No React, no DOM - these are plain JS function tests.

import { describe, expect, test } from 'vitest';

import {
    ABILITY_ORDER,
    CURRENCY_ORDER,
    SKILL_ABILITIES,
    clampLevel,
    collectLevelFeatureIds,
    formatModifier,
    formatRange,
    formatSkillLabel,
    formatSlug,
    getExpertiseChoiceLimit,
    sortSpells,
    unique
} from './characterFormatters';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('ABILITY_ORDER', () => {
    test('contains all six D&D ability abbreviations in PHB order', () => {
        expect(ABILITY_ORDER).toEqual(['str', 'dex', 'con', 'int', 'wis', 'cha']);
    });

    test('has exactly 6 entries', () => {
        expect(ABILITY_ORDER).toHaveLength(6);
    });
});

describe('CURRENCY_ORDER', () => {
    test('lists all five currency types in ascending value order', () => {
        expect(CURRENCY_ORDER).toEqual(['cp', 'sp', 'ep', 'gp', 'pp']);
    });
});

describe('SKILL_ABILITIES', () => {
    test('contains all 18 D&D 5e skills', () => {
        expect(Object.keys(SKILL_ABILITIES)).toHaveLength(18);
    });

    test('maps DEX-based skills correctly', () => {
        expect(SKILL_ABILITIES.acrobatics).toBe('dex');
        expect(SKILL_ABILITIES.sleightOfHand).toBe('dex');
        expect(SKILL_ABILITIES.stealth).toBe('dex');
    });

    test('maps WIS-based skills correctly', () => {
        expect(SKILL_ABILITIES.animalHandling).toBe('wis');
        expect(SKILL_ABILITIES.insight).toBe('wis');
        expect(SKILL_ABILITIES.medicine).toBe('wis');
        expect(SKILL_ABILITIES.perception).toBe('wis');
        expect(SKILL_ABILITIES.survival).toBe('wis');
    });

    test('maps INT-based skills correctly', () => {
        expect(SKILL_ABILITIES.arcana).toBe('int');
        expect(SKILL_ABILITIES.history).toBe('int');
        expect(SKILL_ABILITIES.investigation).toBe('int');
        expect(SKILL_ABILITIES.nature).toBe('int');
        expect(SKILL_ABILITIES.religion).toBe('int');
    });

    test('maps CHA-based skills correctly', () => {
        expect(SKILL_ABILITIES.deception).toBe('cha');
        expect(SKILL_ABILITIES.intimidation).toBe('cha');
        expect(SKILL_ABILITIES.performance).toBe('cha');
        expect(SKILL_ABILITIES.persuasion).toBe('cha');
    });

    test('maps STR-based skills correctly', () => {
        expect(SKILL_ABILITIES.athletics).toBe('str');
    });
});

// ---------------------------------------------------------------------------
// formatModifier
// ---------------------------------------------------------------------------

describe('formatModifier', () => {
    test('prefixes positive values with a + sign', () => {
        expect(formatModifier(3)).toBe('+3');
    });

    test('prefixes zero with + sign', () => {
        expect(formatModifier(0)).toBe('+0');
    });

    test('negative values keep their minus sign without duplication', () => {
        expect(formatModifier(-1)).toBe('-1');
        expect(formatModifier(-4)).toBe('-4');
    });

    test('returns -- for null', () => {
        expect(formatModifier(null)).toBe('--');
    });

    test('returns -- for undefined', () => {
        expect(formatModifier(undefined)).toBe('--');
    });

    test('handles large positive modifier', () => {
        expect(formatModifier(10)).toBe('+10');
    });

    test('handles large negative modifier', () => {
        expect(formatModifier(-5)).toBe('-5');
    });
});

// ---------------------------------------------------------------------------
// formatSlug
// ---------------------------------------------------------------------------

describe('formatSlug', () => {
    test('capitalises each hyphen-separated word', () => {
        expect(formatSlug('light-crossbow')).toBe('Light Crossbow');
    });

    test('single word is capitalised', () => {
        expect(formatSlug('dagger')).toBe('Dagger');
    });

    test('three-part slug', () => {
        expect(formatSlug('chain-mail-armor')).toBe('Chain Mail Armor');
    });

    test('empty string returns empty string', () => {
        expect(formatSlug('')).toBe('');
    });

    test('null returns empty string', () => {
        expect(formatSlug(null)).toBe('');
    });

    test('undefined returns empty string', () => {
        expect(formatSlug(undefined)).toBe('');
    });

    test('already-capitalised slug passes through correctly', () => {
        expect(formatSlug('Longsword')).toBe('Longsword');
    });
});

// ---------------------------------------------------------------------------
// formatSkillLabel
// ---------------------------------------------------------------------------

describe('formatSkillLabel', () => {
    test('converts camelCase to space-separated with initial cap', () => {
        expect(formatSkillLabel('animalHandling')).toBe('Animal Handling');
    });

    test('converts sleightOfHand correctly', () => {
        expect(formatSkillLabel('sleightOfHand')).toBe('Sleight Of Hand');
    });

    test('single-word skill is capitalised', () => {
        expect(formatSkillLabel('perception')).toBe('Perception');
    });

    test('already-capitalised single word passes through', () => {
        expect(formatSkillLabel('Arcana')).toBe('Arcana');
    });

    test('empty string returns empty string', () => {
        expect(formatSkillLabel('')).toBe('');
    });

    test('null returns empty string', () => {
        expect(formatSkillLabel(null)).toBe('');
    });

    test('undefined returns empty string', () => {
        expect(formatSkillLabel(undefined)).toBe('');
    });
});

// ---------------------------------------------------------------------------
// formatRange
// ---------------------------------------------------------------------------

describe('formatRange', () => {
    test('returns null for null input', () => {
        expect(formatRange(null)).toBeNull();
    });

    test('returns null for undefined input', () => {
        expect(formatRange(undefined)).toBeNull();
    });

    test('returns a plain string as-is', () => {
        expect(formatRange('5 feet')).toBe('5 feet');
        expect(formatRange('80/320')).toBe('80/320');
    });

    test('formats an object range as normal/long', () => {
        expect(formatRange({ normal: 80, long: 320 })).toBe('80/320');
    });

    test('formats an object range with small numbers', () => {
        expect(formatRange({ normal: 5, long: 15 })).toBe('5/15');
    });

    test('returns null for an object without a normal key', () => {
        expect(formatRange({ long: 320 })).toBeNull();
    });

    test('returns null for an empty object', () => {
        expect(formatRange({})).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// clampLevel
// ---------------------------------------------------------------------------

describe('clampLevel', () => {
    test('returns value when in 1-20 range', () => {
        expect(clampLevel(5)).toBe(5);
        expect(clampLevel(1)).toBe(1);
        expect(clampLevel(20)).toBe(20);
    });

    test('clamps values below 1 to 1', () => {
        expect(clampLevel(0)).toBe(1);
        expect(clampLevel(-3)).toBe(1);
    });

    test('clamps values above 20 to 20', () => {
        expect(clampLevel(21)).toBe(20);
        expect(clampLevel(100)).toBe(20);
    });

    test('treats non-numeric values as 1', () => {
        expect(clampLevel(null)).toBe(1);
        expect(clampLevel(undefined)).toBe(1);
        expect(clampLevel('')).toBe(1);
        expect(clampLevel('abc')).toBe(1);
    });

    test('handles numeric strings', () => {
        expect(clampLevel('10')).toBe(10);
        expect(clampLevel('0')).toBe(1);
        expect(clampLevel('25')).toBe(20);
    });
});

// ---------------------------------------------------------------------------
// unique
// ---------------------------------------------------------------------------

describe('unique', () => {
    test('removes duplicate values', () => {
        expect(unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    test('removes falsy values', () => {
        expect(unique(['a', null, '', undefined, false, 'b'])).toEqual(['a', 'b']);
    });

    test('returns empty array for empty input', () => {
        expect(unique([])).toEqual([]);
    });

    test('returns empty array for null input', () => {
        expect(unique(null)).toEqual([]);
    });

    test('returns empty array for undefined input', () => {
        expect(unique(undefined)).toEqual([]);
    });

    test('preserves order of first occurrence', () => {
        expect(unique(['c', 'a', 'b', 'a', 'c'])).toEqual(['c', 'a', 'b']);
    });

    test('does not mutate the input array', () => {
        const input = ['a', 'a', 'b'];
        unique(input);
        expect(input).toEqual(['a', 'a', 'b']);
    });
});

describe('collectLevelFeatureIds', () => {
    test('collects feature ids up to the current level', () => {
        const progression = {
            1: { featureIds: ['expertise'] },
            3: { featureIds: ['roguish-archetype'] },
            5: { featureIds: ['uncanny-dodge'] }
        };

        expect(collectLevelFeatureIds(progression, 3)).toEqual(['expertise', 'roguish-archetype']);
    });

    test('supports array-style progression entries', () => {
        expect(collectLevelFeatureIds({ 1: ['expertise'] }, 1)).toEqual(['expertise']);
    });

    test('returns empty array when progression is missing', () => {
        expect(collectLevelFeatureIds(null, 1)).toEqual([]);
    });
});

describe('getExpertiseChoiceLimit', () => {
    test('returns 2 for Rogue Expertise', () => {
        expect(getExpertiseChoiceLimit(['expertise'])).toBe(2);
    });

    test('adds Bard expertise grants together', () => {
        expect(getExpertiseChoiceLimit(['bard-expertise', 'bard-expertise-2'])).toBe(4);
    });

    test('returns 1 for Ranger expertise', () => {
        expect(getExpertiseChoiceLimit(['ranger-expertise'])).toBe(1);
    });

    test('returns 0 when no expertise feature is present', () => {
        expect(getExpertiseChoiceLimit(['second-wind'])).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// sortSpells
// ---------------------------------------------------------------------------

describe('sortSpells', () => {
    test('sorts lower spell levels before higher ones', () => {
        const spells = [
            { id: '3', name: 'Fireball', level: 3 },
            { id: '1', name: 'Magic Missile', level: 1 },
            { id: '0', name: 'Fire Bolt', level: 0 }
        ];
        const sorted = sortSpells(spells);
        expect(sorted.map((s) => s.level)).toEqual([0, 1, 3]);
    });

    test('sorts same-level spells alphabetically', () => {
        const spells = [
            { id: '1', name: 'Shield', level: 1 },
            { id: '2', name: 'Absorb Elements', level: 1 },
            { id: '3', name: 'Mage Armor', level: 1 }
        ];
        const sorted = sortSpells(spells);
        expect(sorted.map((s) => s.name)).toEqual([
            'Absorb Elements',
            'Mage Armor',
            'Shield'
        ]);
    });

    test('mixed levels and names sort level-first, then alphabetically', () => {
        const spells = [
            { id: 'fb', name: 'Fireball', level: 3 },
            { id: 'sb', name: 'Shield', level: 1 },
            { id: 'ae', name: 'Absorb Elements', level: 1 },
            { id: 'ftb', name: 'Fire Bolt', level: 0 }
        ];
        const sorted = sortSpells(spells);
        expect(sorted.map((s) => s.name)).toEqual([
            'Fire Bolt',
            'Absorb Elements',
            'Shield',
            'Fireball'
        ]);
    });

    test('does not mutate the input array', () => {
        const original = [
            { id: '2', name: 'Shield', level: 1 },
            { id: '1', name: 'Fire Bolt', level: 0 }
        ];
        const copy = [...original];
        sortSpells(original);
        expect(original).toEqual(copy);
    });

    test('returns empty array for empty input', () => {
        expect(sortSpells([])).toEqual([]);
    });

    test('single-element array is returned unchanged', () => {
        const spells = [{ id: '1', name: 'Fireball', level: 3 }];
        expect(sortSpells(spells)).toEqual(spells);
    });
});
