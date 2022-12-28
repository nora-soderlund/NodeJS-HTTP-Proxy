import { spawn } from "child_process";

export default class Process {
    constructor(identifier, command, options, rules) {
        this.identifier = identifier;
        
        this.command = command;
        this.options = options;

        this.rules = rules;
    };

    #log(lines) {
        lines = lines.split('\n');

        lines.forEach((line) => {
            console.log(`[P${this.identifier} PID ${this.batch.pid}] ${line}`);
        });
    };

    #error(lines) {
        lines = lines.split('\n');

        lines.forEach((line) => {
            console.error(`[P${this.identifier} PID ${this.batch.pid}] ${line}`);
        });
    };

    start(attempt = 0) {
        if(attempt === this.rules["keep-alive-iteration-attempts"]) {
            this.#error("keep-alive stopped because of keep-alive-iteration-attempts");

            return;
        }

        try {
            this.batch = spawn(this.command, this.options);

            this.#log(`process started`);
        }
        catch(error) {
            this.#error(`process failed to start: ${error}`);

            this.start(attempt++);
            
            return;
        }

        try {
            this.batch.stdout.on("data", (data) => {
                this.#log(data.toString());
            });

            this.batch.stderr.on("data", (data) => {
                this.#error(data.toString());
            });

            this.batch.on("exit", (code) => {
                this.#log(`process exited with code ${code}`);

                if(this.rules["keep-alive-on-success"] && code === 0) {
                    this.#log(`attempting to start process again due to keep-alive-on-success`);

                    this.start(attempt++);
                }
                else if(this.rules["keep-alive-on-failure"] && code < 0) {
                    this.#log(`attempting to start process again due to keep-alive-on-failure`);

                    this.start(attempt++);
                }
            });
        }
        catch(error) {
            this.#error(error);
        }
    };
};
