import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import createApp from '../src/index.js';
import microHTTP from '@tobiasgjerstrup/microhttp';

const app = new createApp();

app.get('/', (req, res) => {
    res.end('Hello World!');
});

app.post('/json', (req, res) => {
    res.end(req.body);
});

beforeAll(() => {
    app.listen(3000);
});

describe('Basic get request', () => {
    it('should work', async () => {
        const res = await microHTTP.get('http://localhost:3000/');
        expect(res.status).toBe(200);
        expect(res.body).toBe('Hello World!');
    });
});

describe('404 request', () => {
    it('should return 404', async () => {
        try {
            await microHTTP.get('http://localhost:3000/404');
        } catch (err) {
            expect(err.status).toBe(404);
            return;
        }

        throw new Error('Expected to throw');
    });
});

describe('JSON with no body', () => {
    it('should return 400', async () => {
        try {
            const res = await microHTTP.post('http://localhost:3000/json', {
                headers: {
                    'content-type': 'application/json',
                },
            });
        } catch (err) {
            expect(err.body).toBe('Invalid JSON');
            expect(err.status).toBe(400);
            return;
        }
        throw new Error('Expected to throw');
    });
});

/* describe('JSON with invalid body', () => {
    it('should return 400', async () => {
       try {
            const res = await microHTTP.post('http://localhost:3000/json', {
                headers: {
                    'content-type': 'application/json',
                },
                body: '{"invalidJson": true' // Missing closing }
            });
            console.log('🔥🔥🔥🔥🔥', res);
        } catch (err) {
            expect(err.body).toBe('Invalid JSON');
            expect(err.status).toBe(400);
            return;
        }
        throw new Error('Expected to throw');
    });
});

describe('JSON with valid body', () => {
    it('should work', async () => {
        try {
        const res = await microHTTP.post('http://localhost:3000/json', {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ validJson: true }),
        });
        expect(res.body).toEqual({ validJson: true });
        expect(res.status).toBe(200);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
}); */