import Switch from './device/switch.mjs';
import { THomeAssistantConfig } from '../schema/config.mjs';
import { MqttClient } from 'mqtt';

type THomeAssistantDependency = { client: MqttClient; availabilityTopic: string };

class Bridge {
    #config: THomeAssistantConfig;
    #client: MqttClient;
    #devices: Switch[];
    #availabilityTopic: string;

    get devices() {
        return this.#devices;
    }

    constructor(config: THomeAssistantConfig, { client, availabilityTopic }: THomeAssistantDependency) {
        this.#config = config;
        this.#client = client;
        this.#devices = [];
        this.#availabilityTopic = availabilityTopic;
        console.log(config);
    }

    republish() {
        this.#devices.forEach(device => device.republish());
    }

    destroy() {
        return Promise.all(this.#devices.map(device => device.destroy()));
    }

    addSwitch(name: string, label: string, setState: (value: boolean) => Promise<void>) {
        this.#devices.push(
            new Switch(
                name,
                label,
                this.#config, {
                client: this.#client,
                setState,
                availabilityTopic: this.#availabilityTopic,
            })
        );
    }
}

export default Bridge;