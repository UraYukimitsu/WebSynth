import CustomParam from "./CustomParam.js";
import MainOscillator from "./MainOscillator.js";

export default class ModulationOscillator extends MainOscillator {
    #ratio;
    #currentNote;
    #gain;
    #baseConnect;
    #baseDOMElement;

    constructor(audioContext, {name, ratio = 1})
    {
        super(audioContext, {name});

        this.#ratio = new CustomParam(audioContext, {defaultValue: ratio,  min: 1, max: 10,  step: 0.1, name: 'ratio', parent: this});
        this.#gain =  new CustomParam(audioContext, {defaultValue: 30,     min: 0, max: 255, step: 1,   name: 'gain',  parent: this});

        this.#baseConnect = this.connect;
        this.connect = n => this.gain.node.connect(n);

        this.#baseConnect(this.gain.node);

        this.#baseDOMElement = this.getDOMElement;
        this.getDOMElement = this.#getDOMElement;
    }

    get ratio() { return this.#ratio; }
    get gain() { return this.#gain; }

    playNote(frequency)
    {
        this.#currentNote = frequency;
        this.frequency.value = frequency / this.#ratio.value;
        this.envelope.start();
    }

    stopNote(frequency)
    {
        if (this.#currentNote == frequency)
            this.envelope.stop();
    }

    #getDOMElement()
    {
        let ret = this.#baseDOMElement();
        ret.appendChild(this.#ratio.getDOMElement());
        ret.appendChild(this.#gain.getDOMElement());
        return ret;
    }
}