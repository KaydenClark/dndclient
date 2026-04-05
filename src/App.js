import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { AuthProvider } from './context/auth';
import Main from './pages';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Main />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
