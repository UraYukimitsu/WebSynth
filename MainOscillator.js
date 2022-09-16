import EnvelopeGenerator from "./EnvelopeGenerator.js";

export default class MainOscillator extends OscillatorNode
{
    #name;
    #envelope;
    #inputConnect;
    #currentNote;

    constructor(audioContext, {name})
    {
        super(audioContext);
        this.#name = name;
        this.#currentNote = -1;
        this.#envelope = new EnvelopeGenerator(audioContext, {name: name + " envelope"});

        this.#inputConnect = this.connect;
        this.connect = n => this.#envelope.connect(n);

        this.#inputConnect(this.envelope);

        this.start(0);
    }

    get moduleType() { return "MainOscillator"; }
    get name() { return this.#name; }
    get envelope() { return this.#envelope; }

    playNote(frequency)
    {
        this.#currentNote = frequency;
        this.frequency.value = frequency;
        this.envelope.start();
    }

    stopNote(frequency)
    {
        if (this.#currentNote == frequency)
            this.envelope.stop();
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

            let waveType = document.createElement('select');
            waveType.id = `${this.elementId}-waveType`;
            waveType.addEventListener('change', v => this.type = v.target.value);

            let optionSine = document.createElement('option');
            optionSine.value = 'sine';
            optionSine.innerText = 'Sine';
            waveType.appendChild(optionSine);

            let optionSquare = document.createElement('option');
            optionSquare.value = 'square';
            optionSquare.innerText = 'Square';
            waveType.appendChild(optionSquare);

            let optionSawtooth = document.createElement('option');
            optionSawtooth.value = 'sawtooth';
            optionSawtooth.innerText = 'Sawtooth';
            waveType.appendChild(optionSawtooth);

            let optionTriangle = document.createElement('option');
            optionTriangle.value = 'triangle';
            optionTriangle.innerText = 'Triangle';
            waveType.appendChild(optionTriangle);

            waveType.value = this.type;

            let label = document.createElement('label');
            label.htmlFor = waveType.id;
            label.innerText = "Wave type "; 
            
            ret.appendChild(title);
            ret.appendChild(label);
            ret.appendChild(waveType);
            ret.appendChild(this.#envelope.getDOMElement());
        }

        return ret;
    }
}
