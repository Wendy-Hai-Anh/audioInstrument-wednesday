const flowerButton = document.getElementById("flower-button");
const noteStatus = document.getElementById("note-status");

const notes = [261.63, 293.66, 329.63, 392, 440, 523.25];
const noteNames = ["C", "D", "E", "G", "A", "C"];
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

// key.addEventListener("click" playDataNote);
// testButton.addEventListener("click", playDataNote);


// when i click the button i want to play the audio file
const playButton = document.getElementById("play-button");
const audioTrack = document.getElementById("audio-track");

function playPauseAudio() {
    // if audio is currently paused, play, else pause playing audio
    if (audioTrack.paused === true) {
        audioTrack.play(); //start the playback for this audio if audio is paused
    } else {
        audioTrack.pause(); //pause the playback for this audio
    }
}


playButton.addEventListener("click", playAudio);
