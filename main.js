import EnvelopeGenerator from "./EnvelopeGenerator.js";
import noteFrequencies from "./noteFrequencies.js";

function onMIDIFailure() {
	document.getElementById('warning').innerText = 'WebMIDI access failure.';
    setupPiano();
}

function onMIDISuccess(midi) {
	globalThis.midi = midi;
	midi.inputs.forEach(e => {
		document.getElementById('warning').innerText += 'Connected to ' + e.name;
		e.onmidimessage = message => {
			console.log(message.data);
			processMidiMessage(message.data);
		};
	});

	setupPiano();
}

function setupPiano() {
    if(window.isSetup) return;
    window.isSetup = true;
	var piano = document.getElementById('piano');
	piano.style = 'display: flex;';
	for(let i in piano.children) {
		if(i == 'length')
			break;
		piano.children[i].dataset.note = parseInt(i)+36;
		piano.children[i].addEventListener('mousedown', (c) => {
			processMidiMessage([144, c.target.dataset.note, 16])
		});
		piano.children[i].addEventListener('mouseup', (c) => {
			processMidiMessage([128, c.target.dataset.note, 0])
		});
	}
}

function playNote(frequency)
{
    mainOscillator.frequency.value = frequency;
	envelope.start();
}

function stopNote()
{
	envelope.stop();
}

function processMidiMessage(data)
{
	switch (data[0])
	{
		case 128: // Note OFF
			try {
				if (window.currentNote == data[1])
					stopNote();
			} catch(_) {
				console.error(_);
			}
			break;

		case 144: // Note ON
			var noteList = document.getElementsByClassName('note');
			if(noteList.length > 0)
				for(i in noteList)
					noteList[i].outerHTML = '';

			if (data[2] == 0)
			{
				if (window.currentNote == data[1])
					stopNote();
			} else {
				try {
					window.currentNote = data[1];
					playNote(noteFrequencies[data[1]]);
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

window.initAudio = function(button)
{
	if (navigator.requestMIDIAccess) {
		navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
	} else {
		document.getElementById('warning').innerText = 'This browser does not support WebMIDI.';
        setupPiano();
	}

	window.audio = new (window.AudioContext || window.webkitAudioContext)();
	window.mainOscillator = audio.createOscillator();
	mainOscillator.type = 'square';
	mainOscillator.start(0);

	window.modulationOscillator = audio.createOscillator();
	modulationOscillator.type = 'sine';
	modulationOscillator.start(0);
	
	window.envelope = new EnvelopeGenerator(audio, 1, 1, 0.5, 1.5, "envelope");
	document.getElementById('mountArea').appendChild(envelope.getDOMElement());

	window.lfoGain = audio.createGain();
	window.lfo = audio.createOscillator();
	lfo.type = 'sine';
	lfo.frequency.value = 0;
	lfo.connect(lfoGain.gain);
	lfo.start(0);

	window.mainGain = audio.createGain();
	mainGain.gain.value = 0.1;

	window.delay = audio.createDelay();
	delay.delayTime.value = 0.5;
	window.delayGain = audio.createGain();
	delayGain.gain.value = 0.4;
	delay.connect(delayGain);
	delayGain.connect(delay);

	mainOscillator.connect(envelope);
	envelope.connect(lfoGain);
	lfoGain.connect(delay);
	lfoGain.connect(mainGain);
	delayGain.connect(mainGain);
	mainGain.connect(audio.destination);

	envelope.drawGraph();

	button.outerHTML = '';
}
