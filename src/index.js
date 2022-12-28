import Proxy from "./App/Proxy.js";
import Process from "./App/Process.js";

import config from "./../config.json" assert { type: "json" };

config.processes.forEach((settings, index) => {
    const process = new Process(index, settings.command, settings.options, settings.rules);

    process.start();
});

const proxy = new Proxy(config.port, config.routes);
proxy.start();
