const SequentialExecutor = require('./tool/sequential-executor');
const command = require('./command');
const advancedAudio = require('./const/advanced-audio');

class SmartThings {
    #sequentialExecutor;

    static get advancedAudio() {
        return advancedAudio;
    }

    constructor(config, {fetch}) {
        const decoratedFetch = (url, options) => {
            const fetchUrl = config.baseUrl + url;
            const fetchOptions = JSON.parse(JSON.stringify(options));

            if (fetchOptions.body) {
                fetchOptions.body = JSON.stringify(fetchOptions.body);
            }

            if (!fetchOptions.headers) {
                fetchOptions.headers = {
                    Authorization: `Bearer ${config.apiKey}`
                };
            }

            return fetch(fetchUrl, fetchOptions);
        };

        this.#sequentialExecutor = new SequentialExecutor(decoratedFetch);
    }

    async getAdvancedAudioFeatures() {
        const [,response] = await this.#sequentialExecutor.execute(command.getAdvancedAudioStatus());
        const result = await response.json();
        const payload = result?.data?.value?.payload || {};
        const states = {};
        Object.entries(payload).forEach(([key, value]) => {
            if (key.indexOf('x.com.samsung.networkaudio.') === -1) {
                return;
            }
            states[key.split('.').pop()] = !!value;
        });
        return states;
    }

    async setAdvancedAudioFeature(feature, value) {
        return await this.#sequentialExecutor.execute(command.setAdvancedAudioFeature(feature, value));
    }
}

module.exports = SmartThings;