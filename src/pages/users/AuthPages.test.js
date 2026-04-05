import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

test('renders sign in form fields', () => {
    render(
        <MemoryRouter>
            <SignIn />
        </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
});

test('renders sign up form fields', () => {
    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/user name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
});
