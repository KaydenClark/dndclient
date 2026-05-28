import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import BackgroundField from './BackgroundField';

const backgrounds = [
    { id: 'sage', name: 'Sage' },
    { id: 'criminal', name: 'Criminal' },
    { id: 'soldier', name: 'Soldier' }
];

describe('BackgroundField - no compendium data (text input fallback)', () => {
    test('renders a plain text input when backgrounds is empty', () => {
        render(<BackgroundField backgrounds={[]} value="" onChange={vi.fn()} />);
        expect(screen.getByPlaceholderText(/background/i)).toBeInTheDocument();
    });

    test('renders a plain text input when backgrounds is null', () => {
        render(<BackgroundField backgrounds={null} value="" onChange={vi.fn()} />);
        expect(screen.getByPlaceholderText(/background/i)).toBeInTheDocument();
    });

    test('renders a plain text input when backgrounds is undefined', () => {
        render(<BackgroundField backgrounds={undefined} value="" onChange={vi.fn()} />);
        expect(screen.getByPlaceholderText(/background/i)).toBeInTheDocument();
    });

    test('text input reflects the current value', () => {
        render(<BackgroundField backgrounds={[]} value="Hermit" onChange={vi.fn()} />);
        expect(screen.getByDisplayValue('Hermit')).toBeInTheDocument();
    });

    test('calls onChange with the typed value', () => {
        const onChange = vi.fn();
        render(<BackgroundField backgrounds={[]} value="" onChange={onChange} />);
        fireEvent.change(screen.getByPlaceholderText(/background/i), {
            target: { value: 'Sage' }
        });
        expect(onChange).toHaveBeenCalledWith('Sage');
    });

    test('does not render a select when falling back to text input', () => {
        render(<BackgroundField backgrounds={[]} value="" onChange={vi.fn()} />);
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
});

describe('BackgroundField - with compendium data (select)', () => {
    test('renders a select element when backgrounds has items', () => {
        render(<BackgroundField backgrounds={backgrounds} value="" onChange={vi.fn()} />);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('includes a blank placeholder option', () => {
        render(<BackgroundField backgrounds={backgrounds} value="" onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: /select a background/i })).toBeInTheDocument();
    });

    test('renders an option for each background', () => {
        render(<BackgroundField backgrounds={backgrounds} value="" onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Sage' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Criminal' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Soldier' })).toBeInTheDocument();
    });

    test('reflects the current value as selected option', () => {
        render(<BackgroundField backgrounds={backgrounds} value="criminal" onChange={vi.fn()} />);
        expect(screen.getByDisplayValue('Criminal')).toBeInTheDocument();
    });

    test('calls onChange with the selected id', () => {
        const onChange = vi.fn();
        render(<BackgroundField backgrounds={backgrounds} value="" onChange={onChange} />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'sage' } });
        expect(onChange).toHaveBeenCalledWith('sage');
    });

    test('does not render a text input when using the select', () => {
        render(<BackgroundField backgrounds={backgrounds} value="" onChange={vi.fn()} />);
        expect(screen.queryByPlaceholderText(/background/i)).not.toBeInTheDocument();
    });
});
