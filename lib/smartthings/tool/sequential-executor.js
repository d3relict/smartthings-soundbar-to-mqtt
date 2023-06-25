class SequentialExecutor {
    #fetch;
    #waiting = [];
    #executing = false;

    constructor(fetch) {
        this.#fetch = fetch;
    }

    execute(requests) {
        if (!Array.isArray(requests)) {
            requests = [requests];
        }
        
        return new Promise((resolve, reject) => {
            const now = Date.now();
            
            const fetchRequests = async () => {
                const results = [];
                for (const request of requests) {
                    const { path, method, body } = request;
                    const result = await this.#fetch(path, { method, body });
                    results.push(result);
                }
                return results;
            };

            const job = {
                now,
                timeoutAt: now + this._jobTimeout,
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

    #startJob(job) {
        this.#executing = true;

        job.fn().then(
            (...args) => {
                job.resolve.apply(this, args);
                this.#finishJob(job);
            },
            (...args) => {
                job.reject.apply(this, args);
                this.#finishJob(job);
            },
        );
    };

    #finishJob() {
        if (this.#waiting.length) {
            const job = this.#waiting.shift();
            this.#startJob(job);
            return;
        }
        this.#executing = false;
    }
}

module.exports = SequentialExecutor;