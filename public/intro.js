// Variable for loading the audio file
const swingSound = new Audio('assets/audio/mixkit-hard-golf-swing-2119.wav');

// Get the button element
const startButton = document.getElementById('start');

// Add click event listener to the button
startButton.addEventListener('click', function() {
    // Play the sound effect
    swingSound.play();
    
    // Add class to Intro page for sliding effect
    const header = document.querySelector('header');
    header.classList.add('slide-up');


    // Redirect to the main page (index.main.html) after the sliding transition
    setTimeout(function() {
        window.location.href = 'index.main.html';
    }, 500); // Match the duration of the CSS transition
});