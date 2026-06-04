import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import ExpertiseSelector from './ExpertiseSelector';

describe('ExpertiseSelector', () => {
    test('renders nothing when maxChoices is 0', () => {
        const { container } = render(
            <ExpertiseSelector
                availableSkills={['arcana']}
                selectedSkills={[]}
                maxChoices={0}
                onToggle={vi.fn()}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    test('shows empty state when no proficient skills are available', () => {
        render(
            <ExpertiseSelector
                availableSkills={[]}
                selectedSkills={[]}
                maxChoices={2}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText(/choose skill proficiencies before selecting expertise/i)).toBeInTheDocument();
    });

    test('renders available proficient skills as expertise choices', () => {
        render(
            <ExpertiseSelector
                availableSkills={['perception', 'arcana']}
                selectedSkills={['arcana']}
                maxChoices={2}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText(/expertise \(1\/2 chosen\)/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/arcana/i)).toBeChecked();
        expect(screen.getByLabelText(/perception/i)).not.toBeChecked();
    });

    test('disables unchecked choices when the expertise limit is reached', () => {
        render(
            <ExpertiseSelector
                availableSkills={['arcana', 'history', 'perception']}
                selectedSkills={['arcana', 'history']}
                maxChoices={2}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/perception/i)).toBeDisabled();
        expect(screen.getByLabelText(/arcana/i)).not.toBeDisabled();
    });

    test('clicking a skill calls onToggle with that skill id', () => {
        const onToggle = vi.fn();
        render(
            <ExpertiseSelector
                availableSkills={['arcana']}
                selectedSkills={[]}
                maxChoices={2}
                onToggle={onToggle}
            />
        );

        fireEvent.click(screen.getByLabelText(/arcana/i));
        expect(onToggle).toHaveBeenCalledWith('arcana');
    });
});
