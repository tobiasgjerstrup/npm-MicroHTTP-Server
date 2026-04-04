import http from 'node:http';

function createApp() {
    const routes: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        path: string;
        handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
    }[] = [];

    function addRoute(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        path: string,
        handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
    ) {
        routes.push({ method, path, handler });
    }

    function matchRoute(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string) {
        return routes.find((r) => r.method === method && r.path === url);
    }

    function listen(port: number, hostnameOrCallback: string | (() => void), callback?: () => void) {
        const server = http.createServer((req, res) => {
            const route = matchRoute(req.method as 'GET' | 'POST' | 'PUT' | 'DELETE', req.url ?? '');

            if (route) {
                route.handler(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not found');
            }
        });

        if (typeof hostnameOrCallback === 'function') {
            server.listen(port, hostnameOrCallback);
        } else {
            server.listen(port, hostnameOrCallback, callback);
        }
    }

    return {
        get: (path: string, handler: (req: http.IncomingMessage, res: http.ServerResponse) => void) => {
            addRoute('GET', path, handler);
        },
        post: (path: string, handler: (req: http.IncomingMessage, res: http.ServerResponse) => void) => {
            addRoute('POST', path, handler);
        },
        put: (path: string, handler: (req: http.IncomingMessage, res: http.ServerResponse) => void) => {
            addRoute('PUT', path, handler);
        },
        delete: (path: string, handler: (req: http.IncomingMessage, res: http.ServerResponse) => void) => {
            addRoute('DELETE', path, handler);
        },
        listen,
    };
}

export default createApp;
