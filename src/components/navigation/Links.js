import React from 'react'
import { Link } from "react-router-dom";
import '../../styles/NavBar.css'

export const Links = () => {
    
    return (
        <div>
            <ul className= "ulList">
                <li className= "title"> 
                    <Link to= '/' className= "link"> Players Digital Binder </Link>
                </li>
                <li className= "search">
                    <form className= "linkSearch">
                        <input placeholder= "Search..." />
                    </form>
                </li>
                <li className= "liList">
                    <Link className= "NavButton">|||</Link>
                </li>
                <li className= "liList">
                    <Link className= "link" to= "/Character">Character</Link>
                </li>
                <li className= "liList">
                    <Link className= "link" to= "/equipment">Equipment</Link>
                </li>
                <li className= "liList">
                    <Link className= "link" to= "/spells">Spells</Link>
                </li>
            </ul>
        </div>
        )
}