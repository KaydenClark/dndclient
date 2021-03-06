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
import CharactersList from '../../pages/characters/charactersList'


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
                <Route path= "/Character">
                    <CharacterSheetsList />
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

const CharacterSheetsList = () => {
    return(
        <CharactersList />
    )
}