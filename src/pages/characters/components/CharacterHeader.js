import React from 'react';
import { Link } from 'react-router-dom';

// Top of the character sheet: back link, mode toggle buttons, name, subtitle,
// status messages, and the identity grid (user / class / level / race /
// alignment / background). Purely presentational - the page owns the state.
export default function CharacterHeader({
    character,
    subtitle,
    mode,
    isSaving,
    saveMessage,
    error,
    onEdit,
    onLevelUp
}) {
    return (
        <>
            <div className="section-heading character-sheet-heading">
                <Link to="/characters" className="secondary-action">
                    Back to Characters
                </Link>
                <div className="levelup-actions">
                    <button
                        type="button"
                        className="secondary-action"
                        onClick={onEdit}
                        disabled={isSaving || mode === 'edit'}
                    >
                        Edit Character
                    </button>
                    <button
                        type="button"
                        className="primary-action"
                        onClick={onLevelUp}
                        disabled={isSaving || mode === 'levelUp'}
                    >
                        Level Up
                    </button>
                </div>
            </div>
            <h1>{character.characterName}</h1>
            <p className="character-subtitle">{subtitle || 'Unassigned adventurer'}</p>
            {saveMessage ? <p className="form-success">{saveMessage}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <div className="character-detail-grid">
                <div>
                    <span className="detail-label">User</span>
                    <strong>{character.userName || 'Unknown'}</strong>
                </div>
                <div>
                    <span className="detail-label">Class</span>
                    <strong>{character.className || 'Unassigned'}</strong>
                </div>
                <div>
                    <span className="detail-label">Level</span>
                    <strong>{character.level || 1}</strong>
                </div>
                <div>
                    <span className="detail-label">Race</span>
                    <strong>{character.raceName || 'Unknown'}</strong>
                </div>
                <div>
                    <span className="detail-label">Alignment</span>
                    <strong>{character.alignment || 'Unset'}</strong>
                </div>
                <div>
                    <span className="detail-label">Background</span>
                    {/* backgroundName is set by derivation when the background
                        resolves to a compendium entry; fall back to the raw value. */}
                    <strong>{character.backgroundName || character.background || 'Unset'}</strong>
                </div>
            </div>
        </>
    );
}
