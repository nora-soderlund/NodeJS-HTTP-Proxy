# NodeJS-HTTP-Proxy
Sets up a HTTP listener on one single public port that you can then route to another internal port, which can allow you to route different subdomains to different internal servers.

## Get started
1. Clone the repository
```git
git clone https://github.com/nora-soderlund/NodeJS-HTTP-Proxy
```
2. Set up config.json as seen in the examples below.
3. Install the packages
```npm
npm install
```
4. Run with node or nodemon:
```bat
npm run start
```
```bat
npm run dev
```

## Example
For a plain web server with a seperate API http://localhost and and http://api.localhost:
```json
{
    "port": 80,
    
    "rules": {
        "allowed-hosts": [ "localhost" ]
    },

    "routes": [
        {
            "origin": "localhost",
            "target": "http://localhost:81"
        },
        
        {
            "origin": "api.localhost",
            "target": "http://localhost:82"
        }
    ]
}

```

For two domains on a single server, e.g. https://nora-soderlund.se and https://ridetracker.app:
```json
{
    "port": 80,
    
    "rules": {
        "allowed-hosts": [ "nora-soderlund.se", "ridetracker.app" ]
    },

    "routes": [
        {
            "origin": [ "nora-soderlund.se", "www.nora-soderlund.se" ],
            "target": "http://localhost:81"
        },

        {
            "origin": "api.nora-soderlund.se",
            "target": "http://localhost:82"
        },
        
        {
            "origin": [ "ridetracker.app", "www.ridetracker.app" ],
            "target": "http://localhost:83"
        },
        
        {
            "origin": "api.ridetracker.app",
            "target": "http://localhost:84"
        }
    ]
}

```
