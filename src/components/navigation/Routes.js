import React from 'react'
import {
    // BrowserRouter as Router,
    Switch,
    Route,
    // Link,
    // Redirect
  } from "react-router-dom";
// import PrivateRoute from './PrivateRoute'
import { SignIn } from '../../pages/SignIn'
import { SignUp } from '../../pages/SignUp'
import Home from '../home/home'


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
                <Route path= "/dnd">
                    <h1>Hello World</h1>
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