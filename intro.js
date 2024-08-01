// Load the audio file
const swingSound = new Audio('assets/audio/mixkit-hard-golf-swing-2119.wav');

// Get the button element
const startButton = document.getElementById('start');

// Add click event listener to the button
startButton.addEventListener('click', function() {
   // Play the sound effect
   swingSound.play();
   
   // Redirect to the main page (index.main.html) after the sound is played
   // Use a small delay to ensure the sound plays before redirection
   setTimeout(function() {
      window.location.href = 'index.main.html';
   }, 200); // Adjust the delay as needed
});
