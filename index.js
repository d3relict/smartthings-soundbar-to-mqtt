const config = require('config');
const fetch = require('node-fetch');
const mqtt = require('mqtt');

const {Bridge} = require('./lib/homeassistant');
const {SmartThings} = require('./lib/smartthings');

const { mqtt: { url, username, password } } = config;

let bridge;
let smartthings;
let stateInterval;

const client = mqtt.connect(url, {username, password});
client.on('connect', () => {
    console.log('connected');
    
    smartthings = new SmartThings(config.smartthings, {fetch});
    bridge = new Bridge(config.homeassistant, {client});
    
    // advancedaudio feature switches
    [
        { name: 'night mode', label: SmartThings.advancedAudio.NIGHT_MODE },
        { name: 'bass boost', label: SmartThings.advancedAudio.BASS_BOOST },
        { name: 'voice amplifier', label: SmartThings.advancedAudio.VOICE_AMPLIFIER },
    ].map(({name, label}) => 
        bridge.addSwitch(
            `${config.homeassistant.device.name} ${name}`, 
            label, 
            (value) => smartthings.setAdvancedAudioFeature(label, value)
        )
    );

    const getAdvancedAudioFeatures = async () => {
        const advancedAudioState = await smartthings.getAdvancedAudioFeatures();
        bridge.devices.forEach(ref => {
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