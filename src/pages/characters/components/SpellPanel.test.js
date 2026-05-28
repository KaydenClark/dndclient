import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import SpellPanel from './SpellPanel';

const fireBolt = {
    id: 'fire-bolt',
    name: 'Fire Bolt',
    level: 0,
    school: 'Evocation',
    range: '120 feet',
    duration: 'Instantaneous',
    damageSummary: '2d10 fire',
    attackType: 'Ranged Spell Attack',
    saveType: null
};

const shield = {
    id: 'shield',
    name: 'Shield',
    level: 1,
    school: 'Abjuration',
    range: 'Self',
    duration: '1 round',
    damageSummary: null,
    attackType: null,
    saveType: null
};

const holdPerson = {
    id: 'hold-person',
    name: 'Hold Person',
    level: 2,
    school: 'Enchantment',
    range: '60 feet',
    duration: '1 minute',
    damageSummary: null,
    attackType: null,
    saveType: 'wis',
    spellSaveDC: 15
};

const fullSlots = {
    level_1: { slotTotal: 4, slotsExpended: 1 },
    level_2: { slotTotal: 3, slotsExpended: 0 },
    level_3: { slotTotal: 2, slotsExpended: 2 }
};

describe('SpellPanel - empty states', () => {
    test('shows "No cantrips prepared" when cantrips list is empty', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText(/no cantrips prepared/i)).toBeInTheDocument();
    });

    test('shows "No prepared spells" when preparedSpells is empty', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText(/no prepared spells/i)).toBeInTheDocument();
    });

    test('shows "No known spells" when knownSpells is empty', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText(/no known spells/i)).toBeInTheDocument();
    });
});

describe('SpellPanel - spell cards', () => {
    test('renders cantrip name', () => {
        render(
            <SpellPanel cantrips={[fireBolt]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText('Fire Bolt')).toBeInTheDocument();
    });

    test('renders spell level for a cantrip as Level 0', () => {
        render(
            <SpellPanel cantrips={[fireBolt]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText('Level 0')).toBeInTheDocument();
    });

    test('renders school, range, and duration for a cantrip', () => {
        render(
            <SpellPanel cantrips={[fireBolt]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText(/evocation.*120 feet.*instantaneous/i)).toBeInTheDocument();
    });

    test('renders damage summary when present', () => {
        render(
            <SpellPanel cantrips={[fireBolt]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText(/2d10 fire/i)).toBeInTheDocument();
    });

    test('does not render damage line when damageSummary is null', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[shield]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.queryByText(/effect:/i)).not.toBeInTheDocument();
    });

    test('renders attack type when present', () => {
        render(
            <SpellPanel cantrips={[fireBolt]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByText(/ranged spell attack/i)).toBeInTheDocument();
    });

    test('does not render attack line when attackType is null', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[shield]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.queryByText(/attack:/i)).not.toBeInTheDocument();
    });

    test('renders save type in uppercase with DC when saveType is present', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[holdPerson]} spellSlots={{}} />
        );
        expect(screen.getByText(/save:.*WIS vs DC 15/i)).toBeInTheDocument();
    });

    test('does not render save line when saveType is null', () => {
        render(
            <SpellPanel cantrips={[fireBolt]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.queryByText(/save:/i)).not.toBeInTheDocument();
    });
});

describe('SpellPanel - spell slots', () => {
    test('renders each leveled spell slot row', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={fullSlots} />
        );
        expect(screen.getByText('Level 1')).toBeInTheDocument();
        expect(screen.getByText('Level 2')).toBeInTheDocument();
        expect(screen.getByText('Level 3')).toBeInTheDocument();
    });

    test('shows remaining/total slot count', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={fullSlots} />
        );
        // level_1: 4 total - 1 expended = 3/4
        expect(screen.getByText('3/4')).toBeInTheDocument();
        // level_2: 3 total - 0 expended = 3/3
        expect(screen.getByText('3/3')).toBeInTheDocument();
        // level_3: 2 total - 2 expended = 0/2
        expect(screen.getByText('0/2')).toBeInTheDocument();
    });

    test('does not render a slot row for the cantrips key', () => {
        const slots = { cantrips: ['fire-bolt'], level_1: { slotTotal: 2, slotsExpended: 0 } };
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={slots} />
        );
        // "cantrips" should not appear as a slot row label
        const allItems = screen.queryAllByText(/cantrips/i);
        // It may appear as a heading, but not as a slot list item
        const slotList = document.querySelector('.detail-list');
        if (slotList) {
            const items = slotList.querySelectorAll('li');
            items.forEach((item) => {
                expect(item.textContent).not.toMatch(/cantrips/i);
            });
        }
    });

    test('renders empty Spell Slots panel when spellSlots has no leveled entries', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByRole('heading', { name: /spell slots/i })).toBeInTheDocument();
    });
});

describe('SpellPanel - headings', () => {
    test('renders all section headings', () => {
        render(
            <SpellPanel cantrips={[]} preparedSpells={[]} knownSpells={[]} spellSlots={{}} />
        );
        expect(screen.getByRole('heading', { name: /^cantrips$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /prepared spells/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /known spells/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /spell slots/i })).toBeInTheDocument();
    });
});
