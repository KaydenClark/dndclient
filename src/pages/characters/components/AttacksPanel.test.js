import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import AttacksPanel from './AttacksPanel';

const dagger = {
    weaponId: 'dagger',
    name: 'Dagger',
    proficient: true,
    attackAbility: 'dex',
    attackBonus: 5,
    damageSummary: '1d4 + 3 piercing',
    range: { normal: 20, long: 60 }
};

const crossbow = {
    weaponId: 'light-crossbow',
    name: 'Light Crossbow',
    proficient: false,
    attackAbility: 'dex',
    attackBonus: 2,
    damageSummary: '1d8 + 0 piercing',
    range: '80/320'
};

const greataxe = {
    weaponId: 'greataxe',
    name: 'Greataxe',
    proficient: true,
    attackAbility: 'str',
    attackBonus: 6,
    damageSummary: '1d12 + 4 slashing',
    range: null
};

describe('AttacksPanel', () => {
    test('shows empty-state copy when there are no attacks', () => {
        render(<AttacksPanel attacks={[]} />);
        expect(screen.getByText(/no equipped weapons/i)).toBeInTheDocument();
    });

    test('does not show empty-state copy when there are attacks', () => {
        render(<AttacksPanel attacks={[dagger]} />);
        expect(screen.queryByText(/no equipped weapons/i)).not.toBeInTheDocument();
    });

    test('renders weapon name for each attack', () => {
        render(<AttacksPanel attacks={[dagger, crossbow]} />);
        expect(screen.getByText('Dagger')).toBeInTheDocument();
        expect(screen.getByText('Light Crossbow')).toBeInTheDocument();
    });

    test('shows "Proficient" label when attack is proficient', () => {
        render(<AttacksPanel attacks={[dagger]} />);
        expect(screen.getByText('Proficient')).toBeInTheDocument();
    });

    test('shows "Not proficient" label when attack is not proficient', () => {
        render(<AttacksPanel attacks={[crossbow]} />);
        expect(screen.getByText('Not proficient')).toBeInTheDocument();
    });

    test('renders attack bonus with sign', () => {
        render(<AttacksPanel attacks={[dagger]} />);
        expect(screen.getByText(/attack bonus:.*\+5/i)).toBeInTheDocument();
    });

    test('renders the ability used for the attack in uppercase', () => {
        render(<AttacksPanel attacks={[dagger]} />);
        expect(screen.getByText(/using DEX/i)).toBeInTheDocument();
    });

    test('renders damage summary string', () => {
        render(<AttacksPanel attacks={[dagger]} />);
        expect(screen.getByText(/1d4 \+ 3 piercing/i)).toBeInTheDocument();
    });

    test('renders range from object as normal/long format', () => {
        render(<AttacksPanel attacks={[dagger]} />);
        expect(screen.getByText(/range:.*20\/60/i)).toBeInTheDocument();
    });

    test('renders range from plain string as-is', () => {
        render(<AttacksPanel attacks={[crossbow]} />);
        expect(screen.getByText(/range:.*80\/320/i)).toBeInTheDocument();
    });

    test('does not render range line when range is null', () => {
        render(<AttacksPanel attacks={[greataxe]} />);
        expect(screen.queryByText(/range:/i)).not.toBeInTheDocument();
    });

    test('renders multiple attack cards', () => {
        const { container } = render(<AttacksPanel attacks={[dagger, crossbow, greataxe]} />);
        expect(container.querySelectorAll('.attack-card')).toHaveLength(3);
    });

    test('renders the Attacks heading', () => {
        render(<AttacksPanel attacks={[]} />);
        expect(screen.getByRole('heading', { name: /^attacks$/i })).toBeInTheDocument();
    });
});
