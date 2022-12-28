# NodeJS-HTTP-Proxy
Sets up a HTTP listener on one single public port that you can then route to another internal port, which can allow you to route different subdomains to different internal servers.

## Get started
1. Clone the repository
```git
git clone https://github.com/nora-soderlund/NodeJS-HTTP-Proxy
```
2. Set up config.json in the root directory as seen in the [examples](#examples) below.
3. Install the packages and run the start script:
```npm
npm install
npm run start
```

## Examples
For http://localhost and http://api.localhost to 2 different web servers:
```json
{
    "port": 80,

    "routes": [
        {
            "origin": "localhost",
            "target": "http://localhost:81"
        },
        
        {
            "origin": "api.localhost",
            "target": "http://localhost:82"
        }
    ],
    
    "processes": null
}

```

For two domains on a single machine, e.g. https://nora-soderlund.se and https://ridetracker.app:
```json
{
    "port": 80,

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
    ],
    
    "processes": null
}

```
### Processes
To automatically run processes (such as the web servers) on the start of the proxy server:
```json
{   
    "processes": [
        {
            "command": "cmd.exe",
            "options": [ "/K", "cd ../DeveloperBlog-Server && npm start" ]
        },
        
        {
            "command": "cmd.exe",
            "options": [ "/K", "cd ../RideTracker-Server && npm start" ]
        }
    ]
}
```

To keep the processes alive if they exit on success (exit code 0) or on failure (negative exit code).

Beware if you enable keep-alive-on-success, that you won't be able to close the process for good without closing the proxy. This can be good if you simply want to restart the server but ensure it's kept alive.
```json
{   
    "processes": [
        {
            "command": "cmd.exe",
            "options": [ "/K", "cd ../DeveloperBlog-Server && npm start" ],

            "rules": {
                "keep-alive-on-success": false,
                "keep-alive-on-error": true
            }
        },
        
        {
            "command": "cmd.exe",
            "options": [ "/K", "cd ../RideTracker-Server && npm start" ],

            "rules": {
                "keep-alive-on-success": false,
                "keep-alive-on-error": true
            }
        }
    ]
}
```

To put a maximum of restart attempts (to avoid a callstack overflow if errors keep appearing on start):
```json
{   
    "processes": [
        {
            "command": "cmd.exe",
            "options": [ "/K", "cd ../DeveloperBlog-Server && npm start" ],

            "rules": {
                "keep-alive-on-success": false,
                "keep-alive-on-error": true,

                "keep-alive-error-attempts": 2
            }
        },
        
        {
            "command": "cmd.exe",
            "options": [ "/K", "cd ../RideTracker-Server && npm start" ],

            "rules": {
                "keep-alive-on-success": false,
                "keep-alive-on-error": true,

                "keep-alive-error-attempts": 2
            }
        }
    ]
}
```
