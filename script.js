const canvas = document.getElementById("sound-canvas");
const flower = document.getElementById("draggable-flower");
const status = document.getElementById("sound-status");

// Each zone has its own register, so random choices always preserve the mapping.
const zoneNotes = {
    underground: { label: "Underground", notes: ["C3", "E3", "G3", "A3"] },
    garden: { label: "Garden", notes: ["C4", "E4", "G4", "A4"] },
    sky: { label: "Sky", notes: ["C5", "E5", "G5", "A5"] }
};

const noteFrequencies = {
    C3: 130.81, E3: 164.81, G3: 196.0, A3: 220.0,
    C4: 261.63, E4: 329.63, G4: 392.0, A4: 440.0,
    C5: 523.25, E5: 659.25, G5: 783.99, A5: 880.0
};

let dragging = false;
let pointerOffset = { x: 0, y: 0 };
let lastValidPosition = { x: 0, y: 0 };
let audioContext;
let masterGain;
let currentOscillator;
let clearHighlightTimer;

function placeFlower(x, y) {
    const canvasRect = canvas.getBoundingClientRect();
    const flowerRect = flower.getBoundingClientRect();
    const maxX = canvasRect.width - flowerRect.width;
    const maxY = canvasRect.height - flowerRect.height;

    // Clamp the top-left position so the flower cannot be dragged beyond the canvas edge.
    const clampedX = Math.min(Math.max(0, x), maxX);
    const clampedY = Math.min(Math.max(0, y), maxY);
    flower.style.left = clampedX + "px";
    flower.style.top = clampedY + "px";
}

function setInitialPosition() {
    const canvasRect = canvas.getBoundingClientRect();
    const flowerRect = flower.getBoundingClientRect();
    const x = (canvasRect.width - flowerRect.width) / 2;
    const y = (canvasRect.height - flowerRect.height) / 2;
    placeFlower(x, y);
    lastValidPosition = { x, y };
}

function canvasPositionFromPointer(event) {
    const canvasRect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - canvasRect.left - pointerOffset.x,
        y: event.clientY - canvasRect.top - pointerOffset.y
    };
}

// Pointer Events provide one drag implementation for mouse, pen, and touch input.
flower.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const flowerRect = flower.getBoundingClientRect();
    pointerOffset = {
        x: event.clientX - flowerRect.left,
        y: event.clientY - flowerRect.top
    };
    dragging = true;
    flower.classList.add("is-dragging");
    flower.setPointerCapture(event.pointerId);
});

flower.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const position = canvasPositionFromPointer(event);
    placeFlower(position.x, position.y);
});

flower.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    flower.classList.remove("is-dragging");

    const canvasRect = canvas.getBoundingClientRect();
    const droppedInsideCanvas =
        event.clientX >= canvasRect.left && event.clientX <= canvasRect.right &&
        event.clientY >= canvasRect.top && event.clientY <= canvasRect.bottom;

    if (!droppedInsideCanvas) {
        // A release outside the canvas discards the in-progress position.
        placeFlower(lastValidPosition.x, lastValidPosition.y);
        status.textContent = "Flower returned to its previous position.";
        return;
    }

    const flowerRect = flower.getBoundingClientRect();
    const flowerCentreY = flowerRect.top + flowerRect.height / 2 - canvasRect.top;
    const zoneKey = zoneAt(flowerCentreY, canvasRect.height);
    lastValidPosition = {
        x: parseFloat(flower.style.left),
        y: parseFloat(flower.style.top)
    };
    playZoneNote(zoneKey);
});

flower.addEventListener("pointercancel", () => {
    if (!dragging) return;
    dragging = false;
    flower.classList.remove("is-dragging");
    placeFlower(lastValidPosition.x, lastValidPosition.y);
});

function zoneAt(yPosition, canvasHeight) {
    if (yPosition < canvasHeight / 3) return "sky";
    if (yPosition < (canvasHeight / 3) * 2) return "garden";
    return "underground";
}

// Random selection happens only within the selected zone's four-note group.
function randomNote(zoneKey) {
    const notes = zoneNotes[zoneKey].notes;
    return notes[Math.floor(Math.random() * notes.length)];
}

async function getAudioContext() {
    audioContext ??= new AudioContext();
    masterGain ??= audioContext.createGain();
    masterGain.gain.value = 0.16; // A fixed output ceiling avoids loud repeated drops.
    masterGain.connect(audioContext.destination);

    if (audioContext.state === "suspended") await audioContext.resume();
    return audioContext;
}

async function playZoneNote(zoneKey) {
    const note = randomNote(zoneKey);
    const zone = zoneNotes[zoneKey];
    status.textContent = zone.label + " - " + note;
    highlightZone(zoneKey);

    const context = await getAudioContext();
    const now = context.currentTime;

    // Keep playback monophonic: a new drop gently replaces any note still sounding.
    if (currentOscillator) {
        try { currentOscillator.stop(now + 0.03); } catch (_) { /* Already stopped. */ }
    }

    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    currentOscillator = oscillator;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(noteFrequencies[note], now);

    // This small attack and release envelope produces a gentle, click-free note.
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.85, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.58);
    oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        noteGain.disconnect();
        if (currentOscillator === oscillator) currentOscillator = null;
    });
}

function highlightZone(zoneKey) {
    clearTimeout(clearHighlightTimer);
    document.querySelectorAll(".zone").forEach((zone) => zone.classList.remove("is-selected"));
    const selectedZone = document.querySelector('[data-zone="' + zoneKey + '"]');
    selectedZone.classList.add("is-selected");
    clearHighlightTimer = setTimeout(() => selectedZone.classList.remove("is-selected"), 450);
}

setInitialPosition();
window.addEventListener("resize", () => {
    // Re-clamp the last saved position when a responsive layout changes dimensions.
    placeFlower(lastValidPosition.x, lastValidPosition.y);
});
