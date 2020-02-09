import React from 'react'
import {
    // BrowserRouter as Router,
    Switch,
    Route,
    // Link,
    // Redirect
  } from "react-router-dom";
// import PrivateRoute from './PrivateRoute'
import { SignIn } from '../../pages/users/SignIn'
import { SignUp } from '../../pages/users/SignUp'
import Home from '../../pages/home/home'
import Characters from '../../pages/characters/characters'


export const Routes = () => {

    return (
        <div>
            <Switch>
                <Route exact path= "/">
                    <HomePage />
                </Route>
                <Route exact path= "/signIn">
                    <SignIn />
                </Route>
                <Route path= "/signUp">
                    <SignUp />
                </Route>
                <Route path= "/player">
                    <CharacterSheets />
                </Route>
            </Switch>
        </div>
    )
}

const HomePage = () => {
    return(
        <Home />
    )
}

const CharacterSheets = () => {
    return(
        <Characters />
    )
}