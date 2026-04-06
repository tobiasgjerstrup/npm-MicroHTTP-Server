import { describe, it, expect } from 'vitest';
import createApp from '../src/index.js';
import microHTTP from '@tobiasgjerstrup/microhttp';

describe('listen overloads', () => {
    it('supports listen(port, callback)', async () => {
        const app = createApp();
        const baseUrl = 'http://localhost:3002';

        app.get('/health', (req, res) => {
            res.end('ok');
        });

        await new Promise((resolve) => {
            app.listen(3002, resolve);
        });

        const res = await microHTTP.get(`${baseUrl}/health`);
        expect(res.status).toBe(200);
        expect(res.body).toBe('ok');
    });

    it('supports listen(port, hostname, callback)', async () => {
        const app = createApp();
        const baseUrl = 'http://127.0.0.1:3003';

        app.get('/health', (req, res) => {
            res.end('ok-hostname');
        });

        await new Promise((resolve) => {
            app.listen(3003, '127.0.0.1', resolve);
        });

        const res = await microHTTP.get(`${baseUrl}/health`);
        expect(res.status).toBe(200);
        expect(res.body).toBe('ok-hostname');
    });
});
