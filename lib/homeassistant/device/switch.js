class Switch {
    #client;
    #config;
    #device;
    #payload;
    #uniqueId;

    #state;
    #setDeviceState;

    #stateInterval;

    #label;

    get label() {
        return this.#label;
    }

    get type() {
        return this.constuctor.name;
    }

    constructor(config, {client, setState}) {
        this.#config = config;
        const { label, uniqueId, device, payload: { switch: payload} } = this.#config;

        this.#label = label;
        this.#device = device;
        this.#payload = payload;
        this.#uniqueId = `${uniqueId}-${label}`

        this.#client = client;
        this.#setDeviceState = setState;

        this.#init();
    }

    async destroy() {
        clearInterval(this.#stateInterval);
        this.#publishConfig(null);
    }

    updateState(value) {
        if (this.#state !== value) {
            console.log(`updating ${this.#label} state to ${value}`);
        }
        this.#state = value;
        this.#publishState();
    }
    
    async #init() {
        const { name } = this.#config;
        const stateTopic = `homeassistant/switch/${this.#uniqueId}/state`;
        const commandTopic = `homeassistant/switch/${this.#uniqueId}/set`;

        this.#client.on("message", async (topic, payload) => {
            if (topic != commandTopic){
                return;
            }

            const newState = !!this.#payload.indexOf(payload.toString());
            
            await this.#setDeviceState(newState);
            this.updateState(newState);
        })
        
        this.#client.subscribe(commandTopic);
        
        this.#publishConfig({
            name,
            unique_id: this.#uniqueId,
            device_class: 'switch',
            state_topic: stateTopic,
            command_topic: commandTopic,
            payload_off: this.#payload[0],
            payload_on: this.#payload[1],
            device: this.#device,
            retain: true,
            optimistic: false,
        });
    };

    #publishConfig(config) {
        this.#client.publish(`homeassistant/switch/${this.#uniqueId}/config`, config ? JSON.stringify(config) : '');
    }

    #publishState() {
        const stateTopic = `homeassistant/switch/${this.#uniqueId}/state`;
        this.#client.publish(stateTopic, this.#payload[+this.#state]);
    }
}

module.exports = Switch;