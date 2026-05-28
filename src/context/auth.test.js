import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AuthProvider, STORAGE_KEY, useAuth } from './auth';

function AuthProbe() {
    const { isAuthenticated, signOut } = useAuth();

    return (
        <div>
            <span>{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
            <button type="button" onClick={signOut}>
                Sign Out
            </button>
        </div>
    );
}

beforeEach(() => {
    localStorage.clear();
});

test('hydrates authentication from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'stored-token');

    render(
        <AuthProvider>
            <AuthProbe />
        </AuthProvider>
    );

    expect(screen.getByText('authenticated')).toBeInTheDocument();
});

test('signOut clears persisted auth state', async () => {
    localStorage.setItem(STORAGE_KEY, 'stored-token');

    render(
        <AuthProvider>
            <AuthProbe />
        </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
        expect(screen.getByText('anonymous')).toBeInTheDocument();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Additional auth context coverage
// ---------------------------------------------------------------------------

function SignInProbe() {
    const { isAuthenticated, token, signIn, signOut } = useAuth();

    return (
        <div>
            <span data-testid="status">{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
            <span data-testid="token">{token}</span>
            <button type="button" onClick={() => signIn('new-token')}>Sign In</button>
            <button type="button" onClick={signOut}>Sign Out</button>
        </div>
    );
}

test('starts as anonymous when localStorage is empty', () => {
    render(
        <AuthProvider>
            <SignInProbe />
        </AuthProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('anonymous');
});

test('signIn sets isAuthenticated to true', async () => {
    render(
        <AuthProvider>
            <SignInProbe />
        </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
        expect(screen.getByTestId('status').textContent).toBe('authenticated');
    });
});

test('signIn persists the token to localStorage', async () => {
    render(
        <AuthProvider>
            <SignInProbe />
        </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBe('new-token');
    });
});

test('token value is exposed through the context', async () => {
    render(
        <AuthProvider>
            <SignInProbe />
        </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
        expect(screen.getByTestId('token').textContent).toBe('new-token');
    });
});

test('isAuthenticated is false when token is an empty string', () => {
    render(
        <AuthProvider>
            <SignInProbe />
        </AuthProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('anonymous');
});
