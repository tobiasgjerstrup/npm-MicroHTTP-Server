# MicroHTTP Server

A small, lightweight, zero-dependency wrapper around Node.js' built-in `http` module for quickly defining route handlers.

## Installation

```sh
npm install @tobiasgjerstrup/microhttp-server
```

## Usage

```ts
import createApp from '@tobiasgjerstrup/microhttp-server';

const app = createApp();

app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, world!');
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Listening on http://127.0.0.1:3000');
});
```

## API

### `createApp()`

Returns an app instance with the following methods:

#### `app.get(path, handler)`

#### `app.post(path, handler)`

#### `app.put(path, handler)`

#### `app.delete(path, handler)`

Register a route handler for the given HTTP method and path.

- `path` — exact URL path to match (e.g. `"/users"`)
- `handler(req, res)` — standard Node.js `http.IncomingMessage` / `http.ServerResponse` handler

#### `app.listen(port, callback)`

#### `app.listen(port, hostname, callback)`

Start the HTTP server on the given port and optional hostname.

Unmatched routes respond with `404 Not Found`.

## License

ISC
