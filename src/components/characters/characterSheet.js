import React from 'react'
// import axios from 'axios'
// import {
//     base
// } from '../../components/const'

// const PDBAPI = base

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
                Characters Name: {this.props.data.characterName}
            </div>
        )
    }
}