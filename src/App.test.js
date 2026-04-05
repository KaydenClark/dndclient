import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

test('renders the home page hero copy', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Players Digital Binder/i })).toBeInTheDocument();
    expect(screen.getByText(/shared space for players and the DM/i)).toBeInTheDocument();
});
