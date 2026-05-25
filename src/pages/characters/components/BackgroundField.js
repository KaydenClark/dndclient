import React from 'react';

// Phase 1: background picker. When the Backgrounds compendium is seeded it
// renders a select of structured backgrounds and stores the background id.
// When the compendium is empty (not yet seeded) it falls back to a free-text
// input so character creation still works. Either way it writes the
// `background` field; the backend derivation resolves an id or a name.
export default function BackgroundField({ backgrounds, value, onChange }) {
    const hasData = Array.isArray(backgrounds) && backgrounds.length > 0;

    // Fallback: no structured background data, use plain text.
    if (!hasData) {
        return (
            <input
                type="text"
                placeholder="Background"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        );
    }

    return (
        <select
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Background"
        >
            <option value="">Select a background</option>
            {backgrounds.map((background) => (
                <option key={background.id} value={background.id}>
                    {background.name}
                </option>
            ))}
        </select>
    );
}
