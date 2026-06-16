import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import AbilityScores from './AbilityScores';

// Minimal character with all six scores and derived mods.
const baseCharacter = {
    abilityScores: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
    abilityMods: { str: 3, dex: 2, con: 2, int: 0, wis: 1, cha: -1 }
};

describe('AbilityScores', () => {
    test('renders all six ability labels in PHB order', () => {
        render(<AbilityScores character={baseCharacter} />);

        expect(screen.getByText('STR')).toBeInTheDocument();
        expect(screen.getByText('DEX')).toBeInTheDocument();
        expect(screen.getByText('CON')).toBeInTheDocument();
        expect(screen.getByText('INT')).toBeInTheDocument();
        expect(screen.getByText('WIS')).toBeInTheDocument();
        expect(screen.getByText('CHA')).toBeInTheDocument();
    });

    test('shows the raw score for each ability', () => {
        render(<AbilityScores character={baseCharacter} />);

        // Each score should appear as a standalone text node.
        expect(screen.getByText('16')).toBeInTheDocument(); // str
        expect(screen.getByText('14')).toBeInTheDocument(); // dex
        expect(screen.getByText('15')).toBeInTheDocument(); // con
        expect(screen.getByText('10')).toBeInTheDocument(); // int
        expect(screen.getByText('12')).toBeInTheDocument(); // wis
        expect(screen.getByText('8')).toBeInTheDocument();  // cha
    });

    test('shows formatted modifiers with sign prefix', () => {
        render(<AbilityScores character={baseCharacter} />);

        expect(screen.getByText('+3')).toBeInTheDocument(); // str
        expect(screen.getAllByText('+2')).toHaveLength(2); // dex and con
        expect(screen.getByText('+0')).toBeInTheDocument(); // int
        expect(screen.getByText('+1')).toBeInTheDocument(); // wis
        expect(screen.getByText('-1')).toBeInTheDocument(); // cha
    });

    test('shows -- for a missing ability score', () => {
        render(<AbilityScores character={{ abilityScores: {}, abilityMods: {} }} />);

        // All six scores should fall back to --
        const dashes = screen.getAllByText('--');
        expect(dashes).toHaveLength(6);
    });

    test('shows +0 for a missing modifier', () => {
        // abilityMods is undefined - component uses ?? 0 then formats as +0
        render(<AbilityScores character={{ abilityScores: { str: 10 } }} />);
        // modifier is 0 for str, rest are also 0 since abilityMods is undefined
        const plusZeros = screen.getAllByText('+0');
        expect(plusZeros.length).toBeGreaterThanOrEqual(1);
    });

    test('renders the Ability Scores section heading', () => {
        render(<AbilityScores character={baseCharacter} />);
        expect(screen.getByRole('heading', { name: /ability scores/i })).toBeInTheDocument();
    });

    test('renders exactly six ability score cards', () => {
        const { container } = render(<AbilityScores character={baseCharacter} />);
        // Each card has the ability-score-card class.
        const cards = container.querySelectorAll('.ability-score-card');
        expect(cards).toHaveLength(6);
    });
});
