import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import CharactersList from './charactersList';
import PlayersCharacter from './playersCharacter';
import {
    fetchCharacterById,
    fetchCharacters,
    fetchCompendiumBootstrap
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
    fetchCompendiumBootstrap: vi.fn()
}));

beforeEach(() => {
    vi.resetAllMocks();
});

test('renders compendium-backed character creation controls', async () => {
    fetchCharacters.mockResolvedValue([]);
    fetchCompendiumBootstrap.mockResolvedValue({
        races: [{ id: 'high-elf', name: 'High Elf' }],
        classes: [{ id: 'wizard', name: 'Wizard' }],
        subclasses: [{ id: 'evocation', classId: 'wizard', name: 'School of Evocation' }]
    });

    render(
        <MemoryRouter>
            <CharactersList />
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /create character/i })).toBeInTheDocument();
    });

    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(screen.getByPlaceholderText(/background/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
});

test('renders derived character detail sections', async () => {
    fetchCharacterById.mockResolvedValue({
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
        initiative: 3,
        speed: 30,
        passivePerception: 13,
        proficiencyBonus: 3,
        spellSaveDC: 16,
        spellAttackBonus: 8,
        abilityScores: { str: 8, dex: 16, con: 13, int: 19, wis: 12, cha: 10 },
        abilityMods: { str: -1, dex: 3, con: 1, int: 4, wis: 1, cha: 0 },
        savingThrows: { str: -1, dex: 3, con: 1, int: 7, wis: 4, cha: 0 },
        skillValues: { arcana: 7, history: 7, investigation: 7, insight: 4, perception: 4 },
        savingThrowProficiencies: ['int', 'wis'],
        skillProficiencies: ['arcana', 'history', 'investigation', 'insight', 'perception'],
        weaponProficiencies: ['dagger', 'quarterstaff', 'light-crossbow'],
        armorProficiencies: [],
        languages: ['Common', 'Elvish', 'Draconic'],
        armorId: null,
        shieldId: null,
        attacks: [{
            weaponId: 'light-crossbow',
            name: 'Light Crossbow',
            proficient: true,
            attackAbility: 'dex',
            attackBonus: 6,
            damageSummary: '1d8 + 3 piercing',
            range: '80/320'
        }],
        spellSlots: {
            cantrips: ['fire-bolt'],
            level_1: { slotTotal: 4, slotsExpended: 1 },
            level_2: { slotTotal: 3, slotsExpended: 0 },
            level_3: { slotTotal: 2, slotsExpended: 1 }
        },
        resolvedSpells: {
            cantrips: [{ id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'Evocation', range: '120 feet', duration: 'Instantaneous', damageSummary: '2d10 fire' }],
            known: [{ id: 'fireball', name: 'Fireball', level: 3, school: 'Evocation', range: '150 feet', duration: 'Instantaneous', damageSummary: '8d6 fire (L4: 9d6, L5: 10d6)' }],
            prepared: [{ id: 'shield', name: 'Shield', level: 1, school: 'Abjuration', range: 'Self', duration: '1 round', damageSummary: null }]
        },
        features: [{ id: 'sculpt-spells', name: 'Sculpt Spells' }],
        currency: { cp: 0, sp: 12, ep: 0, gp: 73, pp: 0 },
        traits: '',
        ideals: '',
        bonds: '',
        flaws: ''
    });

    render(
        <MemoryRouter initialEntries={['/characters/character-1']}>
            <Routes>
                <Route path="/characters/:characterId" element={<PlayersCharacter />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /lia stormwarden/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/spell save dc/i)).toBeInTheDocument();
    expect(screen.getAllByText(/light crossbow/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sculpt spells/i)).toBeInTheDocument();
    expect(screen.getByText(/fire bolt/i)).toBeInTheDocument();
});
