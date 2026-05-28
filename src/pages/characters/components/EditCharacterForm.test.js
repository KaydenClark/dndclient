import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import EditCharacterForm from './EditCharacterForm';

const compendium = {
    races: [
        { id: 'high-elf', name: 'High Elf' },
        { id: 'human', name: 'Human' }
    ],
    classes: [
        {
            id: 'wizard',
            name: 'Wizard',
            skillChoiceRules: {
                choose: 2,
                options: ['arcana', 'history', 'investigation']
            }
        },
        { id: 'fighter', name: 'Fighter' }
    ],
    subclasses: [
        { id: 'evocation', classId: 'wizard', name: 'School of Evocation' }
    ],
    weapons: [
        { id: 'dagger', name: 'Dagger', category: 'simple-melee', weaponType: 'melee' },
        { id: 'staff', name: 'Quarterstaff', category: 'simple-melee', weaponType: 'melee' }
    ],
    armor: [
        { id: 'leather', name: 'Leather', category: 'light' },
        { id: 'small-shield', name: 'Small Shield', category: 'shield' }
    ],
    spells: [],
    backgrounds: [{ id: 'sage', name: 'Sage' }]
};

const baseEditForm = {
    characterName: 'Lia Stormwarden',
    raceId: 'high-elf',
    classId: 'wizard',
    subclassId: 'evocation',
    background: 'sage',
    alignment: 'Neutral Good',
    level: 5,
    baseAbilityScores: { str: 8, dex: 14, con: 13, int: 18, wis: 12, cha: 10 },
    currentHp: 22,
    tempHp: 0,
    armorId: '',
    shieldId: '',
    equippedWeaponIds: [],
    skillProficiencies: ['arcana'],
    currency: { cp: 0, sp: 0, ep: 0, gp: 73, pp: 0 },
    traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: ''
};

const baseCharacter = {
    availableWeaponIds: ['dagger'],
    backgroundSkillProficiencies: ['perception']
};

function renderForm(overrides = {}) {
    return render(
        <EditCharacterForm
            editForm={baseEditForm}
            compendium={compendium}
            character={baseCharacter}
            subclassOptions={compendium.subclasses.filter((s) => s.classId === 'wizard')}
            armorOptions={compendium.armor.filter((a) => a.category !== 'shield')}
            shieldOptions={compendium.armor.filter((a) => a.category === 'shield')}
            isSaving={false}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            onFieldChange={vi.fn()}
            onAbilityChange={vi.fn()}
            onCurrencyChange={vi.fn()}
            onToggleWeapon={vi.fn()}
            onClassChange={vi.fn()}
            onToggleSkill={vi.fn()}
            {...overrides}
        />
    );
}

describe('EditCharacterForm - layout', () => {
    test('renders Edit Character heading', () => {
        renderForm();
        expect(screen.getByRole('heading', { name: /edit character/i })).toBeInTheDocument();
    });

    test('renders character name input with current value', () => {
        renderForm();
        expect(screen.getByDisplayValue('Lia Stormwarden')).toBeInTheDocument();
    });

    test('renders level input', () => {
        renderForm();
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    test('renders alignment input', () => {
        renderForm();
        expect(screen.getByDisplayValue('Neutral Good')).toBeInTheDocument();
    });

    test('renders all six ability score inputs', () => {
        const { container } = renderForm();
        const abilityLabels = container.querySelectorAll('.ability-score-field');
        // 6 ability scores
        expect(abilityLabels.length).toBeGreaterThanOrEqual(6);
    });

    test('renders all five currency inputs', () => {
        const { container } = renderForm();
        const currencyLabels = container.querySelectorAll('.currency-grid .ability-score-field');
        expect(currencyLabels).toHaveLength(5);
    });
});

describe('EditCharacterForm - callbacks', () => {
    test('Cancel button calls onCancel', () => {
        const onCancel = vi.fn();
        renderForm({ onCancel });
        fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    test('form submission calls onSubmit', () => {
        const onSubmit = vi.fn((e) => e.preventDefault());
        renderForm({ onSubmit });
        fireEvent.submit(screen.getByRole('button', { name: /save and apply/i }).closest('form'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test('character name change calls onFieldChange with the new value', () => {
        const onFieldChange = vi.fn();
        renderForm({ onFieldChange });
        fireEvent.change(screen.getByDisplayValue('Lia Stormwarden'), {
            target: { value: 'Lia the Bold' }
        });
        expect(onFieldChange).toHaveBeenCalledWith('characterName', 'Lia the Bold');
    });

    test('weapon toggle calls onToggleWeapon with the weapon id', () => {
        const onToggleWeapon = vi.fn();
        renderForm({ onToggleWeapon });
        fireEvent.click(screen.getByLabelText(/dagger/i));
        expect(onToggleWeapon).toHaveBeenCalledWith('dagger');
    });

    test('class change calls onClassChange with the new class id', () => {
        const onClassChange = vi.fn();
        renderForm({ onClassChange });
        fireEvent.change(
            screen.getAllByRole('combobox').find(
                (el) => el.querySelector('option[value="wizard"]')
            ),
            { target: { value: 'fighter' } }
        );
        expect(onClassChange).toHaveBeenCalledWith('fighter');
    });
});

describe('EditCharacterForm - saving state', () => {
    test('Save and Apply button shows "Saving..." when isSaving', () => {
        renderForm({ isSaving: true });
        expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeInTheDocument();
    });

    test('Cancel button is disabled when isSaving', () => {
        renderForm({ isSaving: true });
        expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled();
    });

    test('Save button is disabled when isSaving', () => {
        renderForm({ isSaving: true });
        expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeDisabled();
    });
});

describe('EditCharacterForm - weapon proficiency labels', () => {
    test('shows "Proficient" for weapons in availableWeaponIds', () => {
        renderForm();
        const daggerRow = screen.getByLabelText(/dagger/i).closest('label');
        expect(within(daggerRow).getByText(/ - proficient$/i)).toBeInTheDocument();
    });

    test('shows "Not proficient" for weapons not in availableWeaponIds', () => {
        renderForm();
        const staffRow = screen.getByLabelText(/quarterstaff/i).closest('label');
        expect(within(staffRow).getByText(/not proficient$/i)).toBeInTheDocument();
    });
});

describe('EditCharacterForm - background field', () => {
    test('renders a select for background when backgrounds are available', () => {
        renderForm();
        // The Background aria-label select should be present
        expect(screen.getByLabelText(/background/i)).toBeInTheDocument();
    });
});

describe('EditCharacterForm - skill selector', () => {
    test('renders skill selector for the selected class', () => {
        renderForm();
        expect(screen.getByText(/skill proficiencies/i)).toBeInTheDocument();
    });

    test('shows arcana as checked (pre-selected skill)', () => {
        renderForm();
        expect(screen.getByLabelText(/arcana/i)).toBeChecked();
    });
});
