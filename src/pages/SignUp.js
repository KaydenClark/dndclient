import React, { useState } from 'react'
import {
    useHistory,
    useLocation
} from "react-router-dom";
import axios from 'axios'
import { Auth } from '../context/auth'

const API = 'http://localhost:5000/signUp'


export const SignUp = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')

    let history = useHistory();
    let location = useLocation();

    const postSignUpAxios = async () => {
        console.log('connected to server to create new user')
        const result = await axios.post(API, {
            userName: email,
            hash: password
        })
        return result
    }

    let { from } = location.state || { from: { pathname: "/signIn" } };
    let signUp = (event, contextFunc) => {
        event.preventDefault()
        if(password === passwordConfirm){
            alert("New user Made: " + email)
            postSignUpAxios()
            contextFunc(() => {
                history.replace(from);
            });
        } else {
            alert("Passwords do not match")
        }
    };
    
    return (
        <Auth.Consumer>
            {({ authenticate }) =>(
            <div  className= "loginForm">
                <h1> Sign Up </h1>
                <form onSubmit={(event) => signUp(event, authenticate)}>
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
                    <input id= "passwordConfirm" type="password" placeholder="Confirm Password" onChange= { event => {
                        const pswdConfirm = event.target.value
                        setPasswordConfirm(pswdConfirm)
                        // console.log(pswdConfirm)
                    }}/>
                    <input type="submit" value= "Sign In" />
                </form>
            </div>
                )
            }
        </Auth.Consumer>
    )
}