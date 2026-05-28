import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import SkillSelector from './SkillSelector';

const rogueRules = {
    choose: 4,
    options: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'perception', 'stealth']
};

describe('SkillSelector - empty / no-rules state', () => {
    test('shows fallback message when skillChoiceRules is undefined', () => {
        render(
            <SkillSelector
                skillChoiceRules={undefined}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByText(/no skill choices for this class/i)).toBeInTheDocument();
    });

    test('shows fallback message when options array is empty', () => {
        render(
            <SkillSelector
                skillChoiceRules={{ choose: 2, options: [] }}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByText(/no skill choices for this class/i)).toBeInTheDocument();
    });
});

describe('SkillSelector - rendering options', () => {
    test('renders a checkbox for each option', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(rogueRules.options.length);
    });

    test('displays the chosen/total count in the label', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={['acrobatics', 'stealth']}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByText(/2\/4 chosen/i)).toBeInTheDocument();
    });

    test('renders skill labels as human-readable text', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByText('Acrobatics')).toBeInTheDocument();
        expect(screen.getByText('Stealth')).toBeInTheDocument();
    });

    test('shows the driving ability in uppercase for ungranted skills', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        // Acrobatics is driven by DEX
        expect(screen.getAllByText('DEX').length).toBeGreaterThan(0);
    });
});

describe('SkillSelector - selection state', () => {
    test('renders selected skills as checked', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={['stealth']}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        const stealthCheckbox = screen.getByLabelText(/stealth/i);
        expect(stealthCheckbox).toBeChecked();
    });

    test('renders unselected skills as unchecked', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        const acrobaticsCheckbox = screen.getByLabelText(/acrobatics/i);
        expect(acrobaticsCheckbox).not.toBeChecked();
    });

    test('calls onToggle with the skill key when a checkbox is clicked', () => {
        const onToggle = vi.fn();
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={onToggle}
            />
        );
        fireEvent.click(screen.getByLabelText(/perception/i));
        expect(onToggle).toHaveBeenCalledWith('perception');
    });
});

describe('SkillSelector - granted skills (background)', () => {
    test('granted skills are rendered as checked', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={['deception']}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByLabelText(/deception/i)).toBeChecked();
    });

    test('granted skills are disabled', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={['deception']}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByLabelText(/deception/i)).toBeDisabled();
    });

    test('shows "Granted by background" label for granted skills', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={['deception']}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByText(/granted by background/i)).toBeInTheDocument();
    });
});

describe('SkillSelector - limit enforcement', () => {
    test('unchecked options are disabled once the limit is reached', () => {
        // choose: 4, selectedSkills has 4 picks
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={['acrobatics', 'athletics', 'deception', 'insight']}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        // intimidation is not selected and limit is reached - should be disabled
        expect(screen.getByLabelText(/intimidation/i)).toBeDisabled();
    });

    test('already-selected skills remain enabled even at the limit so they can be deselected', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={['acrobatics', 'athletics', 'deception', 'insight']}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        // acrobatics is selected - should not be disabled
        expect(screen.getByLabelText(/acrobatics/i)).not.toBeDisabled();
    });

    test('unchecked options are enabled when the limit is not yet reached', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={['acrobatics']}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByLabelText(/stealth/i)).not.toBeDisabled();
    });

    test('shows 0/N count when no skills are selected', () => {
        render(
            <SkillSelector
                skillChoiceRules={rogueRules}
                selectedSkills={[]}
                grantedSkills={[]}
                onToggle={vi.fn()}
            />
        );
        expect(screen.getByText(/0\/4 chosen/i)).toBeInTheDocument();
    });
});
