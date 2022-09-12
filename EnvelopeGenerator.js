import CustomParam from "./CustomParam.js";

export default class EnvelopeGenerator extends GainNode {
    constructor(ctx, attack, decay, sustain, release, name)
    {
        super(ctx, {});
        this.attack  = new CustomParam(ctx, {defaultValue: attack,  min: 0, max: 2, name: 'attack',  parent: this, knob: 74, onchange: () => this.drawGraph.call(this)});
        this.decay   = new CustomParam(ctx, {defaultValue: decay,   min: 0, max: 2, name: 'decay',   parent: this, knob: 75, onchange: () => this.drawGraph.call(this)});
        this.sustain = new CustomParam(ctx, {defaultValue: sustain, min: 0, max: 1, name: 'sustain', parent: this, knob: 76, onchange: () => this.drawGraph.call(this)});
        this.release = new CustomParam(ctx, {defaultValue: release, min: 0, max: 2, name: 'release', parent: this, knob: 77, onchange: () => this.drawGraph.call(this)});
        this.timeout = -1;
        this.name = name;
        this.gain.setValueAtTime(0, this.context.currentTime);
    }

    start()
    {
        this.cancelEvents();
        this.gain.linearRampToValueAtTime(1, this.context.currentTime + this.attack.value);
        this.timeout = window.setTimeout(() => {
            this.gain.linearRampToValueAtTime(this.sustain.value, this.context.currentTime + this.attack.value + this.decay.value);
            this.timeout = -1;
        }, this.attack * 1000);
    }

    stop()
    {
        this.cancelEvents();
        this.gain.linearRampToValueAtTime(0, this.context.currentTime + this.release.value);
    }

    cancelEvents()
    {
        if (this.timeout >= 0)
        {
            window.clearTimeout(this.timeout);
            this.timeout = -1;
        }
        this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
        this.gain.cancelAndHoldAtTime(this.context.currentTime);
        this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
    }

    get elementId() { return `${this.name}-control`; }

    drawGraph()
    {
        let document = window.document;
        let duration = this.attack.value + this.decay.value + this.release.value + 1;

        let graph = document.getElementById(`${this.elementId}-graph`);
        if (graph == null)
        {
            graph = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            graph.id = `${this.elementId}-graph`;
            graph.setAttribute('preserveAspectRatio', 'none');
            graph.setAttribute('width', '300');
            graph.setAttribute('height', '100');
        }
        graph.setAttribute('viewBox', `0 0 ${duration * 100} 100`);

        let gridPath = `M0 50 H${duration * 100}`;
        for (let i = 1; i < duration; i++)
        {
            gridPath += ` M${i * 100} 0 V100`;
        }
        graph.innerHTML = `<path d="${gridPath}" stroke="#008800" fill="transparent" />`;

        let curTime = this.attack.value * 100;
        let graphPath = `M0 100 L${curTime} 0 `;
        curTime += this.decay.value * 100;
        graphPath += `L${curTime} ${100 - this.sustain.value * 100} `;
        curTime += 100;
        graphPath += `H${curTime}`;
        curTime += this.release.value * 100;
        graphPath += `L${curTime} 100 `;
        graph.innerHTML += `<path d="${graphPath}" stroke="#00FF00" fill-opacity="0.5" />`

        return graph;
    }

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
            ret.appendChild(this.attack.getDOMElement());
            ret.appendChild(this.decay.getDOMElement());
            ret.appendChild(this.sustain.getDOMElement());
            ret.appendChild(this.release.getDOMElement());
            ret.appendChild(this.drawGraph());
        }

        return ret;
    }
}
