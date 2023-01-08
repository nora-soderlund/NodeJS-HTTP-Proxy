import http from "http";
import httpProxy from "http-proxy";
import { URL } from "url";
import fs from "fs";

export default class Proxy {
    constructor(port, routes) {
        this.port = port;
        this.routes = routes;

        this.proxy = httpProxy.createProxyServer({});

        this.proxy.on("error", (error, request, response) => {
            console.error(error);

            try {
                response.writeHead(500);
            
                response.end();
            }
            catch(error) {
                console.error("Failed to end response!");
            }
        });
    };

    start() {
        const server = http.createServer((request, response) => {
            try {
                const url = new URL(request.url, `http://${request.headers.host}`);

                const method = request.method;
                const remoteAddress = request.headers["cf-connecting-ip"] ?? request.socket.remoteAddress;

                if(!url.hostname || !url.hostname.length) {
                    console.error(`${remoteAddress} ${method} ${url.hostname}: missing HOST header`);

                    return response.end();
                }

                const route = this.routes.find((host) => {
                    if(typeof host.origin == "string")
                        return host.origin == url.hostname;

                    return host.origin.includes(url.hostname);
                });

                if(!route) {
                    console.error(`${remoteAddress} ${method} ${url.hostname}: missing route`);

                    return response.end();
                }

                console.log(`${remoteAddress} ${method} ${url.hostname}: ${route.target}`);

                request.headers["proxy-ip"] = remoteAddress;

                return this.proxy.web(request, response, { target: route.target });
            }
            catch(error) {
                console.error(error);
            }
        });

        server.listen(this.port);
    };
};
