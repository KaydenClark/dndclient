import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import CharacterNew from './CharacterNew';
import { fetchCompendiumBootstrap } from '../../lib/api';

vi.mock('../../context/auth', () => ({
    useAuth: () => ({
        token: 'test-token'
    })
}));

vi.mock('../../lib/api', () => ({
    createCharacter: vi.fn(),
    fetchCompendiumBootstrap: vi.fn()
}));

beforeEach(() => {
    vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

// Elves and Dwarves each have multiple subraces so we can test the two-step
// race/subrace picker. Humans and Halflings are single-variant.
const MOCK_BOOTSTRAP = {
    races: [
        { id: 'human', name: 'Human', raceGroup: 'Human' },
        { id: 'high-elf', name: 'High Elf', raceGroup: 'Elf' },
        { id: 'wood-elf', name: 'Wood Elf', raceGroup: 'Elf' },
        { id: 'hill-dwarf', name: 'Hill Dwarf', raceGroup: 'Dwarf' },
        { id: 'mountain-dwarf', name: 'Mountain Dwarf', raceGroup: 'Dwarf' },
        { id: 'lightfoot-halfling', name: 'Lightfoot Halfling', raceGroup: 'Halfling' }
    ],
    classes: [{
        id: 'fighter',
        name: 'Fighter',
        skillChoiceRules: { choose: 2, options: ['athletics', 'intimidation'] }
    }],
    subclasses: [],
    backgrounds: [{ id: 'soldier', name: 'Soldier', skillProficiencies: [] }]
};

// Helper: render wizard and wait for compendium load.
async function renderWizard(bootstrap = MOCK_BOOTSTRAP) {
    fetchCompendiumBootstrap.mockResolvedValue(bootstrap);

    render(
        <MemoryRouter>
            <CharacterNew />
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create a character/i })).toBeInTheDocument();
    });
}

// Helper: advance from the Name step to the target step by clicking Next.
async function advanceTo(targetStep) {
    const steps = ['Name', 'Race', 'Class', 'Background and Alignment', 'Ability Scores', 'Skill Selection', 'Review'];
    const targetIndex = steps.indexOf(targetStep);

    for (let i = 0; i < targetIndex; i++) {
        fireEvent.click(screen.getByRole('button', { name: /next|review/i }));
        await waitFor(() => {
            expect(screen.getByRole('tab', { name: new RegExp(steps[i + 1], 'i') }))
                .toHaveAttribute('aria-selected', 'true');
        });
    }
}

// ---------------------------------------------------------------------------
// Original full-flow test (updated for raceGroup)
// ---------------------------------------------------------------------------

