import noteFrequencies from "./noteFrequencies.js";
import NoteSource from "./NoteSource.js";

export default class MidiInput extends NoteSource {
    #connectedNodes;
    #name;

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
                        document.getElementById('warning').innerText += 'Connected to ' + e.name;
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
                } catch(_) {
                    console.error(_);
                }
                break;

            case 144: // Note ON
                if (data[2] == 0)
                {
                    this.stopNote(noteFrequencies[data[1]]);
                } else {
                    try {
                        this.playNote(noteFrequencies[data[1]]);
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
                })
                
                break;
        }
    }
}