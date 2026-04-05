import React from 'react';
import { Link } from 'react-router-dom';

export default function CharacterSheet({ data }) {
    const lineage = [data.raceName, data.className].filter(Boolean).join(' ');

    return (
        <article className="character-card">
            <div>
                <p className="character-card-label">Character</p>
                <h2>{data.characterName}</h2>
                <p className="character-card-meta">{lineage ? `Level ${data.level || 1} ${lineage}` : (data.userName || data.email)}</p>
            </div>
            <Link to={`/characters/${data._id}`} className="secondary-action">
                Open Sheet
            </Link>
        </article>
    );
}
