export default class TickGenerator extends AudioWorkletNode {
    static get workletFile() { return './Worklets/TickGeneratorWorklet.js'; }

    #name;
    #queue;
    #counter;
    #o;

    constructor (audioContext, {name = ''})
    {
        super(audioContext, 'TickGenerator');
        this.#name = name;
        this.#queue = {};
        this.#counter = 0;
        this.port.onmessage = (e) => {
            this.#runScheduledEvent(e.data);
        };

        // The tick generator needs to be connected to a node to process
        this.#o = audioContext.createOscillator();
        this.#o.start(0);
        this.#o.connect(this);
    }

    #scheduleEvent(time, callback, thisArg = this, [...args])
    {
        if (typeof time !== 'number')
            throw new TypeError('time should be a number');

        if (typeof callback !== 'function')
            throw new TypeError('callback should be a function');

        this.#queue[this.#counter] = {time, callback, thisArg, args, type: 'timeout'};
        this.port.postMessage([time, this.#counter]);
        return this.#counter++;
    }

    setTimeout(timeout, callback, thisArg = this, ...args)
    {
        let currentTime = this.context.currentTime;
        return this.#scheduleEvent(currentTime + timeout, callback, thisArg, args);
    }

    clearTimeout(id)
    {
        if (typeof this.#queue[id] !== 'undefined')
        {
            if (this.#queue[id].type === 'timeout')
                delete this.#queue[id];
        }
    }

    #scheduleEventInterval(time, callback, interval, id, thisArg = this, [...args])
    {
        if (typeof time !== 'number')
            throw new TypeError('time should be a number');

        if (typeof callback !== 'function')
            throw new TypeError('callback should be a function');

        if (typeof id === 'undefined')
        {
            this.#queue[this.#counter] = {time, callback, thisArg, args, type: 'interval', interval};
            this.port.postMessage([time, this.#counter]);
            return this.#counter++;
        } else
        {
            this.#queue[id] = {time, callback, thisArg, args, type: 'interval', interval};
            this.port.postMessage([time, id]);
            return id;
        }
    }

    setInterval(interval, callback, thisArg = this, ...args)
    {
        let currentTime = this.context.currentTime;
        return this.#scheduleEventInterval(currentTime + interval, callback, interval, undefined, thisArg, args);
    }

    clearInterval(id)
    {
        if (typeof this.#queue[id] !== 'undefined')
        {
            if (this.#queue[id].type === 'interval')
                delete this.#queue[id];
        }
    }

    async #runScheduledEvent(id)
    {
        let ev = this.#queue[id];
        if (typeof ev !== 'undefined' && ev.time > 0)
        {
            ev.callback.call(ev.thisArg, ...ev.args);
            if (ev.type === 'timeout')
            {
                this.clearTimeout(id);
            } else if (ev.type === 'interval')
            {
                this.#scheduleEventInterval(ev.time + ev.interval, ev.callback, ev.interval, id, ev.thisArg, ev.args);
            }
        }
    }
}
