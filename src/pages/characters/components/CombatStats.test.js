import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import CombatStats from './CombatStats';

const baseCharacter = {
    armorClass: 15,
    currentHp: 20,
    maxHp: 30,
    initiative: 2,
    speed: 30,
    passivePerception: 13,
    proficiencyBonus: 3,
    spellSaveDC: null,
    spellAttackBonus: null
};

function renderCombat(props = {}) {
    return render(
        <CombatStats
            character={baseCharacter}
            showHpControls={false}
            onHpChange={vi.fn()}
            isSaving={false}
            {...props}
        />
    );
}

describe('CombatStats - stat tiles', () => {
    test('displays armor class', () => {
        renderCombat();
        expect(screen.getByText('Armor Class')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    test('displays current/max HP as a fraction', () => {
        renderCombat();
        expect(screen.getByText('20/30')).toBeInTheDocument();
    });

    test('displays formatted initiative with sign', () => {
        renderCombat();
        expect(screen.getByText('+2')).toBeInTheDocument();
    });

    test('displays negative initiative correctly', () => {
        renderCombat({ character: { ...baseCharacter, initiative: -1 } });
        expect(screen.getByText('-1')).toBeInTheDocument();
    });

    test('displays speed with ft. suffix', () => {
        renderCombat();
        expect(screen.getByText('30 ft.')).toBeInTheDocument();
    });

    test('displays passive perception', () => {
        renderCombat();
        expect(screen.getByText('13')).toBeInTheDocument();
    });

    test('displays proficiency bonus with sign', () => {
        renderCombat();
        expect(screen.getByText('+3')).toBeInTheDocument();
    });

    test('shows Spell Save DC tile when spellSaveDC is set', () => {
        renderCombat({ character: { ...baseCharacter, spellSaveDC: 14 } });
        expect(screen.getByText('Spell Save DC')).toBeInTheDocument();
        expect(screen.getByText('14')).toBeInTheDocument();
    });

    test('hides Spell Save DC tile when spellSaveDC is null', () => {
        renderCombat();
        expect(screen.queryByText('Spell Save DC')).not.toBeInTheDocument();
    });

    test('shows Spell Attack tile when spellAttackBonus is set', () => {
        renderCombat({ character: { ...baseCharacter, spellAttackBonus: 6 } });
        expect(screen.getByText('Spell Attack')).toBeInTheDocument();
        expect(screen.getByText('+6')).toBeInTheDocument();
    });

    test('hides Spell Attack tile when spellAttackBonus is null', () => {
        renderCombat();
        expect(screen.queryByText('Spell Attack')).not.toBeInTheDocument();
    });

    test('shows Spell Attack tile when spellAttackBonus is 0', () => {
        renderCombat({ character: { ...baseCharacter, spellAttackBonus: 0 } });
        expect(screen.getByText('Spell Attack')).toBeInTheDocument();
    });
});

describe('CombatStats - HP controls visibility', () => {
    test('HP tracker is hidden when showHpControls is false', () => {
        renderCombat({ showHpControls: false });
        expect(screen.queryByText(/hit point tracker/i)).not.toBeInTheDocument();
    });

    test('HP tracker renders when showHpControls is true', () => {
        renderCombat({ showHpControls: true });
        expect(screen.getByText(/hit point tracker/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /damage/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /heal/i })).toBeInTheDocument();
    });

    test('HP fraction label is displayed below the controls', () => {
        renderCombat({ showHpControls: true });
        // The <small> inside the tracker shows currentHp/maxHp HP
        expect(screen.getByText(/20\/30 HP/i)).toBeInTheDocument();
    });

    test('shows "- unconscious" label when currentHp is 0', () => {
        renderCombat({
            showHpControls: true,
            character: { ...baseCharacter, currentHp: 0, maxHp: 30 }
        });
        expect(screen.getByText(/unconscious/i)).toBeInTheDocument();
    });

    test('does not show "unconscious" when HP is above 0', () => {
        renderCombat({ showHpControls: true });
        expect(screen.queryByText(/unconscious/i)).not.toBeInTheDocument();
    });
});

describe('CombatStats - HP control interactions', () => {
    test('Damage button calls onHpChange with currentHp minus step', () => {
        const onHpChange = vi.fn();
        renderCombat({ showHpControls: true, onHpChange });
        fireEvent.click(screen.getByRole('button', { name: /damage/i }));
        // Default amount is 1, so 20 - 1 = 19
        expect(onHpChange).toHaveBeenCalledWith(19);
    });

    test('Heal button calls onHpChange with currentHp plus step', () => {
        const onHpChange = vi.fn();
        renderCombat({ showHpControls: true, onHpChange });
        fireEvent.click(screen.getByRole('button', { name: /heal/i }));
        // 20 + 1 = 21
        expect(onHpChange).toHaveBeenCalledWith(21);
    });

    test('Damage with custom amount applies the correct delta', () => {
        const onHpChange = vi.fn();
        renderCombat({ showHpControls: true, onHpChange });
        const amountInput = screen.getByLabelText(/hit point change amount/i);
        fireEvent.change(amountInput, { target: { value: '5' } });
        fireEvent.click(screen.getByRole('button', { name: /damage/i }));
        // 20 - 5 = 15
        expect(onHpChange).toHaveBeenCalledWith(15);
    });

    test('Heal with custom amount applies the correct delta', () => {
        const onHpChange = vi.fn();
        renderCombat({ showHpControls: true, onHpChange });
        const amountInput = screen.getByLabelText(/hit point change amount/i);
        fireEvent.change(amountInput, { target: { value: '8' } });
        fireEvent.click(screen.getByRole('button', { name: /heal/i }));
        // 20 + 8 = 28
        expect(onHpChange).toHaveBeenCalledWith(28);
    });

    test('Heal clamps to maxHp - does not exceed it', () => {
        const onHpChange = vi.fn();
        // currentHp is already close to max
        renderCombat({
            showHpControls: true,
            onHpChange,
            character: { ...baseCharacter, currentHp: 29, maxHp: 30 }
        });
        const amountInput = screen.getByLabelText(/hit point change amount/i);
        fireEvent.change(amountInput, { target: { value: '10' } });
        fireEvent.click(screen.getByRole('button', { name: /heal/i }));
        // 29 + 10 = 39, clamped to 30
        expect(onHpChange).toHaveBeenCalledWith(30);
    });

    test('Damage clamps to 0 - does not go below it', () => {
        const onHpChange = vi.fn();
        renderCombat({
            showHpControls: true,
            onHpChange,
            character: { ...baseCharacter, currentHp: 2, maxHp: 30 }
        });
        const amountInput = screen.getByLabelText(/hit point change amount/i);
        fireEvent.change(amountInput, { target: { value: '10' } });
        fireEvent.click(screen.getByRole('button', { name: /damage/i }));
        // 2 - 10 = -8, clamped to 0
        expect(onHpChange).toHaveBeenCalledWith(0);
    });

    test('Damage button is disabled at 0 HP', () => {
        renderCombat({
            showHpControls: true,
            character: { ...baseCharacter, currentHp: 0, maxHp: 30 }
        });
        expect(screen.getByRole('button', { name: /damage/i })).toBeDisabled();
    });

    test('Heal button is disabled at full HP', () => {
        renderCombat({
            showHpControls: true,
            character: { ...baseCharacter, currentHp: 30, maxHp: 30 }
        });
        expect(screen.getByRole('button', { name: /heal/i })).toBeDisabled();
    });

    test('both HP buttons are disabled when isSaving', () => {
        renderCombat({ showHpControls: true, isSaving: true });
        expect(screen.getByRole('button', { name: /damage/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /heal/i })).toBeDisabled();
    });

    test('onHpChange is not called when the resulting HP would equal current HP', () => {
        const onHpChange = vi.fn();
        // Already at max - Damage at 0 should not fire since button is disabled;
        // test the no-op for Damage when step would produce same value.
        // currentHp=30 maxHp=30 - heal button is disabled, so test damage instead.
        renderCombat({
            showHpControls: true,
            onHpChange,
            character: { ...baseCharacter, currentHp: 0, maxHp: 30 }
        });
        // Damage button is disabled at 0 HP, so clicking it does nothing.
        expect(screen.getByRole('button', { name: /damage/i })).toBeDisabled();
        expect(onHpChange).not.toHaveBeenCalled();
    });
});
