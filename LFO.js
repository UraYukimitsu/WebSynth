import CustomParam from "./CustomParam.js";

export default class LFO extends GainNode
{
    #frequency;
    #oscillator;
    #name;
    #connected;

    constructor(audioContext, {name, defaultValue = 0.5})
    {
        super(audioContext);
        this.#name = name;
        this.#frequency = new CustomParam(audioContext, {defaultValue, min: 0, max: 20, step: 0.01, name: 'frequency', parent: this, onchange: () => this.#updateFrequency.call(this)});
        this.#oscillator = new OscillatorNode(audioContext);
        this.#oscillator.frequency.value = defaultValue;

        this.#connected = false;

        this.#oscillator.start(0);
    }

    get name() { return this.#name };
    get frequency() { return this.#frequency }

    #updateFrequency()
    {
        this.#oscillator.frequency.value = this.#frequency.value;
        if (this.#frequency.value == 0 && this.#connected)
        {
            this.#oscillator.disconnect(this.gain);
            this.gain.value = 1;
            this.#connected = false;
        } else if (this.#frequency.value > 0 && !this.#connected)
        {
            this.#oscillator.connect(this.gain);
            this.#connected = true;
        }
    }

    get elementId() { return `${this.name}-control`; }

    getDOMElement()
    {
        let ret = document.getElementById(this.elementId);
        if (ret == null)
        {
            ret = document.createElement('div');
            ret.id = this.elementId;
            ret.classList.add('synthModule');

            let title = document.createElement('h4');
            title.innerText = this.name;
            
            ret.appendChild(title);
            ret.appendChild(this.#frequency.getDOMElement());
        }

        return ret;
    }
}