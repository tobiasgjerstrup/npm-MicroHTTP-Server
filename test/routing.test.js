import { beforeAll, describe, it, expect } from 'vitest';
import createApp from '../src/index.js';
import microHTTP from '@tobiasgjerstrup/microhttp';
import { expectRequestToFail } from './helpers/assertions.js';

const app = createApp();
const baseUrl = 'http://localhost:3000';

app.get('/', (req, res) => {
    res.end('Hello World!');
});

app.put('/users', (req, res) => {
    res.end('Updated user');
});

app.delete('/users', (req, res) => {
    res.end('Deleted user');
});

beforeAll(() => {
    app.listen(3000);
});

describe('Routing', () => {
    it('returns payload for a known route', async () => {
        const res = await microHTTP.get(`${baseUrl}/`);
        expect(res.status).toBe(200);
        expect(res.body).toBe('Hello World!');
    });

    it('returns 404 for an unknown route', async () => {
        await expectRequestToFail(() => microHTTP.get(`${baseUrl}/404`), 404, 'Not found');
    });

    it('supports PUT handlers', async () => {
        const res = await microHTTP.put(`${baseUrl}/users`);
        expect(res.status).toBe(200);
        expect(res.body).toBe('Updated user');
    });

    it('supports DELETE handlers', async () => {
        const res = await fetch(`${baseUrl}/users`, { method: 'DELETE' });
        const body = await res.text();

        expect(res.status).toBe(200);
        expect(body).toBe('Deleted user');
    });

    it('returns 404 when method does not match an existing path', async () => {
        await expectRequestToFail(() => microHTTP.post(`${baseUrl}/users`), 404, 'Not found');
    });

    it('does exact path matching and rejects query-string variants', async () => {
        await expectRequestToFail(() => microHTTP.get(`${baseUrl}/?debug=true`), 404, 'Not found');
    });
});
