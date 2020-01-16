import React from 'react'
import {
    useHistory,
    useLocation
} from "react-router-dom";
import { Auth } from '../context/auth'

export const Login = () => {
    let history = useHistory();
    let location = useLocation();

    let { from } = location.state || { from: { pathname: "/" } };
    let login = (event, contextFunc) => {
        event.preventDefault()
        contextFunc(() => {
            history.replace(from);
        });
    };
    
    return (
        <Auth.Consumer>
            {({ authenticate }) =>(
            <div  className= "loginForm">
                <h1> Login </h1>
                <form onSubmit={(event) => login(event, authenticate)}>
                    <input id= "username" type="text" placeholder="Username" />
                    <input id= "password" type="password" placeholder="Password" />
                    <input type="submit" value= "Sign In" />
                </form>
            </div>
                )
            }
        </Auth.Consumer>
    )
}