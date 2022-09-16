import CustomBoolParam from "./CustomBoolParam.js";
import CustomParam from "./CustomParam.js";
import NoteSource from "./NoteSource.js";
import TickGenerator from "./TickGenerator.js";

export default class Arpeggiator extends NoteSource
{
    #tickGenerator;
    #bpm;
    #enabled;
    #back;
    #playNoteBase;
    #stopNoteBase;
    #heldNotesSequence;
    #heldNotes;
    #currentPlaying;
    #currentPlayingFreq;
    #interval;

    constructor(audioContext, {name = '', bpm = 120})
    {
        super({name});

        this.#tickGenerator = new TickGenerator(audioContext, {name: 'tick'});
        this.#bpm = new CustomParam(audioContext, {defaultValue: bpm, min: 30, max: 240, step: 1, name: 'bpm', parent: this});
        this.#enabled = new CustomBoolParam(audioContext, {defaultValue: true, name: 'enabled', parent: this, onchange: () => this.#toggleArpeggiator.call(this)});
        this.#back = new CustomBoolParam(audioContext, {defaultValue: true, name: 'ping-pong', parent: this, onchange: () => this.#toggleArpeggiator.call(this)});

        this.#playNoteBase = this.playNote;
        this.#stopNoteBase = this.stopNote;
        this.playNote = this.#playNoteOverride;
        this.stopNote = this.#stopNoteOverride;

        this.#heldNotesSequence = [];
        this.#heldNotes = [];
        this.#currentPlaying = -1;
        this.#currentPlayingFreq = -1;
        this.#interval = -1;
    }

    #playNoteOverride(frequency)
    {
        if (this.#heldNotes.indexOf(frequency) < 0)
        {
            this.#heldNotes.push(frequency);
            this.#heldNotes.sort((a, b) => a - b);
            this.#heldNotesSequence = [...this.#heldNotes];
            if (this.#back.value)
                for(let i = this.#heldNotes.length - 2; i > 0; i--)
                    this.#heldNotesSequence.push(this.#heldNotes[i]);
        }
        
        if (this.#enabled.value && this.#interval < 0 && this.#heldNotesSequence.length > 1)
        {
            this.#currentPlaying = 0;
            this.#playNextNote();
            this.#interval = this.#tickGenerator.setInterval(15 / this.#bpm.value, this.#playNextNote, this);
        } else if (this.#interval < 0)
        {
            this.#playNoteBase(frequency);
        }
    }

    #stopNoteOverride(frequency)
    {
        let id = this.#heldNotes.indexOf(frequency);
        if (id > -1)
        {
            if (id < this.#currentPlaying)
                this.#currentPlaying--;
            if (this.#back.value && id > 0 && id < this.#heldNotes.length - 1 && id + this.#heldNotes.length - 1 < this.#currentPlaying)
                this.#currentPlaying--;
            this.#heldNotes.splice(id, 1);

            this.#heldNotesSequence = [...this.#heldNotes];
            if (this.#back.value)
                for(let i = this.#heldNotes.length - 2; i > 0; i--)
                    this.#heldNotesSequence.push(this.#heldNotes[i]);
        }
        this.#stopNoteBase(frequency);

        if (this.#interval > -1 && (this.#heldNotesSequence.length <= 1 || !this.#enabled.value))
        {
            this.#tickGenerator.clearInterval(this.#interval);
            this.#interval = -1;
        }
    }

    #playNextNote()
    {
        if (this.#heldNotesSequence.length < 1)
        {
            this.#tickGenerator.clearInterval(this.#interval);
            this.#interval = -1;
            return;
        }
        if (this.#heldNotesSequence.length == 1)
            return this.#playNoteBase(this.#heldNotesSequence[0]);
        
        if (this.#currentPlaying >= this.#heldNotesSequence.length)
        {
            this.#currentPlaying = 0;
        }

        if(this.#currentPlayingFreq > -1)
        {
            this.#stopNoteBase(this.#currentPlayingFreq);
        }
        
        this.#currentPlayingFreq = this.#heldNotesSequence[this.#currentPlaying];
        this.#currentPlaying++;
        if (typeof this.#currentPlayingFreq === 'undefined')
            return this.#playNextNote();
        this.#playNoteBase(this.#currentPlayingFreq);
    }

    #toggleArpeggiator()
    {

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
            ret.appendChild(this.#bpm.getDOMElement());
            ret.appendChild(this.#enabled.getDOMElement());
            ret.appendChild(this.#back.getDOMElement());
        }

        return ret;
    }
}