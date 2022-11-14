import mysql from "mysql";
import fs from "fs";

export default class Database {
    static connection = null;

    static connectAsync(settings, logs) {
        this.settings = settings;
        this.logs = logs;

        return new Promise((resolve) => {
            this.connection = mysql.createPool(this.settings);

            this.connection.getConnection((error) => {
                if(error) {
                    console.error(`ERROR! MySQL connection failed: ${error}`);
                    this.error("connection", { error });
                    
                    return;
                }

                return resolve();
            });

            this.connection.on("error", function(error) {
                console.error(`ERROR! Fatal MySQL failure: ${error}`);
                this.error("fatal", { error });

                this.diagnose();
            });
        });
    };

    static queryAsync(query) {
        return new Promise((resolve) => {
            try {
                this.connection.query(query, (error, rows) => {
                    if(error) {
                        console.error(`ERROR! MySQL query error: ${error}`);
                        this.error("fatal", { query, error });
                        
                        return;
                    }
    
                    return resolve(rows);
                });
            }
            catch(error) {
                console.error(`ERROR! MySQL query failed: ${error}`);
                this.error("query", { query, error });

                this.diagnose();
            }
        });
    };

    static diagnose() {
        try {
            console.warn("WARNING! Attempting to diagnose MySQL server state...");

            const ping = connection.ping((error) => {
                console.error(`ERROR: failed to talk with the MySQL server: ${error}`);
                this.error("diagnose", { query, error });

                console.warn(`WARNING! Attempting to restart the MySQL server connection...`);
                this.connectAsync(this.settings).then(() => {
                    this.diagnose();
                }).catch((error) => {
                    console.error(`ERROR! Couldn't reconnect to the MySQL server: ${error}`);
                    this.error("diagnose", { error });
                });
            });

            if(ping)
                console.log("Ping to the MySQL server was succesful!");
        }
        catch(error) {
            console.error(`ERROR! Diagnose failed: ${error}`);
            this.error("diagnose", { error });
        }
    };

    static error(category, object) {
        const name = `mysql_${category}_${Date.now()}.json`;

        if(!fs.existsSync(this.logs))
            fs.mkdirSync(this.logs);
                
        fs.writeFileSync(this.logs + name, JSON.stringify(object));
    };
};
