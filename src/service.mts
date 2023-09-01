import config from 'config';
import fetch from 'node-fetch';
import mqtt, { MqttClient } from 'mqtt';

import { SmartThings } from './smartthings/index.mjs';
import { Bridge } from './homeassistant/index.mjs';
import { jsonClone } from './tool/object.mjs';

import { TServiceConfig, serviceConfigSchema } from './schema/config.mjs';

serviceConfigSchema.parse(config);
const serviceConfig = config as unknown as TServiceConfig;

const smartthings = new SmartThings(serviceConfig.smartthings, { fetch });

let bridge: Bridge;
let stateInterval: NodeJS.Timer;

console.log(serviceConfig);

const { url, username, password } = serviceConfig.mqtt;
const client: MqttClient = mqtt.connect(url, { username, password });

client.on('connect', () => {
    console.log('connected');
    const { homeassistant } = serviceConfig;

    bridge = new Bridge(homeassistant, { client });

    // advancedaudio feature switches
    [
        { name: 'night mode', label: SmartThings.advancedAudio.NIGHT_MODE },
        { name: 'bass boost', label: SmartThings.advancedAudio.BASS_BOOST },
        { name: 'voice amplifier', label: SmartThings.advancedAudio.VOICE_AMPLIFIER },
    ].map(({ name, label }) =>
        bridge.addSwitch(
            `${homeassistant.device.name} ${name}`,
            label,
            (value) => smartthings.setAdvancedAudioFeature(label, value)
        )
    );

    const getAdvancedAudioFeatures = async () => {
        const advancedAudioState = await smartthings.getAdvancedAudioFeatures();
        bridge.devices.forEach(ref => {
            console.log(ref.label, advancedAudioState);
            if (!advancedAudioState.hasOwnProperty(ref.label)) {
                return;
            }
            ref.updateState(advancedAudioState[ref.label]);
        });
    }

    stateInterval = setInterval(getAdvancedAudioFeatures, 3000);
});

const shutdown = async () => {
    clearInterval(stateInterval);
    await bridge.destroy();
    client.end();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.on('unhandledRejection', (reason: any) => {
    const detail = { reason: jsonClone(reason), stack: reason.stack };
    console.error('Unhandled rejection', detail);
});