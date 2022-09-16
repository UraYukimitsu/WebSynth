import CustomParam from "./CustomParam.js";

export default class Delay extends GainNode {
    #delayTime;
    #delayNode;
    #mix;
    #feedback;
    #output;
    #name;

    #inputConnect;

    constructor(audioContext, {delay = 0.5, mix = 0.4, feedback = 0.4, name})
    {
        super(audioContext);

        this.#delayNode = new DelayNode(audioContext, {maxDelayTime: 5, delayTime: delay});
        this.#delayTime = new CustomParam(audioContext, {defaultValue: delay, min: 0, max: 5, name: 'delay', parent: this, onchange: v => this.#delayNode.delayTime.value = v});
        this.#mix = new CustomParam(audioContext, {defaultValue: mix, min: 0, max: 1, name: 'mix', parent: this});
        this.#feedback = new CustomParam(audioContext, {defaultValue: feedback, min: 0, max: 1, name: 'feedback', parent: this});
        this.#output = new GainNode(audioContext);
        this.#name = name;

        this.#inputConnect = this.connect;
        this.connect = n => this.#output.connect(n);

        this.#inputConnect(this.#delayNode)
            .connect(this.#mix.node)
            .connect(this.#output);
        this.#inputConnect(this.#output);
        this.#delayNode.connect(this.feedback.node).connect(this.#delayNode);
    }

    get delayTime() { return this.#delayTime; }
    get mix() { return this.#mix; }
    get feedback() { return this.#feedback; }

    get name() { return this.#name; }

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
            ret.appendChild(this.delayTime.getDOMElement());
            ret.appendChild(this.mix.getDOMElement());
            ret.appendChild(this.feedback.getDOMElement());
        }
        return ret;
    }
}