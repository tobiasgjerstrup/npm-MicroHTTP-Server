import { beforeAll, describe, it, expect } from 'vitest';
import createApp from '../src/index.js';
import microHTTP from '@tobiasgjerstrup/microhttp';
import { expectRequestToFail } from './helpers/assertions.js';

const app = createApp();
const baseUrl = 'http://localhost:3001';

app.post('/json', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(req.body));
});

app.post('/echo', (req, res) => {
    if (typeof req.body === 'string') {
        res.end(req.body);
        return;
    }

    res.end('no-body');
});

app.post('/json-type', (req, res) => {
    res.end(typeof req.body);
});

app.post('/form', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
        JSON.stringify({
            isUrlSearchParams: req.body instanceof URLSearchParams,
            fields: Object.fromEntries(req.body.entries()),
        }),
    );
});

beforeAll(() => {
    app.listen(3001);
});

describe('JSON body parsing', () => {
    it('returns 400 when content type is JSON but body is missing', async () => {
        await expectRequestToFail(
            () =>
                microHTTP.post(`${baseUrl}/json`, {
                    headers: {
                        'content-type': 'application/json',
                    },
                }),
            400,
            'Invalid JSON',
        );
    });

    it('returns 400 when content type is JSON but body is malformed', async () => {
        await expectRequestToFail(
            () =>
                microHTTP.post(`${baseUrl}/json`, {
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: '{"invalidJson": true',
                }),
            400,
            'Invalid JSON',
        );
    });

    it('parses valid JSON body and passes object to handler', async () => {
        const res = await microHTTP.post(`${baseUrl}/json`, {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ validJson: true }),
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ validJson: true });
    });

    it('parses JSON body when charset is included in content type', async () => {
        const res = await microHTTP.post(`${baseUrl}/json`, {
            headers: {
                'content-type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ supportsCharset: true }),
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ supportsCharset: true });
    });

    it('parses a double-stringified JSON payload', async () => {
        const res = await fetch(`${baseUrl}/json-type`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(JSON.stringify({ nested: true })),
        });
        const body = await res.text();

        expect(res.status).toBe(200);
        expect(body).toBe('object');
    });

    it('parses form-urlencoded body and passes URLSearchParams to handler', async () => {
        const res = await fetch(`${baseUrl}/form`, {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: 'name=Alice+Smith&role=admin',
        });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
            isUrlSearchParams: true,
            fields: {
                name: 'Alice Smith',
                role: 'admin',
            },
        });
    });

    it('parses text/plain as string', async () => {
        const res = await fetch(`${baseUrl}/echo`, {
            method: 'POST',
            headers: {
                'content-type': 'text/plain',
            },
            body: 'plain text',
        });

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('plain text');
    });
});
