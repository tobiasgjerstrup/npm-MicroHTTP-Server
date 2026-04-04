import createApp from '../../src/main.ts';

const app = createApp();

app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, world!');
});

app.get('/test', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, world!');
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Listening on http://127.0.0.1:3000');
});
