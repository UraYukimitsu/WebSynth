import noteFrequencies from "./noteFrequencies.js";
import NoteSource from "./NoteSource.js";

export default class MidiInput extends NoteSource {
    #connectedNodes;
    constructor({name})
    {
        super({name});

        if (typeof window.midi === 'undefined')
        {
            if (navigator.requestMIDIAccess)
            {
                navigator.requestMIDIAccess().then((midi) =>
                {
                    let processMidiMessage = this.processMidiMessage;
                    window.midi = midi;
                    midi.inputs.forEach(e => {
                        document.getElementById('warning').innerText += 'Connected to ' + e.name + '\n';
                        e.onmidimessage = message => {
                            processMidiMessage.call(this, message.data);
                        };
                    });
                }, () => document.getElementById('warning').innerText = 'WebMIDI access failure.');
            } else
            {
                document.getElementById('warning').innerText = 'This browser does not support WebMIDI.';
            }
        } else
        {
            throw new Error('WebMIDI already initialized.');
        }
    }

    processMidiMessage(data)
    {
        console.log(data)
        switch (data[0])
        {
            case 128: // Note OFF
                try {
                    this.stopNote(noteFrequencies[data[1]]);
                    let key = document.querySelector(`[data-note="${data[1]}"]`);
                    if (key != null)
                    {
                        key.classList.remove('pressed');
                    }
                } catch(_) {
                    console.error(_);
                }
                break;

            case 144: // Note ON
                if (data[2] == 0)
                {
                    this.stopNote(noteFrequencies[data[1]]);
                    let key = document.querySelector(`[data-note="${data[1]}"]`);
                    if (key != null)
                    {
                        key.classList.remove('pressed');
                    }
                } else {
                    try {
                        this.playNote(noteFrequencies[data[1]]);
                        let key = document.querySelector(`[data-note="${data[1]}"]`);
                        if (key != null)
                        {
                            key.classList.add('pressed');
                        }
                    } catch(_) {
                        console.error(_);
                    }
                }
                break;

            case 176: // Knob
                let sliders = document.querySelectorAll(`[data-knob="${data[1]}"]`);
                sliders.forEach(slider => {
                    if (typeof slider !== 'object')
                        return;

                    if (data[2] & 64)
                        slider.value = Number(slider.value) - (128 - data[2]) * Number(slider.step);
                    else
                        slider.value = Number(slider.value) + data[2] * Number(slider.step);
                    
                    slider.dispatchEvent(new Event('change'));
                });
                
                break;
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

            let pattern = 'wbwbwwbwbwbw'.split('');
            let piano = document.createElement('div');
            piano.classList.add('piano');
            for(let i = 36; i < 84; i++)
            {
                let key = document.createElement('div');
                let color = pattern[i % pattern.length];
                key.classList.add(color == 'w' ? 'whiteKey' : 'blackKey');
                key.dataset.note = i;

                key.addEventListener('mousedown', (c) => {
                    this.processMidiMessage([144, c.target.dataset.note, 16]);
                });

                key.addEventListener('mouseup', (c) => {
                    c.target.classList.remove('pressed');
                    this.processMidiMessage([144, c.target.dataset.note, 0]);
                });

                piano.appendChild(key);
            }
            
            ret.appendChild(title);
            ret.appendChild(piano);
        }

        return ret;
    }
}