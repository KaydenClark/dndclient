import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import CharactersList from './charactersList';
import PlayersCharacter from './playersCharacter';
import {
    updateCharacter,
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
    fetchCompendiumBootstrap: vi.fn(),
    updateCharacter: vi.fn()
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
    fetchCompendiumBootstrap.mockResolvedValue({
        spells: [
            { id: 'fire-bolt', name: 'Fire Bolt', level: 0 },
            { id: 'shield', name: 'Shield', level: 1 }
        ]
    });
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
        spellcasting: { classId: 'wizard', ability: 'int', kind: 'prepared' },
        availableSpellIds: ['fire-bolt', 'shield'],
        cantripIds: ['fire-bolt'],
        knownSpellIds: ['shield'],
        preparedSpellIds: ['shield'],
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
    expect(screen.getAllByText(/fire bolt/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /save level-up/i })).toBeInTheDocument();
});

test('saves level-up changes through the update character api', async () => {
    fetchCompendiumBootstrap.mockResolvedValue({
        spells: [
            { id: 'fire-bolt', name: 'Fire Bolt', level: 0 },
            { id: 'shield', name: 'Shield', level: 1 },
            { id: 'fireball', name: 'Fireball', level: 3 }
        ]
    });
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
        skillValues: { arcana: 7 },
        savingThrowProficiencies: ['int', 'wis'],
        skillProficiencies: ['arcana'],
        weaponProficiencies: ['dagger'],
        armorProficiencies: [],
        languages: ['Common', 'Elvish'],
        armorId: null,
        shieldId: null,
        spellcasting: { classId: 'wizard', ability: 'int', kind: 'prepared' },
        availableSpellIds: ['fire-bolt', 'shield', 'fireball'],
        cantripIds: ['fire-bolt'],
        knownSpellIds: ['shield'],
        preparedSpellIds: ['shield'],
        attacks: [],
        spellSlots: {
            cantrips: ['fire-bolt'],
            level_1: { slotTotal: 4, slotsExpended: 1 }
        },
        resolvedSpells: { cantrips: [], known: [], prepared: [] },
        features: [{ id: 'sculpt-spells', name: 'Sculpt Spells' }],
        currency: { cp: 0, sp: 0, ep: 0, gp: 73, pp: 0 },
        traits: '',
        ideals: '',
        bonds: '',
        flaws: ''
    });
    updateCharacter.mockResolvedValue({
        _id: 'character-1',
        characterName: 'Lia Stormwarden',
        userName: 'Aria',
        raceName: 'High Elf',
        className: 'Wizard',
        subclassName: 'School of Evocation',
        level: 6,
        background: 'Sage',
        alignment: 'Neutral Good',
        armorClass: 13,
        currentHp: 27,
        maxHp: 27,
        initiative: 3,
        speed: 30,
        passivePerception: 13,
        proficiencyBonus: 3,
        spellSaveDC: 16,
        spellAttackBonus: 8,
        abilityScores: { str: 8, dex: 16, con: 13, int: 19, wis: 12, cha: 10 },
        abilityMods: { str: -1, dex: 3, con: 1, int: 4, wis: 1, cha: 0 },
        savingThrows: { str: -1, dex: 3, con: 1, int: 7, wis: 4, cha: 0 },
        skillValues: { arcana: 7 },
        savingThrowProficiencies: ['int', 'wis'],
        skillProficiencies: ['arcana'],
        weaponProficiencies: ['dagger'],
        armorProficiencies: [],
        languages: ['Common', 'Elvish'],
        armorId: null,
        shieldId: null,
        spellcasting: { classId: 'wizard', ability: 'int', kind: 'prepared' },
        availableSpellIds: ['fire-bolt', 'shield', 'fireball'],
        cantripIds: ['fire-bolt'],
        knownSpellIds: ['shield', 'fireball'],
        preparedSpellIds: ['shield', 'fireball'],
        attacks: [],
        spellSlots: {
            cantrips: ['fire-bolt'],
            level_1: { slotTotal: 4, slotsExpended: 1 },
            level_2: { slotTotal: 3, slotsExpended: 0 },
            level_3: { slotTotal: 3, slotsExpended: 0 }
        },
        resolvedSpells: { cantrips: [], known: [], prepared: [] },
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

    fireEvent.click(screen.getByRole('button', { name: /increase level/i }));

    const knownGroup = screen.getByText(/known spells remain available for preparation/i).closest('.levelup-spell-group');
    const preparedGroup = screen.getByText(/preparing a spell also adds it to known spells if needed/i).closest('.levelup-spell-group');

    fireEvent.click(within(knownGroup).getByLabelText(/fireball/i));
    fireEvent.click(within(preparedGroup).getByLabelText(/fireball/i));
    fireEvent.click(screen.getByRole('button', { name: /save level-up/i }));

    await waitFor(() => {
        expect(updateCharacter).toHaveBeenCalledWith('test-token', 'character-1', {
            level: 6,
            cantripIds: ['fire-bolt'],
            knownSpellIds: ['shield', 'fireball'],
            preparedSpellIds: ['shield', 'fireball']
        });
    });

    expect(screen.getByText(/character updated/i)).toBeInTheDocument();
});
