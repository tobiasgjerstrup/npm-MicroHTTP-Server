import http from 'node:http';

function getRequestContentType(header: string | string[] | undefined) {
    const raw = Array.isArray(header) ? header[0] : (header ?? '');
    return raw.toLowerCase().split(';')[0].trim();
}

function parseJsonBody(body: string): unknown {
    let parsed: unknown = JSON.parse(body);

    // Some clients may stringify payloads more than once. Parse once more if needed.
    if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
    }

    return parsed;
}

function createApp() {
    const routes: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        path: string;
        handler: (req: http.IncomingMessage & { body?: unknown }, res: http.ServerResponse) => void;
    }[] = [];

    function addRoute(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        path: string,
        handler: (req: http.IncomingMessage & { body?: unknown }, res: http.ServerResponse) => void,
    ) {
        routes.push({ method, path, handler });
    }

    function matchRoute(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string) {
        return routes.find((r) => r.method === method && r.path === url);
    }

    function listen(port: number, hostnameOrCallback: string | (() => void), callback?: () => void) {
        const server = http.createServer((req: http.IncomingMessage & { body?: unknown }, res) => {
            const route = matchRoute(req.method as 'GET' | 'POST' | 'PUT' | 'DELETE', req.url ?? '');

            let body = '';
            req.on('data', (chunk: string) => {
                body += chunk;
            });

            req.on('end', () => {
                const contentType = getRequestContentType(req.headers['content-type']);
                if (contentType === 'application/json') {
                    try {
                        req.body = parseJsonBody(body);
                    } catch {
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Invalid JSON');
                        return;
                    }
                }

                if (route) {
                    route.handler(req, res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not found');
                }
            });
        });

        if (typeof hostnameOrCallback === 'function') {
            server.listen(port, hostnameOrCallback);
        } else {
            server.listen(port, hostnameOrCallback, callback);
        }
    }

    return {
        get: (path: string, handler: (req: http.IncomingMessage & { body?: unknown }, res: http.ServerResponse) => void) => {
            addRoute('GET', path, handler);
        },
        post: (path: string, handler: (req: http.IncomingMessage & { body?: unknown }, res: http.ServerResponse) => void) => {
            addRoute('POST', path, handler);
        },
        put: (path: string, handler: (req: http.IncomingMessage & { body?: unknown }, res: http.ServerResponse) => void) => {
            addRoute('PUT', path, handler);
        },
        delete: (path: string, handler: (req: http.IncomingMessage & { body?: unknown }, res: http.ServerResponse) => void) => {
            addRoute('DELETE', path, handler);
        },
        listen,
    };
}

export default createApp;
