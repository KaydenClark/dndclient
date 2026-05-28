import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import SkillsAndSaves from './SkillsAndSaves';

const baseCharacter = {
    savingThrows: { str: -1, dex: 3, con: 2, int: 5, wis: 4, cha: 0 },
    skillValues: {
        acrobatics: 3,
        arcana: 7,
        perception: 5,
        stealth: 3
    }
};

describe('SkillsAndSaves', () => {
    test('renders Saving Throws heading', () => {
        render(<SkillsAndSaves character={baseCharacter} />);
        expect(screen.getByRole('heading', { name: /saving throws/i })).toBeInTheDocument();
    });

    test('renders Skills heading', () => {
        render(<SkillsAndSaves character={baseCharacter} />);
        expect(screen.getByRole('heading', { name: /^skills$/i })).toBeInTheDocument();
    });

    test('renders all six ability abbreviations in the saving throws list', () => {
        render(<SkillsAndSaves character={baseCharacter} />);
        expect(screen.getByText('STR')).toBeInTheDocument();
        expect(screen.getByText('DEX')).toBeInTheDocument();
        expect(screen.getByText('CON')).toBeInTheDocument();
        expect(screen.getByText('INT')).toBeInTheDocument();
        expect(screen.getByText('WIS')).toBeInTheDocument();
        expect(screen.getByText('CHA')).toBeInTheDocument();
    });

    test('renders saving throw values formatted with sign', () => {
        render(<SkillsAndSaves character={baseCharacter} />);
        expect(within(screen.getByText('INT').closest('li')).getByText('+5')).toBeInTheDocument();
        expect(within(screen.getByText('WIS').closest('li')).getByText('+4')).toBeInTheDocument();
        expect(within(screen.getByText('STR').closest('li')).getByText('-1')).toBeInTheDocument();
    });

    test('renders each skill name as a human-readable label', () => {
        render(<SkillsAndSaves character={baseCharacter} />);
        expect(screen.getByText('Acrobatics')).toBeInTheDocument();
        expect(screen.getByText('Arcana')).toBeInTheDocument();
        expect(screen.getByText('Perception')).toBeInTheDocument();
        expect(screen.getByText('Stealth')).toBeInTheDocument();
    });

    test('renders skill bonus values formatted with sign', () => {
        render(<SkillsAndSaves character={baseCharacter} />);
        expect(screen.getByText('+7')).toBeInTheDocument(); // arcana
    });

    test('renders nothing in the skills list when skillValues is empty', () => {
        const { container } = render(
            <SkillsAndSaves character={{ ...baseCharacter, skillValues: {} }} />
        );
        const skillPanel = container.querySelectorAll('.detail-panel')[1];
        expect(skillPanel.querySelectorAll('li')).toHaveLength(0);
    });

    test('falls back to +0 for a save missing from savingThrows', () => {
        render(
            <SkillsAndSaves
                character={{ ...baseCharacter, savingThrows: {} }}
            />
        );
        const plusZeros = screen.getAllByText('+0');
        expect(plusZeros).toHaveLength(6);
    });
});
