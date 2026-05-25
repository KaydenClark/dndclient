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
