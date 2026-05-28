import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import LevelUpStudio from './LevelUpStudio';

const baseCharacter = {
    currentHp: 22,
    maxHp: 25,
    proficiencyBonus: 3,
    spellSaveDC: 14,
    spellcasting: { ability: 'int', kind: 'prepared' }
};

const basePlanner = {
    level: 5,
    cantripIds: ['fire-bolt'],
    knownSpellIds: ['shield'],
    preparedSpellIds: ['shield']
};

const cantripOptions = [
    { id: 'fire-bolt', name: 'Fire Bolt', level: 0 },
    { id: 'ray-of-frost', name: 'Ray of Frost', level: 0 }
];

const leveledSpellOptions = [
    { id: 'shield', name: 'Shield', level: 1 },
    { id: 'fireball', name: 'Fireball', level: 3 }
];

function renderStudio(overrides = {}) {
    return render(
        <LevelUpStudio
            planner={basePlanner}
            character={baseCharacter}
            cantripOptions={cantripOptions}
            leveledSpellOptions={leveledSpellOptions}
            isSaving={false}
            onSetLevel={vi.fn()}
            onReset={vi.fn()}
            onCancel={vi.fn()}
            onSave={vi.fn()}
            onToggleSpell={vi.fn()}
            {...overrides}
        />
    );
}

describe('LevelUpStudio - level controls', () => {
    test('renders the Level-Up Studio heading', () => {
        renderStudio();
        expect(screen.getByRole('heading', { name: /level-up studio/i })).toBeInTheDocument();
    });

    test('displays the current level in the number input', () => {
        renderStudio();
        expect(screen.getByLabelText(/character level/i)).toHaveValue(5);
    });

    test('- button calls onSetLevel with level - 1', () => {
        const onSetLevel = vi.fn();
        renderStudio({ onSetLevel });
        fireEvent.click(screen.getByLabelText(/decrease level/i));
        expect(onSetLevel).toHaveBeenCalledWith(4);
    });

    test('+ button calls onSetLevel with level + 1', () => {
        const onSetLevel = vi.fn();
        renderStudio({ onSetLevel });
        fireEvent.click(screen.getByLabelText(/increase level/i));
        expect(onSetLevel).toHaveBeenCalledWith(6);
    });

    test('- button is disabled at level 1', () => {
        renderStudio({ planner: { ...basePlanner, level: 1 } });
        expect(screen.getByLabelText(/decrease level/i)).toBeDisabled();
    });

    test('+ button is disabled at level 20', () => {
        renderStudio({ planner: { ...basePlanner, level: 20 } });
        expect(screen.getByLabelText(/increase level/i)).toBeDisabled();
    });

    test('level input change calls onSetLevel with the new value', () => {
        const onSetLevel = vi.fn();
        renderStudio({ onSetLevel });
        fireEvent.change(screen.getByLabelText(/character level/i), {
            target: { value: '10' }
        });
        expect(onSetLevel).toHaveBeenCalledWith('10');
    });
});

describe('LevelUpStudio - character summary card', () => {
    test('shows current HP / max HP', () => {
        renderStudio();
        expect(screen.getByText(/hp 22\/25/i)).toBeInTheDocument();
    });

    test('shows proficiency bonus', () => {
        renderStudio();
        expect(screen.getByText(/proficiency \+3/i)).toBeInTheDocument();
    });

    test('shows spell save DC', () => {
        renderStudio();
        expect(screen.getByText(/spell dc 14/i)).toBeInTheDocument();
    });

    test('shows -- for spell DC when spellSaveDC is null', () => {
        renderStudio({ character: { ...baseCharacter, spellSaveDC: null } });
        expect(screen.getByText(/spell dc --/i)).toBeInTheDocument();
    });
});

