import axios from 'axios';

import { base } from '../components/const';

function authConfig(token) {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

export async function requestSignIn(credentials) {
    const response = await axios.post(`${base}/signIn`, credentials);
    return response.data;
}

export async function requestSignUp(payload) {
    const response = await axios.post(`${base}/signUp`, payload);
    return response.data;
}

export async function fetchCharacters(token) {
    const response = await axios.get(`${base}/player`, authConfig(token));
    return response.data.characters;
}

export async function fetchCompendiumBootstrap() {
    const response = await axios.get(`${base}/compendium/bootstrap`);
    return response.data;
}

export async function createCharacter(token, payload) {
    const response = await axios.post(`${base}/player`, payload, authConfig(token));
    return response.data.character;
}

export async function fetchCharacterById(token, characterId) {
    const response = await axios.get(`${base}/player/${characterId}`, authConfig(token));
    return response.data.character;
}

export async function updateCharacter(token, characterId, payload) {
    const response = await axios.put(`${base}/player/${characterId}`, payload, authConfig(token));
    return response.data.character;
}
