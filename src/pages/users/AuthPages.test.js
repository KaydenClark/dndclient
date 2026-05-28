import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

// ---------------------------------------------------------------------------
// Shared auth context mock - SignIn requires useAuth for the signIn callback.
// ---------------------------------------------------------------------------
vi.mock('../../context/auth', () => ({
    useAuth: () => ({
        signIn: vi.fn(),
        isAuthenticated: false,
        token: ''
    })
}));

// ---------------------------------------------------------------------------
// SignIn
// ---------------------------------------------------------------------------

describe('SignIn', () => {
    test('renders email and password fields', () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    });

    test('renders Sign In button', () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('renders a link to the sign-up page', () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );
        expect(screen.getByRole('link', { name: /create one here/i })).toBeInTheDocument();
    });

    test('email field accepts typed input', () => {
        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );
        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
    });

    test('shows API error message on failed sign-in', async () => {
        const { requestSignIn } = await import('../../lib/api');
        vi.mock('../../lib/api', () => ({
            requestSignIn: vi.fn().mockRejectedValue({
                response: { data: { error: 'Invalid credentials.' } }
            }),
            requestSignUp: vi.fn()
        }));

        render(
            <MemoryRouter>
                <SignIn />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: 'bad@test.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
            target: { value: 'wrong' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/unable to sign in with that email and password/i)).toBeInTheDocument();
        });
    });
});

// ---------------------------------------------------------------------------
// SignUp
// ---------------------------------------------------------------------------

describe('SignUp', () => {
    test('renders all four form fields', () => {
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/user name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    });

    test('renders Create Account button', () => {
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('renders a link back to sign in', () => {
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );
        expect(screen.getByRole('link', { name: /go to sign in/i })).toBeInTheDocument();
    });

    test('shows error when passwords do not match', async () => {
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
            target: { value: 'abc123' }
        });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
            target: { value: 'xyz999' }
        });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

    test('does not show error initially', () => {
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );
        expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });

    test('Create Account button is disabled while submitting', async () => {
        // Simulate a slow API response by using a never-resolving promise.
        vi.mock('../../lib/api', () => ({
            requestSignUp: vi.fn(() => new Promise(() => {})),
            requestSignIn: vi.fn()
        }));

        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
            target: { value: 'same' }
        });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
            target: { value: 'same' }
        });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /creating account/i })
            ).toBeDisabled();
        });
    });
});
