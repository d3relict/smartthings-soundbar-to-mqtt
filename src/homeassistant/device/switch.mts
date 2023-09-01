import { THomeAssistantConfig } from '../../schema/config.mjs';
import IDevice from '../interface/device.mjs';
import { MqttClient } from 'mqtt';

type TSetState = (value: boolean) => Promise<void>;

type TSwitchDependency = {
    client: MqttClient;
    setState: TSetState;
}

type TDevice = {
    identifiers: string[],
    name: string,
    manufacturer: string,
    model: string,
}

class Switch implements IDevice {
    #client: MqttClient;
    #config: THomeAssistantConfig;
    #device: TDevice;
    #payload: string[];
    #uniqueId: string;

    #state: Boolean | undefined;
    #setDeviceState: TSetState;

    #name: string;
    #label: string;

    get label(): string {
        return this.#label;
    }

    get type(): string {
        return this.constructor.name;
    }

    constructor(name: string, label: string, config: THomeAssistantConfig, { client, setState }: TSwitchDependency) {
        this.#config = config;
        const { uniqueId, device, payload: { switch: payload } } = this.#config;

        this.#name = name;
        this.#label = label;
        this.#device = device;
        this.#payload = payload;
        this.#uniqueId = `${uniqueId}-${label}`

        this.#client = client;
        this.#setDeviceState = setState;

        this.#init();
    }

    async destroy() {
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
        const stateTopic = `homeassistant/switch/${this.#uniqueId}/state`;
        const commandTopic = `homeassistant/switch/${this.#uniqueId}/set`;

        this.#client.on("message", async (topic, payload) => {
            if (topic != commandTopic) {
                return;
            }

            const newState = !!this.#payload.indexOf(payload.toString());

            await this.#setDeviceState(newState);
            this.updateState(newState);
        })

        this.#client.subscribe(commandTopic);

        this.#publishConfig({
            name: this.#name,
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
        this.#client.publish(stateTopic, this.#payload[+(this.#state || 0)]);
    }
}

export default Switch;