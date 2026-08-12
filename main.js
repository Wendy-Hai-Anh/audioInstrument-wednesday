const introDialog = document.getElementById("intro-dialog");
const introDialogCloseButton = document.getElementById("intro-dialog-close-button");
const testButton = document.getElementById('test-button');
// console.log(introDialog);
const synth = new Tone.PolySynth();

///// Intro Modal
introDialog.showModal();
introDialogCloseButton.addEventListener("click", function closeDialog() {
    introDialog.close();
});

introDialog.addEventListener("close", toneInit);

async function toneInit(){
    await Tone.start();
    // find our test button

// init our synth
synth.connect(Tone.Destination);




}
// function that runs when button is clicked
function playNote(){
    //play a note for a duration
    synth.triggerAttack("c4");
}
// function that runs when button is clicked
function endNote(){
    //play a note for a duration
    synth.triggerRelease("c4");
}

// do something when this button is clicked
testButton.addEventListener("mousedown", playNote);
testButton.addEventListener("mouseup", endNote);

