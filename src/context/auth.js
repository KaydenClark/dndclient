import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pdb-token';

const Auth = createContext({
    isAuthenticated: false,
    signIn: () => {},
    signOut: () => {},
    token: ''
});

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

    useEffect(() => {
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
            return;
        }

        localStorage.removeItem(STORAGE_KEY);
    }, [token]);

    const value = useMemo(() => ({
        token,
        isAuthenticated: Boolean(token),
        signIn: (nextToken) => {
            setToken(nextToken);
        },
        signOut: () => {
            setToken('');
        }
    }), [token]);

    return <Auth.Provider value={value}>{children}</Auth.Provider>;
}

export function useAuth() {
    return useContext(Auth);
}

export { Auth, STORAGE_KEY };
