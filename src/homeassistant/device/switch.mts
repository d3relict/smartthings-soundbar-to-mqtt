import { THomeAssistantConfig } from '../../schema/config.mjs';
import IDevice from '../interface/device.mjs';
import { MqttClient } from 'mqtt';

type TSetState = (value: boolean) => Promise<void>;

type TSwitchDependency = {
    client: MqttClient;
    setState: TSetState;
    availabilityTopic: string;
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
    #availabilityPayload: string[];
    #statePayload: string[];
    #uniqueId: string;

    #state: Boolean | undefined;
    #setDeviceState: TSetState;

    #name: string;
    #label: string;

    #stateTopic: string;
    #commandTopic: string;
    #availabilityTopic: string;

    #discoveryConfig: object | null = null;

    get label(): string {
        return this.#label;
    }

    get type(): string {
        return this.constructor.name;
    }

    constructor(name: string, label: string, config: THomeAssistantConfig, { client, setState, availabilityTopic }: TSwitchDependency) {
        this.#config = config;
        const { uniqueId, device, payload: { availability: availabilityPayload, switch: statePayload } } = this.#config;

        this.#name = name;
        this.#label = label;
        this.#device = device;
        this.#statePayload = statePayload;
        this.#availabilityPayload = availabilityPayload;
        this.#uniqueId = `${uniqueId}-${label}`

        this.#stateTopic = `homeassistant/switch/${this.#uniqueId}/state`;
        this.#commandTopic = `homeassistant/switch/${this.#uniqueId}/set`;
        this.#availabilityTopic = availabilityTopic;

        this.#client = client;
        this.#setDeviceState = setState;

        this.#init();
    }

    async destroy() {
        this.#publishConfig(null);
    }

    republish() {
        if (this.#discoveryConfig) {
            this.#publishConfig(this.#discoveryConfig);
        }
        if (this.#state !== undefined) {
            this.#publishState();
        }
    }

    updateState(value) {
        if (this.#state !== value) {
            console.log(`updating ${this.#label} state to ${value}`);
        }
        this.#state = value;
        this.#publishState();
    }

    async #init() {
        this.#client.on("message", async (topic, payload) => {
            if (topic != this.#commandTopic) {
                return;
            }

            const newState = !!this.#statePayload.indexOf(payload.toString());

            await this.#setDeviceState(newState);
            this.updateState(newState);
        })

        this.#client.subscribe(this.#commandTopic);

        this.#discoveryConfig = {
            name: this.#name,
            unique_id: this.#uniqueId,
            device_class: 'switch',
            availability_topic: this.#availabilityTopic,
            state_topic: this.#stateTopic,
            command_topic: this.#commandTopic,
            payload_off: this.#statePayload[0],
            payload_on: this.#statePayload[1],
            payload_not_available: this.#availabilityPayload[0],
            payload_available: this.#availabilityPayload[1],
            device: this.#device,
            retain: true,
            optimistic: false,
        };

        this.#publishConfig(this.#discoveryConfig);
    };

    #publishConfig(config) {
        this.#client.publish(`homeassistant/switch/${this.#uniqueId}/config`, config ? JSON.stringify(config) : '', { retain: true });
    }

    #publishState() {
        this.#client.publish(this.#stateTopic, this.#statePayload[+(this.#state || 0)], { retain: true });
    }
}

export default Switch;