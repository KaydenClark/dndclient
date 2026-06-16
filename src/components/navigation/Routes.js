import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/auth';
import PlayersCharacter from '../../pages/characters/playersCharacter';
import CharactersList from '../../pages/characters/charactersList';
import CharacterNew from '../../pages/characters/CharacterNew';
import Home from '../../pages/home/home';
import { SignIn } from '../../pages/users/SignIn';
import { SignUp } from '../../pages/users/SignUp';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signIn" replace state={{ from: location }} />;
    }

    return children;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signIn" element={<SignIn />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route
                path="/characters"
                element={(
                    <ProtectedRoute>
                        <CharactersList />
                    </ProtectedRoute>
                )}
            />
            {/* Static /characters/new is matched ahead of the dynamic
                /characters/:characterId route by react-router's ranking. */}
            <Route
                path="/characters/new"
                element={(
                    <ProtectedRoute>
                        <CharacterNew />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/characters/:characterId"
                element={(
                    <ProtectedRoute>
                        <PlayersCharacter />
                    </ProtectedRoute>
                )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
