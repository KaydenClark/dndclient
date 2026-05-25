import React from 'react';

import { Links } from '../components/navigation/Links';
import { AppRoutes } from '../components/navigation/Routes';

export default function Main() {
    return (
        <div className="app-shell">
            <Links />
            <main className="page-shell">
                <AppRoutes />
            </main>
        </div>
    );
}
