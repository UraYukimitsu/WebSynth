class TickGeneratorWorklet extends AudioWorkletProcessor {
    #queue;
    #intervalQueue;

    constructor (...args) {
        super(...args)
        this.port.onmessage = (e) => {
            this.#queue.push(e.data);
            this.#queue.sort((a, b) => a[0] - b[0]);
        }

        this.#queue = [];
    }

    process (inputs, outputs, parameters)
    {
        // console.log(this.#queue, currentTime)
        while (this.#queue.length > 0 && currentTime >= this.#queue[0][0])
        {
            this.port.postMessage((this.#queue.shift())[1]);
        }
        return true;
    }
}

registerProcessor('TickGenerator', TickGeneratorWorklet);
