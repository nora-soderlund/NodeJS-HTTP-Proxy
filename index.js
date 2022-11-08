import http from "http";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer({});
 
const server = http.createServer((request, response) => {
    const method = request.method;
    const remoteAddress = request.socket.remoteAddress;

    const host = request.headers.host;
    const url = request.url.toLowerCase();

    console.log(`${remoteAddress} ${method} ${url}`);

    if(!host || !host.length) {
        console.warn(`${remoteAddress} ${method} ${url}: missing HOST header`);

        return response.end();
    }

    const subhost = host.substring(0, host.indexOf('.'));

    // serve public index
    if(([ "ridetracker.app", "localhost" ]).includes(url) || ([ "www" ]).includes(subhost)) {
        console.log(`${remoteAddress} ${method} ${url}: serving public index`);

        return proxy.web(request, response, { target: "http://localhost:81" });
    }
    
    // serve public api
    if(([ "api" ]).includes(subhost)) {
        console.log(`${remoteAddress} ${method} ${url}: serving public api`);

        return proxy.web(request, response, { target: "http://localhost:81" });
    }
    
    // serve demo api
    if(([ "demo" ]).includes(subhost)) {
        console.log(`${remoteAddress} ${method} ${url}: serving demo api`);

        return proxy.web(request, response, { target: "http://localhost:82" });
    }

    console.log(`${remoteAddress} ${method} ${url}: missing handler!`);

    response.end();
});
 
server.listen(80);

console.log("Listening to port 80");
