import React, { useState } from 'react'
import {
    useHistory,
    useLocation
} from "react-router-dom";
import axios from 'axios'
import { Auth } from '../context/auth'

const API = 'http://localhost:5000/signIn'

export const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    let history = useHistory();
    let location = useLocation();

    const postSignInAxios = async () => {
        console.log("connected to server to validate Login")
        await axios.post(API, {
            userName: email,
            hash: password
        })
        .then(function(res) {
            console.log(res.data)
            if(res.data === 'Vaild user and password'){
                console.log(true)
            }else {
                console.log(false)
            }
        })
    }

    let { from } = location.state || { from: { pathname: "/" } };
    let signIn = async (event, contextFunc) => {
        event.preventDefault()
        alert("Signed In" + email)
        console.log(await postSignInAxios())
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
                <input id= "username" type="email" placeholder="Username" onChange= { event => {
                        const userName = event.target.value
                        setEmail(userName)
                        // console.log(email)
                    }}/> 
                <input id= "password" type="password" placeholder="Password" onChange= { event => {
                    const pswd = event.target.value
                    setPassword(pswd)
                    // console.log(pswd)
                }}/>
                <input type="submit" value= "Sign In" />
                </form>
                <p>New Accout? <a href= "/signUp">Sign Up</a></p>
            </div>
                )
            }
        </Auth.Consumer>
    )
}