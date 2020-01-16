import React from "react"
import {
    Link
} from 'react-router-dom'

export default class Home extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            data: {}
        }
    }

    render(){
        return (
            <div className= "Home" >
                <h1>
                    Welcome
                </h1>
                <h3>
                    <Link to = "/login">Login</Link> <Link to = "/login/signUp">Sign Up</Link>
                </h3>
                <h1>
                    Players Digital Binder
                </h1>
            </div>
        ) //return 
    } //render
} //Home