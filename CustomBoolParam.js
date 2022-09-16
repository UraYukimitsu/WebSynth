import CustomParam from "./CustomParam.js";

export default class CustomBoolParam extends CustomParam
{
    #internal;
    constructor(ctx, {defaultValue = false, name = '', parent, onchange, knob})
    {
        super(ctx, {defaultValue, min: 0, max: 1, step: 1, name, parent, onchange, knob});
    }

    get value() { return !!this.node.gain.value; }
    set value(v)
    { 
        this.node.gain.value = +v;

        if (typeof this.onchange === 'function')
            this.onchange(v);
    }

    getDOMElement()
    {
        let ret = document.getElementById(this.elementId);
        if (ret == null)
        {
            ret = document.createElement('div');
            ret.id = this.elementId;

            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${this.elementId}-checkbox`;
            checkbox.checked = !!this.value;
            checkbox.addEventListener('change', v => this.value = +v.target.checked);
            if (typeof this.knob === "number")
                range.dataset.knob = this.knob;

            let label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.innerText = this.name;

            ret.appendChild(label);
            ret.appendChild(checkbox);
        }

        return ret;
    }
}