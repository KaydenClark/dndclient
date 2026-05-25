import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CharacterSheet from '../../components/characters/characterSheet';
import { useAuth } from '../../context/auth';
import { fetchCharacters } from '../../lib/api';

// Character roster. Creation moved to its own /characters/new route
// (Phase 0, Milestone 2), so this page is now a simple list with a link
// to the creation flow.
export default function CharactersList() {
    const [characters, setCharacters] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { token } = useAuth();

    useEffect(() => {
        let ignore = false;

        async function loadCharacters() {
            setIsLoading(true);
            setError('');

            try {
                const results = await fetchCharacters(token);

                if (!ignore) {
                    setCharacters(results);
                }
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.response?.data?.error || 'Unable to load character list.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCharacters();

        return () => {
            ignore = true;
        };
    }, [token]);

    return (
        <section className="page-card">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Character Roster</p>
                    <h1>Your Characters</h1>
                </div>
                <Link to="/characters/new" className="primary-action">
                    Create Character
                </Link>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {isLoading ? <p className="status-copy">Loading characters...</p> : null}
            {!isLoading && !error && characters.length === 0 ? (
                <p className="status-copy">No characters yet. Create your first sheet to get started.</p>
            ) : null}

            <div className="character-list">
                {characters.map((character) => (
                    <CharacterSheet key={character._id} data={character} />
                ))}
            </div>
        </section>
    );
}
