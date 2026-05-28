import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import EquipmentPanel from './EquipmentPanel';

const attacks = [
    { weaponId: 'dagger', name: 'Dagger', attackBonus: 5 },
    { weaponId: 'shortsword', name: 'Shortsword', attackBonus: 5 }
];

describe('EquipmentPanel', () => {
    test('renders the Equipment heading', () => {
        render(<EquipmentPanel character={{}} attacks={[]} />);
        expect(screen.getByRole('heading', { name: /^equipment$/i })).toBeInTheDocument();
    });

    test('shows "None" for armor when armorId is absent', () => {
        render(<EquipmentPanel character={{ armorId: null }} attacks={[]} />);
        // The armor row reads: Armor - None
        expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });

    test('shows formatted armor slug when armorId is present', () => {
        render(<EquipmentPanel character={{ armorId: 'chain-mail' }} attacks={[]} />);
        expect(screen.getByText('Chain Mail')).toBeInTheDocument();
    });

    test('shows "None" for shield when shieldId is absent', () => {
        render(<EquipmentPanel character={{ shieldId: null }} attacks={[]} />);
        expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });

    test('shows formatted shield slug when shieldId is present', () => {
        render(<EquipmentPanel character={{ shieldId: 'wooden-shield' }} attacks={[]} />);
        expect(screen.getByText('Wooden Shield')).toBeInTheDocument();
    });

    test('shows "None" for weapons when attacks array is empty', () => {
        render(<EquipmentPanel character={{}} attacks={[]} />);
        // All three rows (Armor, Shield, Weapons) are None
        const nones = screen.getAllByText('None');
        expect(nones).toHaveLength(3);
    });

    test('shows weapon names joined by comma when attacks are present', () => {
        render(<EquipmentPanel character={{}} attacks={attacks} />);
        expect(screen.getByText('Dagger, Shortsword')).toBeInTheDocument();
    });

    test('shows a single weapon name without a trailing comma', () => {
        const single = [{ weaponId: 'dagger', name: 'Dagger' }];
        render(<EquipmentPanel character={{}} attacks={single} />);
        expect(screen.getByText('Dagger')).toBeInTheDocument();
        expect(screen.queryByText(/,/)).not.toBeInTheDocument();
    });
});
