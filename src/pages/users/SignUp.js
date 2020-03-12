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


export const SignUp = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [userName, setUserName] = useState('')

    let history = useHistory();
    let location = useLocation();

    const postSignUpAxios = async () => {
        console.log('connected to server to create new user')
        const result = await axios.post(`${API}/signUp`, {
            userName: userName,
            email: email, 
            hash: password
        })
        return result
    }

    let { from } = location.state || { from: { pathname: "/signIn" } };
    let signUp = async (event, contextFunc) => {
        event.preventDefault()
        if(password === passwordConfirm){
            let makeUser = await postSignUpAxios()
            console.log(makeUser)
            if(makeUser.data){
                alert("New user Made: " + email)
                contextFunc(() => {
                    history.replace(from);
                })
            } else {
                alert("User exsists")
            }
;
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
                    <input id= "email" type="email" placeholder="Email" onChange= { event => {
                        const email = event.target.value
                        setEmail(email)
                        // console.log(email)
                    }}/> 
                    <input id= "userName" type="text" placeholder="User Name" onChange= { event => {
                        const userName = event.target.value
                        setUserName(userName)
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