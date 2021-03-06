import React, { useState } from 'react'
import {
    useHistory,
    useLocation
} from "react-router-dom";
import axios from 'axios'
import { Auth } from '../../context/auth'
import '../../styles/sign.css'
import {
    base, 
    // currentAPI
} from '../../components/const'

const API = base

export const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    let history = useHistory();
    let location = useLocation();

    const postSignInAxios = async () => {
        console.log("connected to server to validate Login")
        const result = await axios.post(`${API}/signIn`, {
            email: email,
            hash: password
        })
        .then(function(res) {
            if(res.data){
                localStorage.setItem('jwt', res.data)
                return true
            }else {
                return false
            }
        })
        return result
    }

    let { from } = location.state || { from: { pathname: "/" } };
    let signIn = async (event, contextFunc) => {
        event.preventDefault()
        const valid = await postSignInAxios()
        // console.log(await postSignInAxios())
        if (valid){
        alert("Signed In" + email)
        // await postSignInAxios()
        contextFunc(() => {
            history.replace(from);
        });
        } else {
            alert("invaid user and password")
    }
    };
    
    return (
        <Auth.Consumer>
            {({ authenticate }) =>(
            <div  className= "loginForm">
                <h1> Sign In </h1>
                <form onSubmit={(event) => signIn(event, authenticate)}>
                <input id= "email" type="email" placeholder="Email" onChange= { event => {
                        const email = event.target.value
                        setEmail(email)
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