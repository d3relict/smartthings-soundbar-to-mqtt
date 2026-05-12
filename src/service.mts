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
let availabilityInterval: NodeJS.Timer;

console.log(serviceConfig);

const { url, username, password } = serviceConfig.mqtt;
const { homeassistant } = serviceConfig;
const availabilityTopic = `homeassistant/${homeassistant.uniqueId}/availability`;
const [offlinePayload, onlinePayload] = homeassistant.payload.availability;

const client: MqttClient = mqtt.connect(url, {
    username,
    password,
    will: {
        topic: availabilityTopic,
        payload: Buffer.from(offlinePayload),
        qos: 1,
        retain: true,
    },
});

const publishOnline = () => {
    client.publish(availabilityTopic, onlinePayload, { retain: true });
};

const publishOffline = () => {
    client.publish(availabilityTopic, offlinePayload, { retain: true });
};

client.on('connect', async () => {
    console.log('connected');

    publishOnline();

    // Start or restart availability heartbeat (15 seconds)
    if (availabilityInterval) {
        clearInterval(availabilityInterval);
    }
    availabilityInterval = setInterval(publishOnline, 15 * 1000);

    if (bridge) {
        // Reconnection - just republish availability and configs
        bridge.republish();
        return;
    }

    bridge = new Bridge(homeassistant, { client, availabilityTopic });

    // advancedaudio feature switches
    [
        { name: 'night mode', label: SmartThings.advancedAudio.NIGHT_MODE },
        { name: 'bass boost', label: SmartThings.advancedAudio.BASS_BOOST },
        { name: 'voice amplifier', label: SmartThings.advancedAudio.VOICE_AMPLIFIER },
    ].map(({ name, label }) =>
        bridge.addSwitch(
            name,
            label,
            (value) => smartthings.setAdvancedAudioFeature(label, value)
        )
    );

    const getAdvancedAudioFeatures = async () => {
        const advancedAudioState = await smartthings.getAdvancedAudioFeatures();
        bridge.devices.forEach(ref => {
            console.log(`${ref.label} state: ${advancedAudioState[ref.label]}`);
            if (!advancedAudioState.hasOwnProperty(ref.label)) {
                return;
            }
            ref.updateState(advancedAudioState[ref.label]);
        });
    }

    // stateInterval = setInterval(getAdvancedAudioFeatures, 3000);

    const devices = await smartthings.getDevices();
    console.log(devices);
    getAdvancedAudioFeatures();
});

client.on('reconnect', () => {
    console.log('reconnecting...');
});

client.on('offline', () => {
    console.log('mqtt client offline');
});

client.on('error', (err) => {
    console.error('mqtt client error:', err);
});

const shutdown = async () => {
    // clearInterval(stateInterval);
    clearInterval(availabilityInterval);
    await bridge.destroy();
    publishOffline();
    client.end();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.on('unhandledRejection', (reason: any) => {
    const detail = { reason: jsonClone(reason), stack: reason.stack };
    console.error('Unhandled rejection', detail);
});