import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import '../../styles/NavBar.css';

export function Links() {
    const { isAuthenticated, signOut } = useAuth();
    const navClassName = ({ isActive }) => (isActive ? 'link active' : 'link');

    return (
        <header className="nav">
            <div className="nav-inner">
                <Link to="/" className="brand-link">
                    Players Digital Binder
                </Link>
                <nav className="nav-actions" aria-label="Primary navigation">
                    <NavLink to="/" className={navClassName}>
                        Home
                    </NavLink>
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/characters" className={navClassName}>
                                Characters
                            </NavLink>
                            <button type="button" className="nav-button" onClick={signOut}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/signIn" className={navClassName}>
                                Sign In
                            </NavLink>
                            <NavLink to="/signUp" className={navClassName}>
                                Sign Up
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
