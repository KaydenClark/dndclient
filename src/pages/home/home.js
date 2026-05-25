import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/auth';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <section className="page-card hero-card">
            <p className="eyebrow">Dungeon & Dragons</p>
            <h1>Players Digital Binder</h1>
            <p className="lead">
                A shared space for players and the DM to keep character sheets,
                session-ready details, and campaign data in one place.
            </p>
            <div className="hero-actions">
                {isAuthenticated ? (
                    <Link to="/characters" className="primary-action">
                        Open Character List
                    </Link>
                ) : (
                    <>
                        <Link to="/signIn" className="primary-action">
                            Sign In
                        </Link>
                        <Link to="/signUp" className="secondary-action">
                            Create Account
                        </Link>
                    </>
                )}
            </div>
        </section>
    );
}
