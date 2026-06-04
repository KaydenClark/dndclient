import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import SessionToolsPanel from './SessionToolsPanel';

const baseCharacter = {
    conditions: [],
    deathSaves: { successes: 0, failures: 0 },
    level: 3,
    hitDiceRemaining: 2,
    inventory: []
};

function renderPanel(overrides = {}) {
    const props = {
        character: baseCharacter,
        conditions: [
            {
                id: 'stunned',
                name: 'Stunned',
                description: 'A stunned creature is incapacitated.'
            }
        ],
        isSaving: false,
        onToggleCondition: vi.fn(),
        onDeathSaveChange: vi.fn(),
        onHitDiceChange: vi.fn(),
        onInventoryChange: vi.fn(),
        ...overrides
    };

    render(<SessionToolsPanel {...props} />);
    return props;
}

describe('SessionToolsPanel', () => {
    test('exposes condition descriptions without replacing the condition toggle', () => {
        const props = renderPanel();

        expect(screen.getByLabelText('Stunned')).not.toBeChecked();

        const detailIcon = screen.getByLabelText('Condition details');
        expect(detailIcon).toHaveAttribute('data-tooltip', 'A stunned creature is incapacitated.');

        fireEvent.click(detailIcon);

        expect(props.onToggleCondition).not.toHaveBeenCalled();
    });
});
