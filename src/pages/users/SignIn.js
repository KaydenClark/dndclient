import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import { requestSignIn } from '../../lib/api';
import '../../styles/sign.css';

export function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/characters';

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const { token } = await requestSignIn({ email, password });
            signIn(token);
            navigate(from, { replace: true });
        } catch (requestError) {
            setError(
                requestError.response?.data?.error || 'Unable to sign in with that email and password.'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="page-card form-card">
            <h1>Sign In</h1>
            <p className="form-copy">Use your email and password to load your character roster.</p>
            <form className="loginForm" onSubmit={handleSubmit}>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                {error ? <p className="form-error">{error}</p> : null}
                <button type="submit" className="primary-action" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <p className="form-copy">
                Need an account? <Link to="/signUp">Create one here.</Link>
            </p>
        </section>
    );
}
