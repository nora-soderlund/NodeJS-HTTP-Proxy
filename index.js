import http from "http";
import httpProxy from "http-proxy";

import { URL } from "url";

import fs, { write } from "fs";

const config = JSON.parse(fs.readFileSync("./config.json"));

const proxy = httpProxy.createProxyServer({});

function writeError(request, name, error) {
    try {
        console.error(`ERROR: ${error}`);
    
        fs.writeFileSync(`${config.logs}/${name}_${Date.now()}.json`, JSON.stringify({
            request: {
                headers: request.headers,
                url: request.url
            },
            error
        }));
    }
    catch(error) {
        console.error(`FAILED TO WRITE ERROR: ${error}`);
    }
};

proxy.on("error", (error, request, response) => {
    writeError(request, "proxy_error", error);

    try {
        response.writeHead(500);
    
        response.end();
    }
    catch(error) {
        writeError(request, "proxy_error", "Failed to end response!");
    }
});
 
const server = http.createServer((request, response) => {
    try {
        const method = request.method;
        const remoteAddress = request.socket.remoteAddress;

        const url = new URL(request.url, `http://${request.headers.host}`);

        if(!url.hostname || !url.hostname.length) {
            console.warn(`${remoteAddress} ${method} ${url.href}: missing HOST header`);

            writeError(request, "server_error", "Missing HOST header!");

            return response.end();
        }

        const subhost = url.hostname.substring(0, url.hostname.indexOf('.'));

        // serve public index
        if(config.allowedHosts.includes(url.hostname) || ([ "www" ]).includes(subhost)) {
            console.log(`${remoteAddress} ${method} ${url.href}: serving public index`);

            return proxy.web(request, response, { target: "http://localhost:81" });
        }
        
        // serve public api
        if(([ "api" ]).includes(subhost)) {
            console.log(`${remoteAddress} ${method} ${url.href}: serving public api`);

            return proxy.web(request, response, { target: "http://localhost:81" });
        }
        
        // serve demo api
        if(([ "demo" ]).includes(subhost)) {
            console.log(`${remoteAddress} ${method} ${url.href}: serving demo api`);

            return proxy.web(request, response, { target: "http://localhost:82" });
        }

        if(config.allowUnknownHost) {
            console.log(`${remoteAddress} ${method} ${url.href}: serving public index with allowUnknownHosts rule`);

            return proxy.web(request, response, { target: "http://localhost:81" });
        }

        console.log(`${remoteAddress} ${method} ${url.href}: missing handler!`);

        writeError(request, "server_error", "Missing handler!");

        return response.end();
    }
    catch(error) {
        writeError(request, "server_error", error);
    }
});
 
server.listen(80);

console.log("Listening to port 80");
