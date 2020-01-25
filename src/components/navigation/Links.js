import React from 'react'
import { Link } from "react-router-dom";
import '../../style/NavBar.css'

export const Links = () => {
    
    return (
        <div>
            <ul className= "ulList">
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