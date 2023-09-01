import { Response } from "node-fetch";
import { TFetch } from "../../type/node-fetch.mjs";
import attempt from "../../tool/attempt.mjs";

type Job = {
    resolve: (...args: any[]) => void,
    reject: (...args: any[]) => void,
    fn: () => Promise<any>,
}

class SequentialExecutor {
    #fetch: Function;
    #waiting: Job[];
    #executing: Boolean = false;

    constructor(fetch: TFetch) {
        this.#fetch = fetch;
        this.#waiting = [];
    }

    execute(requests): Promise<Response[]> {
        if (!Array.isArray(requests)) {
            requests = [requests];
        }

        return new Promise((resolve, reject) => {
            const now = Date.now();

            const fetchRequests = async () => {
                const results: Response[] = [];
                for (const request of requests) {
                    const { path, method, body } = request;
                    const result = await this.#fetch(path, { method, body });
                    results.push(result);
                }
                return results;
            };

            const job = {
                resolve,
                reject,
                fn: fetchRequests,
            };

            if (!this.#executing) {
                this.#startJob(job);
                return;
            }

            this.#waiting.push(job);
        });
    }

    async #startJob(job): Promise<void> {
        this.#executing = true;

        const [error, result] = await attempt(job.fn());

        if (error) {
            console.log('job failed', (error as Error)?.message);
            job.reject.call(this, error);
        } else {
            job.resolve.call(this, result);
        }

        this.#finishJob();
    };

    #finishJob(): void {
        if (this.#waiting.length) {
            const job = this.#waiting.shift();
            this.#startJob(job);
            return;
        }
        this.#executing = false;
    }
}

export default SequentialExecutor;