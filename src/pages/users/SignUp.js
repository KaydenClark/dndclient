import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { requestSignUp } from '../../lib/api';
import '../../styles/sign.css';

export function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await requestSignUp({
                email,
                userName,
                password
            });

            navigate('/signIn', {
                replace: true,
                state: {
                    from: { pathname: '/characters' }
                }
            });
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Unable to create that account.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="page-card form-card">
            <h1>Sign Up</h1>
            <p className="form-copy">Create a player account before joining or managing characters.</p>
            <form className="loginForm" onSubmit={handleSubmit}>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    id="userName"
                    type="text"
                    placeholder="User Name"
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                />
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                />
                {error ? <p className="form-error">{error}</p> : null}
                <button type="submit" className="primary-action" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
            <p className="form-copy">
                Already signed up? <Link to="/signIn">Go to sign in.</Link>
            </p>
        </section>
    );
}
