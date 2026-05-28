import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import FeaturesPanel from './FeaturesPanel';

const fullCharacter = {
    languages: ['Common', 'Elvish', 'Draconic'],
    savingThrowProficiencies: ['int', 'wis'],
    skillProficiencies: ['arcana', 'history'],
    backgroundSkillProficiencies: ['perception'],
    weaponProficiencies: ['dagger', 'light-crossbow'],
    armorProficiencies: ['light', 'medium'],
    toolProficiencies: ['thieves-tools', 'herbalism-kit'],
    currency: { cp: 5, sp: 10, ep: 0, gp: 73, pp: 2 },
    traits: 'Curious and methodical.',
    ideals: 'Knowledge is power.',
    bonds: 'My spellbook is my life.',
    flaws: 'I speak my mind too freely.'
};

const features = [
    { id: 'sculpt-spells', name: 'Sculpt Spells' },
    { id: 'potent-cantrip', name: 'Potent Cantrip' }
];

describe('FeaturesPanel - headings', () => {
    test('renders Features & Proficiencies heading', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByRole('heading', { name: /features & proficiencies/i })).toBeInTheDocument();
    });

    test('renders Currency & Notes heading', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByRole('heading', { name: /currency & notes/i })).toBeInTheDocument();
    });
});

describe('FeaturesPanel - proficiency lists', () => {
    test('renders languages joined by comma', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Common, Elvish, Draconic')).toBeInTheDocument();
    });

    test('renders saving throw proficiencies in uppercase joined by comma', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('INT, WIS')).toBeInTheDocument();
    });

    test('renders skill proficiencies as human-readable labels', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Arcana, History')).toBeInTheDocument();
    });

    test('renders background skill proficiencies as human-readable labels', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Perception')).toBeInTheDocument();
    });

    test('renders weapon proficiencies as formatted slugs', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Dagger, Light Crossbow')).toBeInTheDocument();
    });

    test('renders armor proficiencies as formatted slugs', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Light, Medium')).toBeInTheDocument();
    });

    test('renders tool proficiencies as formatted slugs', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Thieves Tools, Herbalism Kit')).toBeInTheDocument();
    });

    test('shows "None" for empty tool proficiency list', () => {
        render(
            <FeaturesPanel character={{ ...fullCharacter, toolProficiencies: [] }} features={[]} />
        );
        expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });

    test('shows "None" for absent tool proficiency field', () => {
        const { toolProficiencies: _omit, ...charWithoutTools } = fullCharacter;
        render(<FeaturesPanel character={charWithoutTools} features={[]} />);
        expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });

    test('shows "None" for empty language list', () => {
        render(
            <FeaturesPanel character={{ ...fullCharacter, languages: [] }} features={[]} />
        );
        // Multiple "None" values may appear for other empty lists; just verify at least one.
        expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });

    test('shows "None" for empty skill proficiency list', () => {
        render(
            <FeaturesPanel character={{ ...fullCharacter, skillProficiencies: [] }} features={[]} />
        );
        expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });
});

describe('FeaturesPanel - features tags', () => {
    test('renders each feature name as a tag', () => {
        render(<FeaturesPanel character={fullCharacter} features={features} />);
        expect(screen.getByText('Sculpt Spells')).toBeInTheDocument();
        expect(screen.getByText('Potent Cantrip')).toBeInTheDocument();
    });

    test('renders no tags when features list is empty', () => {
        const { container } = render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(container.querySelectorAll('.detail-tag')).toHaveLength(0);
    });
});

describe('FeaturesPanel - currency', () => {
    test('renders each currency denomination in cp/sp/ep/gp/pp order', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        const coinText = screen.getByText(/5 CP, 10 SP, 0 EP, 73 GP, 2 PP/i);
        expect(coinText).toBeInTheDocument();
    });

    test('defaults to 0 when a currency key is missing', () => {
        render(
            <FeaturesPanel character={{ ...fullCharacter, currency: undefined }} features={[]} />
        );
        // All denominations should show 0
        expect(screen.getByText(/0 CP, 0 SP, 0 EP, 0 GP, 0 PP/i)).toBeInTheDocument();
    });
});

describe('FeaturesPanel - notes', () => {
    test('renders traits value when set', () => {
        render(<FeaturesPanel character={fullCharacter} features={[]} />);
        expect(screen.getByText('Curious and methodical.')).toBeInTheDocument();
    });

    test('shows "Unset" for missing traits', () => {
        render(
            <FeaturesPanel character={{ ...fullCharacter, traits: '' }} features={[]} />
        );
        expect(screen.getAllByText('Unset').length).toBeGreaterThanOrEqual(1);
    });

    test('shows "Unset" for missing ideals, bonds, and flaws when all are empty', () => {
        render(
            <FeaturesPanel
                character={{ ...fullCharacter, traits: '', ideals: '', bonds: '', flaws: '' }}
                features={[]}
            />
        );
        const unsets = screen.getAllByText('Unset');
        expect(unsets).toHaveLength(4);
    });
});
