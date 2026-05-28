import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import PlayersCharacter from './playersCharacter';
import {
    fetchCharacterById,
    fetchCompendiumBootstrap,
    updateCharacter
} from '../../lib/api';

vi.mock('../../context/auth', () => ({
    useAuth: () => ({
        token: 'test-token'
    })
}));

vi.mock('../../lib/api', () => ({
    createCharacter: vi.fn(),
    fetchCharacterById: vi.fn(),
    fetchCharacters: vi.fn(),
    fetchCompendiumBootstrap: vi.fn(),
    updateCharacter: vi.fn()
}));

const sheet = {
    _id: 'character-1',
    characterName: 'Lia Stormwarden',
    userName: 'Aria',
    raceName: 'High Elf',
    className: 'Wizard',
    subclassName: 'School of Evocation',
    level: 5,
    background: 'Sage',
    alignment: 'Neutral Good',
    armorClass: 13,
    currentHp: 22,
    maxHp: 22,
    tempHp: 0,
    hitDie: 'd6',
    hitDiceRemaining: 5,
    initiative: 3,
    speed: 30,
    passivePerception: 13,
    proficiencyBonus: 3,
    spellSaveDC: 16,
    spellAttackBonus: 8,
    abilityScores: { str: 8, dex: 16, con: 13, int: 19, wis: 12, cha: 10 },
    abilityMods: { str: -1, dex: 3, con: 1, int: 4, wis: 1, cha: 0 },
    savingThrows: { str: -1, dex: 3, con: 1, int: 7, wis: 4, cha: 0 },
    skillValues: { arcana: 7, perception: 4 },
    savingThrowProficiencies: ['int', 'wis'],
    skillProficiencies: ['arcana'],
    weaponProficiencies: ['dagger'],
    armorProficiencies: [],
    languages: ['Common', 'Elvish'],
    armorId: null,
    shieldId: null,
    spellcasting: { classId: 'wizard', ability: 'int', kind: 'prepared' },
    availableSpellIds: ['fire-bolt', 'shield'],
    cantripIds: ['fire-bolt'],
    knownSpellIds: ['shield'],
    preparedSpellIds: ['shield'],
    attacks: [],
    spellSlots: {
        cantrips: ['fire-bolt'],
        level_1: { slotTotal: 4, slotsExpended: 1 },
        level_2: { slotTotal: 3, slotsExpended: 0 }
    },
    resolvedSpells: {
        cantrips: [{ id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'Evocation', range: '120 feet', duration: 'Instantaneous' }],
        known: [{ id: 'shield', name: 'Shield', level: 1, school: 'Abjuration', range: 'Self', duration: '1 round' }],
        prepared: [{ id: 'shield', name: 'Shield', level: 1, school: 'Abjuration', range: 'Self', duration: '1 round' }]
    },
    features: [],
    conditions: ['poisoned'],
    deathSaves: { successes: 1, failures: 0 },
    inventory: [{ name: 'Torch', quantity: 2 }],
    currency: { cp: 0, sp: 0, ep: 0, gp: 73, pp: 0 },
    traits: '',
    ideals: '',
    bonds: '',
    flaws: ''
};

function renderSheet(character = sheet) {
    fetchCompendiumBootstrap.mockResolvedValue({
        spells: [
            { id: 'fire-bolt', name: 'Fire Bolt', level: 0 },
            { id: 'shield', name: 'Shield', level: 1 }
        ],
        conditions: [
            { id: 'poisoned', name: 'Poisoned', description: 'Disadvantage on attack rolls and ability checks.' },
            { id: 'prone', name: 'Prone', description: 'A prone creature can crawl.' }
        ]
    });
    fetchCharacterById.mockResolvedValue(character);
    updateCharacter.mockResolvedValue(character);

    render(
        <MemoryRouter initialEntries={['/characters/character-1']}>
            <Routes>
                <Route path="/characters/:characterId" element={<PlayersCharacter />} />
            </Routes>
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.resetAllMocks();
});

test('expends and refreshes spell slots directly from the character sheet', async () => {
    renderSheet();

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /lia stormwarden/i })).toBeInTheDocument();
    });

    const levelOneSlots = screen.getByRole('group', { name: /level 1 spell slots/i });
    fireEvent.click(within(levelOneSlots).getByRole('button', { name: /expend/i }));

    await waitFor(() => {
        expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
            spellSlots: expect.objectContaining({
                level_1: { slotTotal: 4, slotsExpended: 2 }
            })
        });
    });

    fireEvent.click(within(levelOneSlots).getByRole('button', { name: /refresh/i }));
    expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
        spellSlots: expect.objectContaining({
            level_1: { slotTotal: 4, slotsExpended: 0 }
        })
    });
});

test('toggles active conditions using the imported conditions compendium', async () => {
    renderSheet();

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /lia stormwarden/i })).toBeInTheDocument();
    });

    const conditions = screen.getByRole('group', { name: /conditions/i });
    expect(within(conditions).getByLabelText(/poisoned/i)).toBeChecked();

    fireEvent.click(within(conditions).getByLabelText(/prone/i));

    await waitFor(() => {
        expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
            conditions: ['poisoned', 'prone']
        });
    });
});

test('tracks death saves without opening the edit form', async () => {
    renderSheet({ ...sheet, currentHp: 0 });

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /lia stormwarden/i })).toBeInTheDocument();
    });

    const deathSaves = screen.getByRole('group', { name: /death saves/i });
    fireEvent.click(within(deathSaves).getByRole('button', { name: /success/i }));

    await waitFor(() => {
        expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
            deathSaves: { successes: 2, failures: 0 }
        });
    });
});

test('spends and restores hit dice from the rest tracker', async () => {
    renderSheet();

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /lia stormwarden/i })).toBeInTheDocument();
    });

    const hitDice = screen.getByRole('group', { name: /hit dice/i });
    expect(within(hitDice).getByText(/5\/5 d6/i)).toBeInTheDocument();

    fireEvent.click(within(hitDice).getByRole('button', { name: /spend/i }));

    await waitFor(() => {
        expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
            hitDiceRemaining: 4
        });
    });
});

test('adds inventory items with quantity from the character sheet', async () => {
    renderSheet();

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /lia stormwarden/i })).toBeInTheDocument();
    });

    const inventory = screen.getByRole('group', { name: /inventory/i });
    expect(within(inventory).getByText(/torch/i)).toBeInTheDocument();

    fireEvent.change(within(inventory).getByLabelText(/item name/i), {
        target: { value: 'Rope' }
    });
    fireEvent.change(within(inventory).getByLabelText(/quantity/i), {
        target: { value: '1' }
    });
    fireEvent.click(within(inventory).getByRole('button', { name: /add item/i }));

    await waitFor(() => {
        expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
            inventory: [
                { name: 'Torch', quantity: 2 },
                { name: 'Rope', quantity: 1 }
            ]
        });
    });
});
