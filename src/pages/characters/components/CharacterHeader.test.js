import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import CharacterHeader from './CharacterHeader';

// Wrap in MemoryRouter because CharacterHeader renders a <Link>.
function renderHeader(props = {}) {
    const defaults = {
        character: {
            characterName: 'Akta Dragonfucked',
            userName: 'Kayden',
            className: 'Sorcerer',
            level: 5,
            raceName: 'Tiefling',
            alignment: 'Chaotic Neutral',
            background: 'Criminal',
            backgroundName: undefined
        },
        subtitle: 'Tiefling | Sorcerer',
        mode: 'view',
        isSaving: false,
        saveMessage: '',
        error: '',
        onEdit: vi.fn(),
        onLevelUp: vi.fn(),
        ...props
    };

    return render(
        <MemoryRouter>
            <CharacterHeader {...defaults} />
        </MemoryRouter>
    );
}

describe('CharacterHeader', () => {
    test('renders the character name as an h1', () => {
        renderHeader();
        expect(screen.getByRole('heading', { level: 1, name: /akta dragonfucked/i })).toBeInTheDocument();
    });

    test('renders the provided subtitle', () => {
        renderHeader({ subtitle: 'Tiefling | Sorcerer | Wild Magic' });
        expect(screen.getByText(/tiefling \| sorcerer \| wild magic/i)).toBeInTheDocument();
    });

    test('shows fallback subtitle when none is provided', () => {
        renderHeader({ subtitle: '' });
        expect(screen.getByText(/unassigned adventurer/i)).toBeInTheDocument();
    });

    test('shows save message when present', () => {
        renderHeader({ saveMessage: 'Character sheet updated.' });
        expect(screen.getByText(/character sheet updated/i)).toBeInTheDocument();
    });

    test('hides save message when empty', () => {
        renderHeader({ saveMessage: '' });
        expect(screen.queryByText(/character sheet updated/i)).not.toBeInTheDocument();
    });

    test('shows error message when present', () => {
        renderHeader({ error: 'Unable to update character.' });
        expect(screen.getByText(/unable to update character/i)).toBeInTheDocument();
    });

    test('hides error message when empty', () => {
        renderHeader({ error: '' });
        expect(screen.queryByText(/unable to update/i)).not.toBeInTheDocument();
    });

    test('calls onEdit when Edit Character is clicked', () => {
        const onEdit = vi.fn();
        renderHeader({ onEdit });
        fireEvent.click(screen.getByRole('button', { name: /edit character/i }));
        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    test('calls onLevelUp when Level Up is clicked', () => {
        const onLevelUp = vi.fn();
        renderHeader({ onLevelUp });
        fireEvent.click(screen.getByRole('button', { name: /level up/i }));
        expect(onLevelUp).toHaveBeenCalledTimes(1);
    });

    test('Edit Character button is disabled when mode is edit', () => {
        renderHeader({ mode: 'edit' });
        expect(screen.getByRole('button', { name: /edit character/i })).toBeDisabled();
    });

    test('Level Up button is disabled when mode is levelUp', () => {
        renderHeader({ mode: 'levelUp' });
        expect(screen.getByRole('button', { name: /level up/i })).toBeDisabled();
    });

    test('both buttons are disabled when isSaving', () => {
        renderHeader({ isSaving: true });
        expect(screen.getByRole('button', { name: /edit character/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /level up/i })).toBeDisabled();
    });

    test('renders identity grid labels', () => {
        renderHeader();
        expect(screen.getByText('User')).toBeInTheDocument();
        expect(screen.getByText('Class')).toBeInTheDocument();
        expect(screen.getByText('Level')).toBeInTheDocument();
        expect(screen.getByText('Race')).toBeInTheDocument();
        expect(screen.getByText('Alignment')).toBeInTheDocument();
        expect(screen.getByText('Background')).toBeInTheDocument();
    });

    test('renders identity grid values from the character', () => {
        renderHeader();
        expect(screen.getByText('Kayden')).toBeInTheDocument();
        expect(screen.getByText('Sorcerer')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Tiefling')).toBeInTheDocument();
        expect(screen.getByText('Chaotic Neutral')).toBeInTheDocument();
        expect(screen.getByText('Criminal')).toBeInTheDocument();
    });

    test('prefers backgroundName over background when both are present', () => {
        renderHeader({
            character: {
                characterName: 'Test',
                background: 'sage-id',
                backgroundName: 'Sage'
            }
        });
        expect(screen.getByText('Sage')).toBeInTheDocument();
        expect(screen.queryByText('sage-id')).not.toBeInTheDocument();
    });

    test('falls back to Unknown for missing userName', () => {
        renderHeader({ character: { characterName: 'Test', userName: undefined } });
        expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
    });

    test('falls back to Unassigned for missing className', () => {
        renderHeader({ character: { characterName: 'Test', className: undefined } });
        expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    test('falls back to Unset for missing alignment', () => {
        renderHeader({ character: { characterName: 'Test', alignment: undefined } });
        expect(screen.getAllByText('Unset').length).toBeGreaterThan(0);
    });

    test('back-to-characters link is rendered', () => {
        renderHeader();
        const link = screen.getByRole('link', { name: /back to characters/i });
        expect(link).toHaveAttribute('href', '/characters');
    });
});
