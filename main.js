const flowerButton = document.getElementById("flower-button");
const noteStatus = document.getElementById("note-status");

// A short looping melody keeps repeated taps feeling musical without needing a full instrument.
const noteSequence = [
    { name: "C5", frequency: 523.25 },
    { name: "E5", frequency: 659.25 },
    { name: "G5", frequency: 783.99 },
    { name: "A5", frequency: 880.0 },
    { name: "G5", frequency: 783.99 },
    { name: "E5", frequency: 659.25 }
];

const noteDurationSeconds = 0.36;
let audioContext;
let masterGain;
let noteIndex = 0;
let noteIsPlaying = false;
let queuedTap = false;
let resetTimerId;

// Using a real button means the browser gives us mouse, touch, and Enter/Space activation.
flowerButton.addEventListener("click", handleFlowerActivation);

// These small pressed-state listeners make the control feel responsive across pointer + keyboard input.
flowerButton.addEventListener("pointerdown", showPressedState);
flowerButton.addEventListener("pointerup", clearPressedState);
flowerButton.addEventListener("pointerleave", clearPressedState);
flowerButton.addEventListener("pointercancel", clearPressedState);
flowerButton.addEventListener("keydown", handleKeyPressVisual);
flowerButton.addEventListener("keyup", handleKeyReleaseVisual);
flowerButton.addEventListener("blur", clearPressedState);

async function handleFlowerActivation() {
    try {
        await ensureAudioReady();

        // Keep the prototype monophonic so very fast tapping cannot stack lots of loud oscillators.
        if (noteIsPlaying) {
            queuedTap = true;
            return;
        }

        playNextNote();
    } catch (error) {
        noteStatus.textContent = "Audio could not start in this browser.";
        console.error(error);
    }
}

async function ensureAudioReady() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();

        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.16;
        masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }
}

function playNextNote() {
    const nextNote = noteSequence[noteIndex % noteSequence.length];
    noteIndex += 1;
    noteIsPlaying = true;
    queuedTap = false;

    playTone(nextNote.frequency, noteDurationSeconds);
    showPlayingState(nextNote.name);

    window.clearTimeout(resetTimerId);
    resetTimerId = window.setTimeout(() => {
        finishCurrentNote();
    }, noteDurationSeconds * 1000);
}

function playTone(frequency, durationSeconds) {
    const startTime = audioContext.currentTime;
    const endTime = startTime + durationSeconds;

    const oscillator = audioContext.createOscillator();
    const noteEnvelope = audioContext.createGain();

    // A triangle wave plus a soft gain envelope gives a gentle note without external libraries.
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    noteEnvelope.gain.setValueAtTime(0.0001, startTime);
    noteEnvelope.gain.linearRampToValueAtTime(0.14, startTime + 0.03);
    noteEnvelope.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(noteEnvelope);
    noteEnvelope.connect(masterGain);
    oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        noteEnvelope.disconnect();
    });

    oscillator.start(startTime);
    oscillator.stop(endTime + 0.03);
}

function showPlayingState(noteName) {
    flowerButton.classList.remove("is-playing");

    // Restart the class so the grow/bounce/glow animation plays every time a note starts.
    void flowerButton.offsetWidth;
    flowerButton.classList.add("is-playing");
    noteStatus.textContent = `Playing ${noteName}`;
}

function finishCurrentNote() {
    noteIsPlaying = false;
    flowerButton.classList.remove("is-playing");
    noteStatus.textContent = "Activate the flower to hear the next note.";

    // Keep one pending tap so the control still feels responsive during quick repeated input.
    if (queuedTap) {
        playNextNote();
    }
}

function handleKeyPressVisual(event) {
    if (event.key === "Enter" || event.key === " ") {
        showPressedState();
    }
}

function handleKeyReleaseVisual(event) {
    if (event.key === "Enter" || event.key === " ") {
        clearPressedState();
    }
}

function showPressedState() {
    flowerButton.classList.add("is-pressed");
}

function clearPressedState() {
    flowerButton.classList.remove("is-pressed");
}
