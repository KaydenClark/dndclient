import React from 'react'
import { Link } from "react-router-dom";

export const Links = () => {
    
    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to= "/">Home</Link>
                    </li>
                    <li>
                        <Link to= "/dnd">D&D</Link>
                    </li>
                </ul>
            </nav>
        </div>
        )
}