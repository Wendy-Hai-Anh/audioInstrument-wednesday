const introDialog = document.getElementById("intro-dialog");
const introDialogCloseButton = document.getElementById("intro-dialog-close-button");
// console.log(introDialog);


///// Intro Modal
introDialog.showModal();
introDialogCloseButton.addEventListener("click", function closeDialog() {
    introDialog.close();
});

introDialog.addEventListener("close", toneInit);

async function toneInit(){
    await Tone.start();
    // find our test button
    const testButton = document.getElementById('test-button');
// init our synth
    const synth = new Tone.Synth().toDestination();

// do something when this button is clicked
    testButton.addEventListener("click", playNote);

// function that runs when button is clicked
    function playNote(){
        //play a note for a duration
        synth.triggerAttackRelease("c4", "8n");
    }
}


