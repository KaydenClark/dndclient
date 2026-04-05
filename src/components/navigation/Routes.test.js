import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AuthProvider } from '../../context/auth';
import { AppRoutes } from './Routes';

beforeEach(() => {
    localStorage.clear();
});

test('redirects protected routes to sign in when unauthenticated', () => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/characters']}>
                <AppRoutes />
            </MemoryRouter>
        </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
