import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import CharacterSheet from './characterSheet';

const fullCharacter = {
    _id: 'abc123',
    characterName: 'Akta Dragonfucked',
    raceName: 'Tiefling',
    className: 'Sorcerer',
    level: 5,
    userName: 'Kayden',
    email: 'k@example.com'
};

function renderCard(data = fullCharacter) {
    return render(
        <MemoryRouter>
            <CharacterSheet data={data} />
        </MemoryRouter>
    );
}

describe('CharacterSheet card', () => {
    test('renders character name as a heading', () => {
        renderCard();
        expect(screen.getByRole('heading', { name: /akta dragonfucked/i })).toBeInTheDocument();
    });

    test('renders level, race, and class in the meta line', () => {
        renderCard();
        expect(screen.getByText(/level 5 tiefling sorcerer/i)).toBeInTheDocument();
    });

    test('renders the Open Sheet link pointing to the correct character URL', () => {
        renderCard();
        expect(screen.getByRole('link', { name: /open sheet/i })).toHaveAttribute(
            'href',
            '/characters/abc123'
        );
    });

    test('renders the "Character" eyebrow label', () => {
        renderCard();
        expect(screen.getByText(/^character$/i)).toBeInTheDocument();
    });

    test('shows userName as fallback when raceName and className are absent', () => {
        renderCard({
            _id: 'xyz',
            characterName: 'Unknown Hero',
            raceName: undefined,
            className: undefined,
            level: 1,
            userName: 'Kayden'
        });
        // lineage is empty, falls back to userName
        expect(screen.getByText('Kayden')).toBeInTheDocument();
    });

    test('shows email as fallback when both lineage and userName are absent', () => {
        renderCard({
            _id: 'xyz',
            characterName: 'Nameless',
            raceName: undefined,
            className: undefined,
            level: 1,
            userName: undefined,
            email: 'k@example.com'
        });
        expect(screen.getByText('k@example.com')).toBeInTheDocument();
    });

    test('defaults level to 1 when level is missing', () => {
        renderCard({ ...fullCharacter, level: undefined });
        expect(screen.getByText(/level 1/i)).toBeInTheDocument();
    });
});
