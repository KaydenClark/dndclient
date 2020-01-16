import React from 'react'
import {
    useHistory,
    useLocation
} from "react-router-dom";
import { Auth } from '../context/auth'

export const SignIn = () => {
    let history = useHistory();
    let location = useLocation();

    let { from } = location.state || { from: { pathname: "/" } };
    let signIn = (event, contextFunc) => {
        event.preventDefault()
        contextFunc(() => {
            history.replace(from);
        });
    };
    
    return (
        <Auth.Consumer>
            {({ authenticate }) =>(
            <div  className= "SignInForm">
                <h1> Sign In </h1>
                <form onSubmit={(event) => signIn(event, authenticate)}>
                    <input id= "username" type="text" placeholder="Username" />
                    <input id= "password" type="password" placeholder="Password" />
                    <input type="submit" value= "Sign In" />
                </form>
                <p>New Accout? <a href= "/signUp">Sign Up</a></p>
            </div>
                )
            }
        </Auth.Consumer>
    )
}