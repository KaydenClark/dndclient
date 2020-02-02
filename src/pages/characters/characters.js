import React from 'react'
import axios from 'axios'
import {
    base
} from '../../components/const'

const PDBAPI = base

export default class Characters extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            sheets: []
        } //State
    } // Constructor

    renderCharacters = (characters) => {
        console.log(characters)
        // this.setState({characters})
    } //Render Characters

    getCharactersAxios = async () => {
        console.log('Connecting to get characters...')
        const [characters] = await Promise.all([
            axios.get(`${PDBAPI}/player/allPlayerData`),
        ])
        // console.log(characters.data.data)
        this.renderCharacters(characters.data.data)
    } // Get Characters

    componentDidMount = async () => {
        await this.getCharactersAxios()
        this.renderCharacters()
    } //Component Did Mount

    render(){

        return(
            <div className= "Characters">
                {this.state.sheets}
            </div>
        ) // Return
    } //Render
} // Characters