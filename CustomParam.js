export default class CustomParam
{
    #internal;
    #ctx;
    #min;
    #max;
    #step;
    #defaultValue;
    #name;
    #parent;
    #onchange;
    #knob;

    constructor(ctx, {defaultValue = 0, min = 0, max = 1, step, name = '', parent, onchange, knob})
    {
        this.#ctx = ctx;
        this.#internal = new GainNode(ctx, {});
        this.#min = min;
        this.#max = max;
        this.value = defaultValue;
        this.#defaultValue = defaultValue;
        this.#name = name;
        this.#parent = parent;
        this.onchange = onchange;
        this.knob = knob;

        if (typeof step === "undefined")
            this.#step = (this.maxValue - this.minValue) / 255;
        else
            this.#step = step;
    }

    get node() { return this.#internal; }

    get value() { return this.#internal.gain.value; }
    set value(v)
    { 
        if (v < this.#min || v > this.#max)
            throw new Error(`Value ${v} out of range.`);

        this.#internal.gain.value = v;
        try {
            this.getDOMElement().dataset.value = v;
        } catch (_) {}
        

        if (typeof this.onchange === 'function')
            this.onchange(v);
    }

    get onchange() { return this.#onchange; }
    set onchange(f)
    {
        if (typeof f !== 'function' && typeof f !== 'undefined')
            throw new Error(`onchange: needs to be a function`);

        this.#onchange = f;
    }

    get knob() { return this.#knob; }
    set knob(k)
    {
        if (typeof k !== 'number' && typeof k !== 'undefined')
            throw new Error(`knob: needs to be a number`);

        this.#knob = k;
        this.getDOMElement().querySelector('input').dataset.knob = k;
    }

    get ctx() { return this.#ctx; }
    get minValue() { return this.#min; }
    get maxValue() { return this.#max; }
    get step() { return this.#step; }
    get defaultValue() { return this.#defaultValue; }
    get name() { return this.#name; }
    get parent() { return this.#parent; }

    setValueAtTime(value, startTime) { this.#internal.setValueAtTime(value, startTime); return this; }
    linearRampToValueAtTime(value, endTime) { this.#internal.linearRampToValueAtTime(value, endTime); return this; }
    exponentialRampToValueAtTime(value, endTime) { this.#internal.exponentialRampToValueAtTime(value, endTime); return this; }
    setTargetAtTime(target, startTime, timeConstant) { this.#internal.setTargetAtTime(target, startTime, timeConstant); return this; }
    setValueCurveAtTime(values, startTime, duration) { this.#internal.setValueCurveAtTime(values, startTime, duration); return this; }
    cancelScheduledValues(startTime) { this.#internal.cancelScheduledValues(startTime); return this; }
    cancelAndHoldAtTime(cancelTime) { this.#internal.cancelAndHoldAtTime(cancelTime); return this; }

    get elementId()
    {
        if (typeof this.parent !== 'undefined')
            return `${this.parent.name}-${this.name}`;
        else
            return `root-${this.name}`;
    }

    getDOMElement()
    {
        let ret = document.getElementById(this.elementId);
        if (ret == null)
        {
            ret = document.createElement('div');
            ret.id = this.elementId;
            ret.classList.add('synthModule-slider');
            ret.dataset.value = this.value;

            let range = document.createElement('input');
            range.type = 'range';
            range.id = `${this.elementId}-range`;
            range.min = this.minValue;
            range.max = this.maxValue;
            range.step = this.step;
            range.value = this.value;
            range.addEventListener('change', v => this.value = v.target.value);
            if (typeof this.knob === "number")
                range.dataset.knob = this.knob;

            let label = document.createElement('label');
            label.htmlFor = range.id;
            label.innerText = this.name;

            ret.appendChild(label);
            ret.appendChild(range);
        }

        return ret;
    }
}
