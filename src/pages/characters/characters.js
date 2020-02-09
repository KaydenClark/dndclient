import React from 'react'
import axios from 'axios'
import {
    base
} from '../../components/const'
import CharacterSheet from '../../components/characters/characterSheet'

const PDBAPI = base

export default class Characters extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            sheets: [],
            characters: []
        } //State
    } // Constructor

    renderCharacters = async (characters) => {
        console.log('rednering characters...')
        const sheets = await characters.map((sheet) =>
            <CharacterSheet 
                key= {sheet._id}
                data= {sheet} 
            />)
        console.log('Characters Rendered')
        console.log(sheets)
        this.setState({sheets})
    } //Render Characters

    getCharactersAxios = async () => {
        console.log('Connecting to get characters...')
        const characters = 
        await axios.get(`${PDBAPI}/player`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        })
        // console.log(characters.data.data[0]._id)
        this.renderCharacters(characters.data.data)
    } // Get Characters

    componentDidMount = async () => {
        await this.getCharactersAxios()
        // this.renderCharacters()
    } //Component Did Mount

    render(){

        return(
            <div className= "Characters">
                {this.state.sheets}
            </div>
        ) // Return
    } //Render
} // Characters