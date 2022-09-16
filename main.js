import CustomParam from "./CustomParam.js";
import Delay from "./Delay.js";
import MainOscillator from "./MainOscillator.js";
import ModulationOscillator from "./ModulationOscillator.js"
import MidiInput from "./MidiInput.js";
import TickGenerator from "./TickGenerator.js";
import Arpeggiator from "./Arpeggiator.js";
import LFO from "./LFO.js";

function mountModule(module, area = 'mountArea')
{
	document.getElementById(area).appendChild(module.getDOMElement());
}

window.initAudio = function(button)
{
	(async () =>
	{
		window.audio = new (window.AudioContext || window.webkitAudioContext)();
		await audio.audioWorklet.addModule(TickGenerator.workletFile);
		window.midiInput = new MidiInput({name: 'MIDI'});

		window.arpeggiator = new Arpeggiator(audio, {name: 'Arpeggiator'});
		mountModule(arpeggiator);

		window.mainOscillator = new MainOscillator(audio, {name: 'Main oscillator'});
		mainOscillator.type = 'square';
		mainOscillator.envelope.attack.knob  = 74;
		mainOscillator.envelope.decay.knob   = 75;
		mainOscillator.envelope.sustain.knob = 76;
		mainOscillator.envelope.release.knob = 77;
		mountModule(mainOscillator);

		window.modulationOscillator = new ModulationOscillator(audio, {name: 'Modulation oscillator', ratio: 2});
		modulationOscillator.type = 'sawtooth';
		modulationOscillator.connect(modulationOscillator.frequency);
		modulationOscillator.connect(mainOscillator.frequency);
		mountModule(modulationOscillator);

		window.lfo = new LFO(audio, {name: 'LFO', defaultValue: 0});
		lfo.type = 'sine';
		lfo.frequency.knob = 70;
		mountModule(lfo);

		window.delay = new Delay(audio, {name: 'Delay'});
		mountModule(delay);

		window.mainGain = new CustomParam(audio, {defaultValue: 0.1, min: 0, max: 1, name: 'Main gain'});
		mountModule(mainGain);

		mountModule(midiInput, 'pianoMount');

		arpeggiator.connect(modulationOscillator);
		midiInput.connect(arpeggiator)
			.connect(mainOscillator)
			.connect(lfo)
			.connect(delay)
			.connect(mainGain.node)
			.connect(audio.destination);
	})();

	button.outerHTML = '';
}
