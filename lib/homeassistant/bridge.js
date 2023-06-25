const Switch = require('./device/switch');

class Bridge {
    #config;
    #client;
    #devices = [];

    get devices() {
        return this.#devices;
    }

    constructor(config, {client}) {
        this.#config = config;
        this.#client = client;
    }

    destroy() {
        return Promise.all(this.#devices.map(device => device.destroy()));
    }

    addSwitch(name, label, setState) {
        this.#devices.push(
            new Switch({
                name, 
                label, 
                ...this.#config,
            }, {
                client: this.#client, 
                setState,
            })
        );
    }
}

module.exports = Bridge;