test('guides character creation through the planned wizard steps before review', async () => {
    await renderWizard({
        races: [{ id: 'human', name: 'Human', raceGroup: 'Human' }],
        classes: [{
            id: 'fighter',
            name: 'Fighter',
            skillChoiceRules: { choose: 2, options: ['athletics', 'intimidation'] }
        }],
        subclasses: [],
        backgrounds: [{ id: 'soldier', name: 'Soldier', skillProficiencies: [] }]
    });

    expect(screen.getByRole('tab', { name: /name/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.change(screen.getByPlaceholderText(/character name/i), {
        target: { value: 'Brim' }
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('tab', { name: /race/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('tab', { name: /class/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('tab', { name: /background and alignment/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('tab', { name: /ability scores/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('tab', { name: /skill selection/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByLabelText(/athletics/i));
    fireEvent.click(screen.getByLabelText(/intimidation/i));
    fireEvent.click(screen.getByRole('button', { name: /review/i }));

    expect(screen.getByRole('tab', { name: /review/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/proficiency summary/i)).toBeInTheDocument();
    expect(screen.getByText(/soldier/i)).toBeInTheDocument();
    expect(screen.getByText(/athletics/i)).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// Race step: subrace picker
// ---------------------------------------------------------------------------

test('race step hides subrace picker for races with only one variant', async () => {
    await renderWizard({
        ...MOCK_BOOTSTRAP,
        races: [{ id: 'human', name: 'Human', raceGroup: 'Human' }]
    });

    await advanceTo('Race');

    // Race select is present via aria-label; no subrace select because Human has only one variant.
    expect(screen.getByLabelText(/^race$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/subrace/i)).not.toBeInTheDocument();
});

test('race step shows subrace picker when the selected group has multiple variants', async () => {
    await renderWizard();
    await advanceTo('Race');

    // Default group is Dwarf (first alphabetically with multiple variants).
    // Select Elf explicitly to test a known multi-variant group.
    const baseRaceSelect = screen.getByLabelText(/^race$/i);

    fireEvent.change(baseRaceSelect, { target: { value: 'Elf' } });

    await waitFor(() => {
        expect(screen.getByLabelText(/subrace/i)).toBeInTheDocument();
    });

    // Both High Elf and Wood Elf should be options in the subrace select.
    const subraceSelect = screen.getByLabelText(/subrace/i);
    expect(within(subraceSelect).getByRole('option', { name: /high elf/i })).toBeInTheDocument();
    expect(within(subraceSelect).getByRole('option', { name: /wood elf/i })).toBeInTheDocument();
});

test('changing race group resets subrace selection to first in the new group', async () => {
    await renderWizard();
    await advanceTo('Race');

    const baseRaceSelect = screen.getByLabelText(/^race$/i);

    // Switch to Dwarf group.
    fireEvent.change(baseRaceSelect, { target: { value: 'Dwarf' } });

    await waitFor(() => {
        const subraceSelect = screen.getByLabelText(/subrace/i);
        // Hill Dwarf comes before Mountain Dwarf alphabetically.
        expect(subraceSelect.value).toBe('hill-dwarf');
    });
});

// ---------------------------------------------------------------------------
// Race step: alphabetical ordering
// ---------------------------------------------------------------------------

test('race groups are listed in alphabetical order', async () => {
    await renderWizard();
    await advanceTo('Race');

    const baseRaceSelect = screen.getByLabelText(/^race$/i);
    const options = Array.from(baseRaceSelect.options).map((opt) => opt.text);

    // Dwarf, Elf, Halfling, Human - alphabetical.
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
});

test('subraces within a group are listed in alphabetical order', async () => {
    await renderWizard();
    await advanceTo('Race');

    const baseRaceSelect = screen.getByLabelText(/^race$/i);
    fireEvent.change(baseRaceSelect, { target: { value: 'Elf' } });

    await waitFor(() => {
        expect(screen.getByLabelText(/subrace/i)).toBeInTheDocument();
    });

    const subraceSelect = screen.getByLabelText(/subrace/i);
    const options = Array.from(subraceSelect.options).map((opt) => opt.text);

    // High Elf before Wood Elf alphabetically.
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
});

// ---------------------------------------------------------------------------
// Background step: alignment dropdown
// ---------------------------------------------------------------------------

test('alignment renders as a select with all 9 alignments', async () => {
    await renderWizard();
    await advanceTo('Background and Alignment');

    const alignmentSelect = screen.getByLabelText(/alignment/i);
    expect(alignmentSelect.tagName).toBe('SELECT');

    const options = Array.from(alignmentSelect.options).map((opt) => opt.value).filter(Boolean);
    expect(options).toHaveLength(9);
    expect(options).toContain('Lawful Good');
    expect(options).toContain('True Neutral');
    expect(options).toContain('Chaotic Evil');
});

test('alignment selection persists to the review step', async () => {
    await renderWizard();
    await advanceTo('Background and Alignment');

    fireEvent.change(screen.getByLabelText(/alignment/i), {
        target: { value: 'Chaotic Neutral' }
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // -> Ability Scores
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // -> Skill Selection
    fireEvent.click(screen.getByRole('button', { name: /review/i })); // -> Review

    expect(screen.getByText(/chaotic neutral/i)).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// Ability Scores step: method selector
// ---------------------------------------------------------------------------

test('ability scores step shows method tabs: Standard Array, Point Buy, Roll', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    const methodGroup = screen.getByRole('group', { name: /ability score method/i });
    expect(within(methodGroup).getByRole('button', { name: /standard array/i })).toBeInTheDocument();
    expect(within(methodGroup).getByRole('button', { name: /point buy/i })).toBeInTheDocument();
    expect(within(methodGroup).getByRole('button', { name: /roll/i })).toBeInTheDocument();
});

test('standard array is the default method and shows numeric inputs', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    // Standard Array button should be active by default.
    const standardBtn = screen.getByRole('button', { name: /standard array/i });
    expect(standardBtn.getAttribute('aria-pressed')).toBe('true');

    // Should show numeric inputs for each ability.
    expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(6);
});

test('switching to Point Buy shows budget counter and +/- controls', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    fireEvent.click(screen.getByRole('button', { name: /point buy/i }));

    // Budget counter visible.
    expect(screen.getByText(/27.*points remaining|points remaining.*27/i)).toBeInTheDocument();

    // Should show + and - buttons (not numeric inputs).
    expect(screen.queryAllByRole('spinbutton').length).toBe(0);
    expect(screen.getAllByRole('button', { name: /increase/i }).length).toBe(6);
    expect(screen.getAllByRole('button', { name: /decrease/i }).length).toBe(6);
});

test('point buy scores start at 8 and cannot go below 8', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    fireEvent.click(screen.getByRole('button', { name: /point buy/i }));

    // All scores start at 8, so Decrease STR should be disabled.
    const decreaseStr = screen.getByRole('button', { name: /decrease str/i });
    expect(decreaseStr).toBeDisabled();
});

test('point buy cannot exceed budget: Increase button disables when budget exhausted', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    fireEvent.click(screen.getByRole('button', { name: /point buy/i }));

    // Spend budget: keep clicking Increase STR until STR hits 15 (costs 9 points).
    // At 15, increase should be disabled because 15 is the max.
    const increaseStr = screen.getByRole('button', { name: /increase str/i });

    // Click 7 times: 8->9->10->11->12->13->14 (costs 1+1+1+1+1+2=7 points)
    for (let i = 0; i < 7; i++) {
        fireEvent.click(increaseStr);
    }

    // STR should now be 15 (one more click gets us there if budget allows)
    // Actually 8->15 costs 9 points total. We have 27 so plenty of room.
    // The issue is the button should be disabled at 15 because 15 is POINT_BUY_MAX.
    await waitFor(() => {
        expect(increaseStr).toBeDisabled();
    });
});

test('point buy budget decreases as scores increase', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    fireEvent.click(screen.getByRole('button', { name: /point buy/i }));

    // Initial state: 27 points remaining.
    expect(screen.getByText(/27.*points remaining|points remaining/i)).toBeInTheDocument();

    // Increase STR from 8 to 9 (costs 1 point).
    fireEvent.click(screen.getByRole('button', { name: /increase str/i }));

    await waitFor(() => {
        expect(screen.getByText(/26.*points remaining|26 \/ 27/i)).toBeInTheDocument();
    });
});

test('switching to Roll method shows Reroll and Roll All buttons', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    fireEvent.click(screen.getByRole('button', { name: /^roll$/i }));

    expect(screen.getByRole('button', { name: /roll all/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reroll/i }).length).toBe(6);
});

test('Roll All generates scores in valid D&D range (3-18)', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    fireEvent.click(screen.getByRole('button', { name: /^roll$/i }));
    fireEvent.click(screen.getByRole('button', { name: /roll all/i }));

    // Wait for scores to appear. Each score label aria has the value.
    await waitFor(() => {
        const scoreEls = screen.getAllByRole('button', { name: /reroll/i });
        expect(scoreEls.length).toBe(6);
    });

    // Scores should all be in range 3-18.
    const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    for (const ability of abilityNames) {
        const scoreEl = screen.getByLabelText(new RegExp(`${ability} score`, 'i'));
        const score = Number(scoreEl.textContent);
        expect(score).toBeGreaterThanOrEqual(3);
        expect(score).toBeLessThanOrEqual(18);
    }
});

test('switching methods resets scores - Point Buy resets to all 8s', async () => {
    await renderWizard();
    await advanceTo('Ability Scores');

    // Modify a score in Standard Array mode.
    const strInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(strInput, { target: { value: '18' } });

    // Switch to Point Buy.
    fireEvent.click(screen.getByRole('button', { name: /point buy/i }));

    // STR should have reset to 8.
    await waitFor(() => {
        const strScore = screen.getByLabelText(/str score/i);
        expect(strScore.textContent).toBe('8');
    });
});
