# WebSynth

(Name pending)

This is a modular synthethizer using the WebMIDI and WebAudio APIs.

You can try it out [here](https://ura.yukimitsu.moe/music). Alternatively, you can clone this repo, and either host it on a server over HTTPS or generate the files `key.pem` and `cert.pem` necessary to serve it over HTTPS to test it locally with the following commands:
```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```
And start the local server with:
```
npm start
```

Unfortunately it currently does not work in Firefox as it lacks WebMIDI support and some WebAudio methods such as `AudioParam.cancelAndHoldAtTime`.

Please note that I am using it with my own setup, which includes an Akai MPK mini mk3 with a custom program that sets all the rotary encoders to relative mode, so you may need to either change part of the code to make it work for you, or change some parts of your setup.

## TODO

- [ ] Noise generator node
- [ ] Sequencer node
- [ ] Filter node
- [ ] Pitch shift node
- [x] On-screen piano keyboard
- [ ] Load presets from JSON
- [ ] Visual representation of how the different modules are connected
- [ ] Visual patch editor
- [ ] Save patches to localstorage or file
- [ ] Detailed description/decumentation of the modules
