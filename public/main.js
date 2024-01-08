// Event Listeners
document.addEventListener('DOMContentLoaded', setupEventListeners);

// Define holes
const holes = [
   { number: 1, par: 4, distance: 400 },
   { number: 2, par: 3, distance: 120 },
   { number: 3, par: 4, distance: 410 },
   { number: 4, par: 5, distance: 530 },
   { number: 5, par: 3, distance: 140 },
   { number: 6, par: 4, distance: 420 },
   { number: 7, par: 3, distance: 190 },
   { number: 8, par: 5, distance: 550 },
   { number: 9, par: 4, distance: 430 },
   { number: 10, par: 4, distance: 380 },
   { number: 11, par: 3, distance: 180 },
   { number: 12, par: 5, distance: 510 },
   { number: 13, par: 4, distance: 440 },
   { number: 14, par: 4, distance: 300 },
   { number: 15, par: 3, distance: 200 },
   { number: 16, par: 5, distance: 540 },
   { number: 17, par: 4, distance: 410 },
   { number: 18, par: 4, distance: 390 }
];

// Initialize empty hole object for hole names
const clubNames = {};

// Load setting on page load
loadSettings();

// Function to save customized club distances
function saveSettings() {
   const clubs = {};
   document.querySelectorAll('.clubs-distances input[type="number]').forEach( input => {
      clubs[input.id] = input.ariaValueMax;
   });
   localStorage.setItem('clubs', JSON.stringify(clubs));
   // Customized clubs alert
   alert("Your clubs have been customized.");
   // Show the "Start Round" button
   document.querySelector('.startRoundBtn').computedStyleMap.display = 'inline-block'
}

// Event Lsitener for "Start Round" button
document.querySelector('.startRoundBtn').addEventListener('click', function () {
   // Hides the "Start Round" button
   this.style.display = 'none';

   // Show the holes container
   const holesContainer = document.querySelector('.holes-container');
   holesContainer.style.display = 'block'

   // Shows yards counter
   const yardsCounter = document.querySelector('.yardsCounter');
   yardsCounter.style.display = 'block'

   // Hide certain features
   hideFieldsAndButtons();

   // Start the round and load hole information and the suggested club for the first hole
   startRound(1);
});

// Event Listenere for the "New Round" button
document.querySelector('new-round').addEventListener('click', function () {
   // Redirect to the Homepage
   window.location.href = 'index.html';
}) 

// Initialize variables to store total strokes and par for the round
let totalStrokes = 0;
const parForRound = 73; // Assuming the par for the round is 73

