// Create a varable for Start Button
const startButton = document.getElementById('start');
// Create variable for swing audio
const swingSound = new Audio('assets/audio/mixkit-hard-golf-swing-2119.wav');
// Add event lsitener and function to Start button
startButton.addEventListener('click', () => {
    // Add varible to header
    const header = document.querySelector('header');
    // Add CSS annimation to header
    header.classList.add('slide-up');
    // Add audio sound method
    swingSound.play();
    // Add steTimeout for redirecting page to Main HTML
    setTimeout(() => {
        window.location.href = 'index.main.html';
    }, 500);
});