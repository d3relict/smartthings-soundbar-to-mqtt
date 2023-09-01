import SequentialExecutor from './tool/sequential-executor.mjs';
import advancedAudio from './const/advanced-audio.mjs';
import { TSmartthingsConfig } from '../schema/config.mjs';
import * as command from './command.mjs';
import { TFetch, RequestInfo, RequestInit } from '../type/node-fetch.mjs';

type TSmartthingsDependency = {
    fetch: TFetch,
}

type TApiResponse = {
    data?: {
        value?: {
            payload: any;
        }
    }
}

class SmartThings {
    #sequentialExecutor: SequentialExecutor;

    static get advancedAudio() {
        return advancedAudio;
    }

    constructor(config: TSmartthingsConfig, { fetch }: TSmartthingsDependency) {
        const decoratedFetch = (url: RequestInfo, options?: RequestInit) => {
            const fetchUrl = config.baseUrl + url;
            const fetchOptions = JSON.parse(JSON.stringify(options));

            if (fetchOptions.body) {
                fetchOptions.body = JSON.stringify(fetchOptions.body);
            }

            if (!fetchOptions.headers) {
                fetchOptions.headers = {}
            }

            fetchOptions.headers.Authorization = `Bearer ${config.apiKey}`

            return fetch(fetchUrl, fetchOptions);
        };

        this.#sequentialExecutor = new SequentialExecutor(decoratedFetch);
    }

    async getAdvancedAudioFeatures() {
        const [, response] = await this.#sequentialExecutor.execute(command.getAdvancedAudioStatus());
        const result = await response.json() as TApiResponse;
        const payload = result?.data?.value?.payload || {};
        console.log(payload);
        const states: Record<string, boolean> = {};
        Object.entries<string>(payload).forEach(([key, value]) => {
            if (key.indexOf('x.com.samsung.networkaudio.') === -1) {
                return;
            }
            const feature = key.split('.').pop();
            if (!feature) return;

            states[feature] = !!value;
        });
        return states;
    }

    async setAdvancedAudioFeature(feature: string, value: boolean) {
        await this.#sequentialExecutor.execute(command.setAdvancedAudioFeature(feature, value));
    }
}

export default SmartThings;