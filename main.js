const flowerButton = document.getElementById("flower-button");
const noteStatus = document.getElementById("note-status");

const notes = [261.63, 293.66, 329.63, 392, 440, 523.25];
const noteNames = ["C", "D", "E", "G", "A", "C"];
const keyButton = document.getElementById("key-test");
let noteIndex = 0;
let audioContext;

function playNote() {
    audioContext ??= new AudioContext();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(notes[noteIndex], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.9);

    noteStatus.textContent = `Note ${noteNames[noteIndex]} is blooming.`;
    flowerButton.classList.remove("is-playing");
    void flowerButton.offsetWidth;
    flowerButton.classList.add("is-playing");
    noteIndex = (noteIndex + 1) % notes.length;
}

flowerButton.addEventListener("click", playNote);
keyButton.addEventListener("click", playNote);

// key.addEventListener("click" playDataNote);
// testButton.addEventListener("click", playDataNote);


// when i click the button i want to play the audio file
const playButton = document.getElementById("play-button");
const randomButton = document.getElementById("random-time");
const audioTrack = document.getElementById("audio-track");

function playPauseAudio() {
    // if audio is currently paused, play, else pause playing audio
    if (audioTrack.paused === true) {
        audioTrack.play(); //start the playback for this audio if audio is paused
    } else {
        audioTrack.pause(); //pause the playback for this audio
    }
}


function randomTime() {
    let tracklength = audioTrack.duration;
    if (Number.isFinite(tracklength)) {
        audioTrack.currentTime = tracklength * Math.random(); // how to make them random in a range of 0 to tracklength, just multiply it together
        audioTrack.play();
    }
}
randomButton.addEventListener("click", randomTime);


playButton.addEventListener("click", playPauseAudio);

//set slider to change oscillator
const oscSlider = document.getElementById("osc-range");
function changeOsc(e) {
    console.log(e.target.value); // whatever happen to change (slide it, change it, move it) it will 
    // log the value of the slider, whwat information we can get from it
    if (e.target.value > 50) {
        synth.set({
            oscillator: {
                type: "square"
            }
        })
    } else {
        synth.set({
            oscillator: {
                type: "sine"
            }
        })
    }

}

oscSlider.addEventListener("change", changeOsc);


// Spatial control section
const flowerPainting = document.getElementById("flower-painting");

function startNote() {
    playNote();
}

function endNote() {
}

flowerPainting.addEventListener("mouseenter", startNote);
flowerPainting.addEventListener("mouseleave", endNote);

function pitchBend (e) {
    console.log(e.layerX);
    synth.set({
        detune: e.layerX
    });
}

flowerPainting.addEventListener("mousemove", pitchBend);

//what is the current instant 
let currentInstant = Temporal.Now.instant();
//find our timezone
let timeZone = Temporal.Now.timeZoneID();
console.log(timeZone);
//convert to local time
let currentTime = currentInstant.toZonedDateTimeISO(timeZone);
console.log(currentTime);
//convert to current time
let plainTime = Temporal.PlainTime.from(currentTime);
console.log(plainTime);

if(plainTime.minute > 54) {
    audioTrack.playbackRate = 0.5;
}