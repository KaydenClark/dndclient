import React from 'react'
import {
    Link,
  } from "react-router-dom";
// import axios from 'axios'
// import {
//     base
// } from '../../components/const'

// const PDBAPI = base

// const linkToCharacter = `${this.props.data.userName}`

export default class CharacterSheet extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            data: []
        } //State
    }//Constructor
    // console.log(props)
    render(){
        console.log(this.props.data._id)
        return(
            <div>
                <h1>
                    Characters Name: 
                    <Link 
                    to= {{pathname: './'+this.props.data.userName+'/'+this.props.data.characterName+'/'+this.props.data._id}}
                    >{` ${this.props.data.characterName}`}</Link>
                </h1>
            </div>
        )
    }
}