// Start Round functionality //
function startRound(holeNumber) {
    // Display information for the specified hole
    const hole = holes[holeNumber - 1];
    displayHole(hole);

    // Initialize strokes for the current hole
    let strokes = 0;

    // Determine the suggested club based on distance
    const suggestedClub = suggestClub(hole.distance);

    // Retrieve customized yardage for the suggested club from localStorage
    const clubs = JSON.parse(localStorage.getItem('clubs'));
    const customYardage = clubs && clubs[suggestedClub.toLowerCase()];

    // Update HTML to display suggested club
    const clubSuggestionElement = document.getElementById(`clubSuggestion${holeNumber}`);
    if (clubSuggestionElement) {
        if (customYardage) {
            clubSuggestionElement.textContent = `Suggested Club: ${suggestedClub} (${customYardage} yards)`;
        } else {
            clubSuggestionElement.textContent = `Suggested Club: ${suggestedClub}`;
        }
        } else {
            console.error(`clubSuggestionElement${holeNumber} not found.`);
        }

        // Enable the swing button for the current hole
        const swingBtn = document.getElementById(`swingBtn${holeNumber}`);
        if (!swingBtn) {
            console.error(`swingBtn${holeNumber} not found.`);
            return; // Exit the function if the button is not found
        }
        swingBtn.disabled = false;

    // Initialize variables for power buildup and timer
    let power = 0;
    let timer = null;
    let remainingDistance = hole.distance;

    // Initialize yardages display
    function updateYardagesDisplay(traveled, remaining) {
        const yardsTraveledSpan = document.getElementById('yardsTraveled');
        if (yardsTraveledSpan) {
            yardsTraveledSpan.textContent = `Yards Traveled: ${traveled} yards`;
        }
        const remainingDistanceSpan = document.getElementById('remainingDistance');
        if (remainingDistanceSpan) {
            remainingDistanceSpan.textContent = `Remaining Distance: ${remaining} yards`;
        }
    }
    updateYardagesDisplay(0, hole.distance);

    // Function to simulate a swing
    function simulateSwing(power) {
    // Increment the strokes
    strokes++;

    // Update the strokes displayed on the UI
    const strokesSpan = document.getElementById(`strokes${holeNumber}`);
    if (strokesSpan) {
        strokesSpan.textContent = strokes;
    }

    // Retrieve the suggested club
    const suggestedClub = suggestClub(remainingDistance);

    // Retrieve the customized yardage for the suggested club from localStorage
    const clubs = JSON.parse(localStorage.getItem('clubs'));
    const customYardage = clubs && clubs[suggestedClub.toLowerCase()];

    // Determine the maximum yardage for the suggested club
    const maxYardage = customYardage || hole.distance; // Use hole distance if custom yardage is not available

    // Introduce some randomness to the result (between 85% and 115% of calculated yardage)
    // const randomnessFactor = Math.random() * 0.6 + 0.7;
    let randomnessFactor;
    if (power < 80) {
        // Normal swing behavior
        randomnessFactor = Math.random() * 0.3 + 0.85;
    } else {
        // Swing error due to over-swinging
        randomnessFactor = Math.random() * 0.3 + 0.7;
    }
    const yardsTraveled = Math.min(remainingDistance, Math.floor((power / 100) * maxYardage * randomnessFactor));

    // Update remaining distance to the hole
    remainingDistance -= yardsTraveled;

    // Update yardages display
    updateYardagesDisplay(yardsTraveled, remainingDistance);

    // Update suggested club display
    const newSuggestedClub = suggestClub(remainingDistance);
    if (clubSuggestionElement) {
        if (remainingDistance > 0) {
            clubSuggestionElement.textContent = `Suggested Club: ${newSuggestedClub}`;
        } else {
            clubSuggestionElement.style.display = 'none';
        }
    }

    // Calculate the score for the current hole
    const scoreSpan = document.getElementById(`score${holeNumber}`);
    if (scoreSpan) {
        scoreSpan.textContent = strokes;
    }

    // Increment the total strokes for the round
    totalStrokes++;

    // Display a completion message if the remaining distance is 0 or less
    if (remainingDistance <= 0) {
        swingBtn.disabled = true;
        const holeCompletionMessage = document.getElementById('holeCompletionMessage');
        if (holeCompletionMessage) {
            holeCompletionMessage.textContent = 'Hole Completed!';
        }

        // Hide the swing button
        swingBtn.style.display = 'none';

        // Call the function to complete the hole
        completeHole(holeNumber);

        // Check if it's the last hole to display the total score
        if (holeNumber === 18) {
            const totalStrokesSpan = document.getElementById('totalStrokes');
            if (totalStrokesSpan) {
                totalStrokesSpan.textContent = `Total Strokes: ${totalStrokes}`;
            }
            // Calculate the relative score compared to par
            const relativeScore = totalStrokes - parForRound;
            const totalScoreSpan = document.getElementById('totalScore');
            if (totalScoreSpan) {
                if (relativeScore === 0) {
                    totalScoreSpan.textContent = 'You shot even par';
                } else if (relativeScore > 0) {
                    totalScoreSpan.textContent = `You shot ${relativeScore} over par`;
                } else {
                    totalScoreSpan.textContent = `You shot ${Math.abs(relativeScore)} under par`;
                }
            }

            // Hide the "Yards Traveled" and "Remaining Distance" elements
            const yardsTraveledSpan = document.getElementById('yardsTraveled');
            if (yardsTraveledSpan) {
                yardsTraveledSpan.style.display = 'none';
            }

            const remainingDistanceSpan = document.getElementById('remainingDistance');
            if (remainingDistanceSpan) {
                remainingDistanceSpan.style.display = 'none';
            }

            // Check if it's the last hole to hide the progress bar if completed
            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer && holeNumber === 18 && remainingDistance <= 0) {
                progressContainer.style.display = 'none';
            }
        }
    }
   }

// Add event listeners for power buildup and swing simulation
swingBtn.addEventListener('mousedown', function () {
    // Ensure timer is not already running
    if (timer === null) {
        power = 0; // Reset power for new swing
        timer = setInterval(function () {
            power += 1; // Adjust power increment as needed
            const progressBar = document.getElementById(`swingProgressBar${holeNumber}`);
            if (progressBar) {
                progressBar.value = power; // Update the progress bar value
            }

            // Logic to check if maximum power is reached
            if (power >= 100) {
                clearInterval(timer); // Stop the timer
                timer = null; // Reset timer variable
                simulateSwing(power); // Simulate swing with calculated power
            }
        }, 10); // Adjust interval for desired responsiveness
    }
});
   
   document.addEventListener('mouseup', function () {
    // Check if timer is running
    if (timer !== null) {
        clearInterval(timer); // Stop the timer if mouse is released early
        timer = null; // Reset timer variable
        simulateSwing(power); // Simulate swing with calculated power
        }
    });

    // Display the swing progress bar for the current hole
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }

    // Scroll to the hole
    document.querySelector('.hole').scrollIntoView({ behavior: 'smooth' });
}
