import React from 'react'

export const Auth = React.createContext({
    isAuthenticated: false,
    authenticate : () => {},
    signout : () => { }
});