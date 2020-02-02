import React from 'react'
import { Link } from "react-router-dom";
import '../../style/NavBar.css'

export const Links = () => {
    
    return (
        <div>
            <ul className= "ulList">
                <li className= "title"> 
                    <Link to= '/about' className= "link"> Players Digital Binder </Link>
                </li>
                <li className= "search">
                    <form className= "linkSearch">
                        <input placeholder= "Search..." />
                    </form>
                </li>
                <li className= "liList">
                    <Link className= "link" to= "/">Home</Link>
                </li>
                <li className= "liList">
                    <Link className= "link" to= "/dnd">D&D</Link>
                </li>
            </ul>
        </div>
        )
}