describe('LevelUpStudio - action buttons', () => {
    test('Reset button calls onReset', () => {
        const onReset = vi.fn();
        renderStudio({ onReset });
        fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
        expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('Cancel button calls onCancel', () => {
        const onCancel = vi.fn();
        renderStudio({ onCancel });
        fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    test('Save and Apply button calls onSave', () => {
        const onSave = vi.fn();
        renderStudio({ onSave });
        fireEvent.click(screen.getByRole('button', { name: /save and apply/i }));
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    test('Save button shows "Saving..." while isSaving', () => {
        renderStudio({ isSaving: true });
        expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeInTheDocument();
    });

    test('all action buttons are disabled while isSaving', () => {
        renderStudio({ isSaving: true });
        expect(screen.getByRole('button', { name: /^reset$/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeDisabled();
    });
});

describe('LevelUpStudio - spell selection (spellcasting class)', () => {
    test('renders cantrip selection group', () => {
        renderStudio();
        expect(screen.getByText(/^cantrips$/i)).toBeInTheDocument();
    });

    test('renders known spells selection group', () => {
        renderStudio();
        expect(screen.getByText(/known spells remain available for preparation/i)).toBeInTheDocument();
    });

    test('renders prepared spells selection group', () => {
        renderStudio();
        expect(screen.getByText(/preparing a spell also adds it to known spells if needed/i)).toBeInTheDocument();
    });

    test('cantrip checkboxes reflect the current planner cantripIds', () => {
        renderStudio();
        expect(screen.getByLabelText(/fire bolt/i)).toBeChecked();
        expect(screen.getByLabelText(/ray of frost/i)).not.toBeChecked();
    });

    test('clicking a cantrip checkbox calls onToggleSpell with cantripIds and the spell id', () => {
        const onToggleSpell = vi.fn();
        renderStudio({ onToggleSpell });
        // ray-of-frost is in the cantrip group - click the unchecked one
        fireEvent.click(screen.getAllByLabelText(/ray of frost/i)[0]);
        expect(onToggleSpell).toHaveBeenCalledWith('cantripIds', 'ray-of-frost');
    });

    test('shows "No spells available" when cantripOptions is empty', () => {
        renderStudio({ cantripOptions: [] });
        expect(
            screen.getByText(/no spells available for this list/i)
        ).toBeInTheDocument();
    });

    test('filters long spell lists by name', () => {
        const longSpellList = [
            { id: 'alarm', name: 'Alarm', level: 1 },
            { id: 'burning-hands', name: 'Burning Hands', level: 1 },
            { id: 'charm-person', name: 'Charm Person', level: 1 },
            { id: 'detect-magic', name: 'Detect Magic', level: 1 },
            { id: 'feather-fall', name: 'Feather Fall', level: 1 },
            { id: 'fog-cloud', name: 'Fog Cloud', level: 1 },
            { id: 'grease', name: 'Grease', level: 1 },
            { id: 'identify', name: 'Identify', level: 1 },
            { id: 'shield', name: 'Shield', level: 1 }
        ];

        renderStudio({ leveledSpellOptions: longSpellList });

        fireEvent.change(screen.getByLabelText(/filter known spells/i), {
            target: { value: 'shield' }
        });

        const knownGroup = screen.getByText(/known spells remain available for preparation/i).closest('.levelup-spell-group');

        expect(within(knownGroup).getByLabelText(/shield/i)).toBeInTheDocument();
        expect(within(knownGroup).queryByLabelText(/alarm/i)).not.toBeInTheDocument();
    });
});

describe('LevelUpStudio - subclass unlock notice', () => {
    test('shows notice when planner level is below subclassLevel', () => {
        renderStudio({ planner: { ...basePlanner, level: 2 }, subclassLevel: 3 });
        expect(screen.getByText(/subclass unlocks at level 3/i)).toBeInTheDocument();
    });

    test('notice contains the correct unlock level', () => {
        renderStudio({ planner: { ...basePlanner, level: 1 }, subclassLevel: 2 });
        expect(screen.getByText(/subclass unlocks at level 2/i)).toBeInTheDocument();
    });

    test('no notice when planner level equals subclassLevel', () => {
        renderStudio({ planner: { ...basePlanner, level: 3 }, subclassLevel: 3 });
        expect(screen.queryByText(/subclass unlocks/i)).not.toBeInTheDocument();
    });

    test('no notice when planner level is above subclassLevel', () => {
        renderStudio({ planner: { ...basePlanner, level: 5 }, subclassLevel: 3 });
        expect(screen.queryByText(/subclass unlocks/i)).not.toBeInTheDocument();
    });

    test('no notice when subclassLevel is not provided', () => {
        renderStudio({ planner: { ...basePlanner, level: 1 } });
        expect(screen.queryByText(/subclass unlocks/i)).not.toBeInTheDocument();
    });

    test('no notice when subclassLevel is null', () => {
        renderStudio({ planner: { ...basePlanner, level: 1 }, subclassLevel: null });
        expect(screen.queryByText(/subclass unlocks/i)).not.toBeInTheDocument();
    });
});

describe('LevelUpStudio - non-spellcasting class', () => {
    test('shows "does not use spell selection" message when spellcasting.ability is falsy', () => {
        renderStudio({
            character: { ...baseCharacter, spellcasting: { ability: null } },
            cantripOptions: [],
            leveledSpellOptions: []
        });
        expect(
            screen.getByText(/this class does not use spell selection/i)
        ).toBeInTheDocument();
    });

    test('does not render spell groups when spellcasting is absent', () => {
        renderStudio({
            character: { ...baseCharacter, spellcasting: null },
            cantripOptions: [],
            leveledSpellOptions: []
        });
        expect(screen.queryByText(/known spells remain/i)).not.toBeInTheDocument();
    });
});
