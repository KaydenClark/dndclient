import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthProvider, STORAGE_KEY } from '../../context/auth';
import { AppRoutes } from './Routes';

// Mock the API so authenticated routes don't fire real network calls.
vi.mock('../../lib/api', () => ({
    fetchCharacters: vi.fn().mockResolvedValue([]),
    fetchCharacterById: vi.fn().mockResolvedValue(null),
    fetchCompendiumBootstrap: vi.fn().mockResolvedValue({
        races: [],
        classes: [],
        subclasses: [],
        weapons: [],
        armor: [],
        spells: [],
        backgrounds: []
    }),
    createCharacter: vi.fn(),
    updateCharacter: vi.fn()
}));

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Unauthenticated routing
// ---------------------------------------------------------------------------

test('redirects /characters to sign in when unauthenticated', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/characters']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

test('redirects /characters/new to sign in when unauthenticated', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/characters/new']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

test('redirects /characters/:id to sign in when unauthenticated', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/characters/abc123']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

test('renders the home page at /', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /players digital binder/i })).toBeInTheDocument();
});

test('renders the sign in page at /signIn', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/signIn']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /^sign in$/i })).toBeInTheDocument();
});

test('renders the sign up page at /signUp', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/signUp']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /^sign up$/i })).toBeInTheDocument();
});

test('unknown routes redirect to the home page', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/totally-unknown-path']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /players digital binder/i })).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// Authenticated routing
// ---------------------------------------------------------------------------

test('authenticated user can access /characters without being redirected', async () => {
    // Seed localStorage so AuthProvider considers the user signed in.
    localStorage.setItem(STORAGE_KEY, 'valid-token');

    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/characters']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );

    // CharactersList renders "Your Characters" heading once the list resolves.
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your characters/i })).toBeInTheDocument();
    });
});

test('authenticated user can access /characters/new without being redirected', async () => {
    localStorage.setItem(STORAGE_KEY, 'valid-token');

    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/characters/new']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create a character/i })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Home page authenticated state
// ---------------------------------------------------------------------------

test('home page shows "Open Character List" link when authenticated', () => {
    localStorage.setItem(STORAGE_KEY, 'valid-token');

    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /open character list/i })).toBeInTheDocument();
});

test('home page shows Sign In and Create Account links when unauthenticated', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
});
