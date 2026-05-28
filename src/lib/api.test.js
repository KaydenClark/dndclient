// Tests for the API helper module. All axios calls are mocked so no network
// requests fire during the test run.
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('axios', () => {
    const axios = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    };
    return { default: axios };
});

// Import after mocking so the module picks up the mock.
import axios from 'axios';
import {
    createCharacter,
    fetchCharacterById,
    fetchCharacters,
    fetchCompendiumBootstrap,
    requestSignIn,
    requestSignUp,
    updateCharacter
} from './api';

const TOKEN = 'test-bearer-token';
const AUTH_HEADER = { headers: { Authorization: `Bearer ${TOKEN}` } };

beforeEach(() => {
    vi.resetAllMocks();
});

describe('requestSignIn', () => {
    test('POSTs to /signIn with credentials and returns data', async () => {
        axios.post.mockResolvedValue({ data: { token: 'jwt-abc' } });

        const result = await requestSignIn({ email: 'a@b.com', password: 'pw' });

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/signIn'),
            { email: 'a@b.com', password: 'pw' }
        );
        expect(result).toEqual({ token: 'jwt-abc' });
    });

    test('propagates axios errors to the caller', async () => {
        axios.post.mockRejectedValue(new Error('Network error'));
        await expect(requestSignIn({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(
            'Network error'
        );
    });
});

describe('requestSignUp', () => {
    test('POSTs to /signUp with payload', async () => {
        axios.post.mockResolvedValue({ data: { success: true } });

        await requestSignUp({ email: 'a@b.com', userName: 'Kayden', password: 'pw' });

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/signUp'),
            { email: 'a@b.com', userName: 'Kayden', password: 'pw' }
        );
    });
});

describe('fetchCharacters', () => {
    test('GETs /player with auth header and returns characters array', async () => {
        const characters = [{ _id: '1', characterName: 'Akta' }];
        axios.get.mockResolvedValue({ data: { characters } });

        const result = await fetchCharacters(TOKEN);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/player'),
            AUTH_HEADER
        );
        expect(result).toEqual(characters);
    });
});

describe('fetchCompendiumBootstrap', () => {
    test('GETs /compendium/bootstrap without auth', async () => {
        axios.get.mockResolvedValue({ data: { races: [], classes: [] } });

        const result = await fetchCompendiumBootstrap();

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/compendium/bootstrap')
        );
        expect(result).toEqual({ races: [], classes: [] });
    });
});

describe('createCharacter', () => {
    test('POSTs to /player with auth header and payload', async () => {
        const payload = { characterName: 'Bryer', raceId: 'human', classId: 'druid' };
        const created = { _id: 'new-1', ...payload };
        axios.post.mockResolvedValue({ data: { character: created } });

        const result = await createCharacter(TOKEN, payload);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/player'),
            payload,
            AUTH_HEADER
        );
        expect(result).toEqual(created);
    });
});

describe('fetchCharacterById', () => {
    test('GETs /player/:id with auth header', async () => {
        const character = { _id: 'char-42', characterName: 'Gribble' };
        axios.get.mockResolvedValue({ data: { character } });

        const result = await fetchCharacterById(TOKEN, 'char-42');

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/player/char-42'),
            AUTH_HEADER
        );
        expect(result).toEqual(character);
    });
});

describe('updateCharacter', () => {
    test('PUTs to /player/:id with auth header and payload', async () => {
        const payload = { currentHp: 15 };
        const updated = { _id: 'char-42', currentHp: 15 };
        axios.put.mockResolvedValue({ data: { character: updated } });

        const result = await updateCharacter(TOKEN, 'char-42', payload);

        expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('/player/char-42'),
            payload,
            AUTH_HEADER
        );
        expect(result).toEqual(updated);
    });
});
