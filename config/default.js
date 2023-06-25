
const { deferConfig } = require('config/defer');

module.exports = {
    mqtt: {
    },
    smartthings: {
        baseUrl: deferConfig(config => `https://api.smartthings.com/v1/devices/${config.smartthings.deviceId}`),
    },
    homeassistant: {
        uniqueId: deferConfig(config => config.smartthings.deviceId),
        device: {
            identifiers: [deferConfig(config => `${config.smartthings.deviceId}`),],
        },
        payload: {
            switch: ['Off', 'On'],
        }
    }
};
