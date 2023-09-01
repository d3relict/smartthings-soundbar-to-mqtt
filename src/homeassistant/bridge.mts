import Switch from './device/switch.mjs';
import IDevice from './interface/device.mjs';
import { THomeAssistantConfig } from '../schema/config.mjs';
import { MqttClient } from 'mqtt';

type THomeAssistantDependency = { client: MqttClient };

class Bridge {
    #config: THomeAssistantConfig;
    #client: MqttClient;
    #devices: IDevice[];

    get devices() {
        return this.#devices;
    }

    constructor(config: THomeAssistantConfig, { client }: THomeAssistantDependency) {
        this.#config = config;
        this.#client = client;
        this.#devices = [];
        console.log(config);
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
            })
        );
    }
}

export default Bridge;