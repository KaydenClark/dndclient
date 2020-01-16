import React from 'react'
import {
    // BrowserRouter as Router,
    Switch,
    Route,
    // Link,
    // Redirect
  } from "react-router-dom";
// import PrivateRoute from './PrivateRoute'
import {Login} from '../../pages/Login'
import Home from '../home/home'


export const Routes = () => {

    return (
        <div>
            <Switch>
                <Route exact path= "/">
                    <HomePage />
                </Route>
                <Route exact path= "/login">
                    <Login />
                </Route>
                <Route path= "/login/signup">
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