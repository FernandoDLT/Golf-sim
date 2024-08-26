// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('yardage').addEventListener('input', handleYardageInputChange);

// Start Round var and event listener
const startRoundBtn = document.querySelector('.startRoundBtn');
startRoundBtn.addEventListener('click', handleStartRound);
startRoundBtn.style.display = 'none';

// Event Listeners for resetting yardage, clubs and 
document.querySelector('.reset').addEventListener('click', resetYardsAndResult);
document.querySelector('.resetClubs').addEventListener('click', resetAllClubs);
// Start New Round Event Listener
document.getElementById('new-round').addEventListener('click', handleNewRound);

// Define holes array
const holes = [
    { number: 1, par: 4, distance: 400 },
    { number: 2, par: 4, distance: 380 },
    { number: 3, par: 3, distance: 180 },
    { number: 4, par: 5, distance: 530 },
    { number: 5, par: 4, distance: 410 },
    { number: 6, par: 4, distance: 390 },
    { number: 7, par: 3, distance: 150 },
    { number: 8, par: 5, distance: 560 },
    { number: 9, par: 4, distance: 420 },
    { number: 10, par: 4, distance: 430 },
    { number: 11, par: 4, distance: 350 },
    { number: 12, par: 5, distance: 580 },
    { number: 13, par: 3, distance: 210 },
    { number: 14, par: 4, distance: 410 },
    { number: 15, par: 4, distance: 370 },
    { number: 16, par: 3, distance: 160 },
    { number: 17, par: 5, distance: 520 },
    { number: 18, par: 4, distance: 440 }
];

// Function to check if all fields are filled
function allFieldsFilled() {
    return [...document.querySelectorAll('.club-distances input[type="number"]')]
        .every(input => input.value.trim() !== '');
}

// Function to toggle the visibility of the message # the bottom of club-distances
function toggleMessageVisibility() {
    document.querySelector('.club-distances h3').style.visibility = allFieldsFilled() ? 'hidden' : 'visible';
}

// Function for saving all club distances
function saveSettings() {
    if (!allFieldsFilled()) {
        alert("Please customize all club distances before saving.");
        return;
    }
    // Create an object `clubs` that maps the IDs of input elements to their values
    const clubs = Object.fromEntries(
        // Select all input elements of type "number" within the '.club-distances' container
        [...document.querySelectorAll('.club-distances input[type="number"]')]
            // Map each input element to a key-value pair where the key is the input's ID and the value is its current value
            .map(input => [input.id, input.value])
    );

    // Save the `clubs` object to local storage as a JSON string
    localStorage.setItem('clubs', JSON.stringify(clubs));

    // Display the 'Start Round' button
    startRoundBtn.style.display = 'inline-block';

    // Hide the 'Save' button
    document.getElementById('saveBtn').style.display = 'none';

}

// Function for suggesting club
function handleYardageInputChange(event) {
    const yardage = event.target.value;
    const suggestedClub = suggestClub(yardage);
    document.getElementById('result').innerText = suggestedClub;
}

// Function for resetting all clubs
function resetYardsAndResult() {
    document.getElementById('yardage').value = '';
    document.getElementById('result').textContent = 'Suggested Club Will Appear Here';
}

// Function to handle input change in club distances
function handleClubDistanceInputChange() {
    toggleMessageVisibility();
}

// Attach event listeners to the input fields
document.querySelectorAll('.club-distances input[type="number"]').forEach(input => {
    input.addEventListener('input', handleClubDistanceInputChange);
});

// Function to load customized club distances from localStorage
function loadSettings() {
    const clubs = JSON.parse(localStorage.getItem('clubs'));
    if (clubs) {
        for (let club in clubs) {
            document.getElementById(club).value = clubs[club];
        }
    }
}

// Resets all clubs fromo local storage
function resetAllClubs() {
    // Clear local storage
    localStorage.removeItem('clubs');

    // Reset all input fields within the club-distances div
    document.querySelectorAll('.club-distances input[type="number"]').forEach(input => {
        input.value = '';
    });

    // Redirect to the homepage
    window.location.href = 'index.main.html';
}

// Function for starting round
function handleStartRound() {
    // Play the audio
    new Audio('assets/audio/mixkit-hard-golf-swing-2119.wav').play();

    // Add the slide-up effect to the main elements
    ['.intro-container', '.instructions', '.club-distances', '.slide-wrapper'].forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('slide-up-main');
        }
    });

    // Use setTimeout to hide the elements after the slide-up effect
    setTimeout(function() {
        ['.result-container', '.intro-container', '.instructions', '.club-distances', '.slide-wrapper'].forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });

        // Show holes container and yards counter
        ['.holes-container', '.yardsCounter', '#new-round'].forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'block';
        });

        // Start the round and load hole information and the suggested club for the first hole
        startRound(1);
    }, 500); // Match the duration of the CSS transition
}

// Initialize variables to store total strokes and par for the round
let totalStrokes = 0;

// Assuming the par for the round is 73
const parForRound = 73; 

// Start Round functionality //
function startRound(holeNumber) {
    const hole = holes[holeNumber - 1];
    displayHole(hole);

    // Initialize vars
    let strokes = 0;
    const clubs = JSON.parse(localStorage.getItem('clubs'));
    const suggestedClub = suggestClub(hole.distance);
    const customYardage = clubs?.[suggestedClub.toLowerCase()] || hole.distance;
    
    // Call initializeUI to set up the user interface.
    initializeUI(hole, suggestedClub, customYardage);

    // Initialize Swing Variables
    let power = 0;
    let timer = null;
    let visualTimer = null;
    let remainingDistance = hole.distance;
    let isSwingInProgress = false; // Track if swing is in progress

    updateYardagesDisplay(0, hole.distance);

    // Populates first hole information
    function initializeUI(hole, suggestedClub, customYardage) {
        updateClubSuggestion(hole.number, suggestedClub, customYardage);
        const swingBtn = document.getElementById(`swingBtn${hole.number}`);
        if (swingBtn) {
            swingBtn.disabled = false;
            addSwingButtonListeners(swingBtn, hole.number);
        }
        updateProgressBarIds(hole.number);
        document.querySelector('.hole').scrollIntoView({ behavior: 'smooth' });
    }

    // Updates the IDs of the progress bar and power percentage elements with the current hole number.
    // Also ensures the progress container is visible.
    function updateProgressBarIds(holeNumber) {
        const progressBar = document.getElementById('swingProgressBar');
        const powerPercentage = document.getElementById('powerPercentage');

        if (progressBar) {
            progressBar.id = `swingProgressBar${holeNumber}`;
        }
        if (powerPercentage) {
            powerPercentage.id = `powerPercentage${holeNumber}`;
        }
        
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }

    // Updates the club suggestion text for the current hole based on remaining distance and suggested club.
    function updateClubSuggestion(holeNumber, suggestedClub, remainingDistance) {
        const clubSuggestionElement = document.getElementById(`clubSuggestion${holeNumber}`);
        if (clubSuggestionElement) {
            if (remainingDistance <= 0 || suggestedClub === "Click 'Next' to continue.") {
                clubSuggestionElement.textContent = "Click 'Next Hole' to continue.";
            } else {
                clubSuggestionElement.textContent = `Suggested Club: ${suggestedClub}`;
            }
        }
    }

    // Animates and updates the displayed yardages for traveled and remaining distances.
    // Calls a callback function once the animation completes.
    function updateYardagesDisplay(traveled, remaining, callback) {
        const traveledDisplay = document.getElementById('yardsTraveled');
        const remainingDisplay = document.getElementById('remainingDistance');

        let currentTraveled = 0;
        const increment = traveled / 100; // Adjust this value for smoother/faster increments

        const intervalId = setInterval(() => {
            if (currentTraveled < traveled) {
                currentTraveled += increment;
                traveledDisplay.textContent = `Yards Traveled: ${Math.min(Math.floor(currentTraveled), traveled)} yards`;
            } else {
                clearInterval(intervalId);
                traveledDisplay.textContent = `Yards Traveled: ${traveled} yards`;

                if (callback) callback();
            }
        }, 10);

        if (remainingDisplay) {
            remainingDisplay.textContent = `Remaining Distance: ${remaining} yards`;
        }
    }

    // Simulates a swing by updating stroke count, traveled distance, and club suggestion.
    // Prevents multiple swings while one is in progress and handles hole completion logic.
    function simulateSwing(power) {
        if (isSwingInProgress) return; // Prevent multiple swings
        isSwingInProgress = true; // Indicate that a swing is in progress

        strokes++;
        updateStrokeCount(hole.number, strokes);

        const yardsTraveled = Math.min(remainingDistance, Math.floor(Math.random() * remainingDistance) + 1);

        updateYardagesDisplay(yardsTraveled, remainingDistance, () => {
            remainingDistance -= yardsTraveled;
            const remainingDisplay = document.getElementById('remainingDistance');
            if (remainingDisplay) {
                remainingDisplay.textContent = `Remaining Distance: ${remainingDistance} yards`;
            }

            const newSuggestedClub = suggestClub(remainingDistance);
            updateClubSuggestion(hole.number, newSuggestedClub);

            totalStrokes++;
            handleHoleCompletion(holeNumber, remainingDistance, strokes);

            isSwingInProgress = false; // Indicate that the swing is complete
        });
    }

    // Updates the displayed stroke count for the given hole number.
    function updateStrokeCount(holeNumber, strokes) {
        const strokesSpan = document.getElementById(`strokes${holeNumber}`);
        if (strokesSpan) {
            strokesSpan.textContent = strokes;
        }
    }

    // Handles hole completion by hiding the swing button, showing a completion message, and displaying the final score if it's the 18th hole.
    function handleHoleCompletion(holeNumber, remainingDistance, strokes) {
        if (remainingDistance <= 0) {
            const swingBtn = document.getElementById(`swingBtn${holeNumber}`);
            if (swingBtn) {
                swingBtn.disabled = true;
                swingBtn.style.display = 'none';
            }

            const holeCompletionMessage = document.getElementById('holeCompletionMessage');
            if (holeCompletionMessage) {
                holeCompletionMessage.textContent = 'Hole Completed!';
            }

            completeHole(holeNumber);

            if (holeNumber === 18) {
                displayFinalScore();
            }
        }
    }

    // Displays the final score and total strokes, and hides relevant UI elements at the end of the round.
    function displayFinalScore() {
        const totalStrokesSpan = document.getElementById('totalStrokes');
        const totalScoreSpan = document.getElementById('totalScore');
        const relativeScore = totalStrokes - parForRound;

        if (totalStrokesSpan) { 
            totalStrokesSpan.textContent = `Total Strokes: ${totalStrokes}`;
        }

        if (totalScoreSpan) {
            totalScoreSpan.textContent = relativeScore === 0 ? 'You shot even par' :
                relativeScore > 0 ? `You shot ${relativeScore} over par` :
                `You shot ${Math.abs(relativeScore)} under par`;
        }

        document.getElementById('yardsTraveled').style.display = 'none';
        document.getElementById('remainingDistance').style.display = 'none';
        document.querySelector('.progress-container').style.display = 'none';
    }

    // Audio variables
    const putterSound = new Audio('assets/audio/golf-putt.wav');
    const shotSound = new Audio('assets/audio/mixkit-golf-shot.wav');

    // Adds a mousedown event listener to the swing button to handle swing actions, play sounds, and update the power progress.
    function addSwingButtonListeners(swingBtn, holeNumber) {
    function startPowerGeneration() {
        if (isSwingInProgress) return; // Prevent action if a swing is in progress

        const suggestedClub = suggestClub(remainingDistance);
        let swingSound = suggestedClub.toLowerCase().includes('putter') ? putterSound : shotSound;
        swingSound.play();

        if (timer === null) {
            power = 0;
            const targetPower = 100.9;
            timer = setInterval(function () {
                if (power > 100) {
                    alert("Power exceeded 100% resulting in a bad swing.");
                    clearInterval(timer);
                    timer = null;
                    return;
                }

                power += (targetPower - power) * 0.099;
                updateProgressBar(holeNumber, power);

                if (power >= targetPower) {
                    clearInterval(timer);
                    timer = null;
                }
            }, 10);
        }
    }

    function stopPowerGeneration() {
        if (isSwingInProgress) return; // Prevent action if a swing is in progress

        if (timer !== null) {
            clearInterval(timer);
            timer = null;
            simulateSwing(power);
        }

        let visualPower = power;
        updateVisualPower(holeNumber, visualPower);
    }

    // Add event listeners for both mouse and touch events
    swingBtn.addEventListener('mousedown', startPowerGeneration);
    swingBtn.addEventListener('mouseup', stopPowerGeneration);

    swingBtn.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent context menu on long press
        startPowerGeneration();
    }, { passive: false });

    swingBtn.addEventListener('touchend', stopPowerGeneration);
}

    // function addSwingButtonListeners(swingBtn, holeNumber) {
    //     swingBtn.addEventListener('mousedown', function () {
    //         if (isSwingInProgress) return; // Prevent action if a swing is in progress

    //         const suggestedClub = suggestClub(remainingDistance);
    //         let swingSound = suggestedClub.toLowerCase().includes('putter') ? putterSound : shotSound;
    //         swingSound.play();

    //         if (timer === null) {
    //             power = 0;
    //             const targetPower = 100.9;
    //             timer = setInterval(function () {
    //                 if (power > 100) {
    //                     alert("Power exceeded 100% resulting in a bad swing.");
    //                     clearInterval(timer);
    //                     timer = null;
    //                     return;
    //                 }

    //                 power += (targetPower - power) * 0.099;
    //                 updateProgressBar(holeNumber, power);

    //                 if (power >= targetPower) {
    //                     clearInterval(timer);
    //                     timer = null;
    //                 }
    //             }, 10);
    //         }
    //     });

    //     // Handles the mouseup event on the swing button by stopping the power increase, simulating the swing, and updating the visual power.
    //     swingBtn.addEventListener('mouseup', function () {
    //         if (isSwingInProgress) return; // Prevent action if a swing is in progress

    //         if (timer !== null) {
    //             clearInterval(timer);
    //             timer = null;
    //             simulateSwing(power);
    //         }

    //         let visualPower = power;
    //         updateVisualPower(holeNumber, visualPower);
    //     });
    // }
    // Animates the visual power display by decrementing the power value and updating the progress bar and percentage text.
    function updateVisualPower(holeNumber, visualPower) {
        const progressBar = document.getElementById(`swingProgressBar${holeNumber}`);
        const powerPercentage = document.getElementById(`powerPercentage${holeNumber}`);

        if (visualTimer !== null) {
            clearInterval(visualTimer);
        }

        visualTimer = setInterval(function () {
            visualPower -= 1.5;

            if (visualPower < 0) {
                visualPower = 0;
            }

            if (progressBar) progressBar.value = visualPower;
            if (powerPercentage) powerPercentage.textContent = `${Math.floor(power)}%`;

            if (visualPower <= 0) {
                clearInterval(visualTimer);
                visualTimer = null;
            }
        }, 10);
    }

    // Updates the progress bar and power percentage display for the given hole number based on the current power value.
    function updateProgressBar(holeNumber, power) {
        const progressBar = document.getElementById(`swingProgressBar${holeNumber}`);
        const powerPercentage = document.getElementById(`powerPercentage${holeNumber}`);
        if (progressBar) progressBar.value = power;
        if (powerPercentage) powerPercentage.textContent = `${Math.min(Math.floor(power), 100)}%`;
    }
}

// Function to suggest the appropriate club based on distance
function suggestClub(distance) {
    try {
        const yardage = parseInt(distance);

        if (yardage === 0) {
            const holeSound = new Audio('assets/audio/putt-ball-in-the-hole.mp3');
            holeSound.play();
            return "Click 'Next Hole' to continue.";
        }

        const clubDistancesJSON = localStorage.getItem("clubs");
        if (!clubDistancesJSON) {
            throw new Error('Club distances have not been set.');
        }
        
        // Stored club distances
        const clubDistances = JSON.parse(clubDistancesJSON);
        
        // Check if the player is on the green (within 25 yards)
        const greenThreshold = 25
        if (yardage <= greenThreshold) {
            return ('On the GREEN, use Putter');
        }

        // Suggest Driver or 3 Wood if applicable
        const driverDistance = parseInt(clubDistances.driver);
        if (!isNaN(driverDistance) && yardage >= driverDistance) {
            return "Driver, swing for the fences!";
        }

        // Returns "3 Wood" if the yardage is within the range for a 3 Wood club but less than the driver distance.
        const threeWoodDistance = parseInt(clubDistances.threeWood);
        if (!isNaN(threeWoodDistance) && yardage >= threeWoodDistance && yardage < driverDistance) {
            return "3 Wood";
        }

        // List of clubs excluding the putter
        const clubs = [
            { name: "Lob Wedge", distance: clubDistances.lobWedge },
            { name: "Sand Wedge", distance: clubDistances.sandWedge },
            { name: "Pitching Wedge", distance: clubDistances.pitchWedge },
            { name: "9 Iron", distance: clubDistances.nineIron },
            { name: "8 Iron", distance: clubDistances.eightIron },
            { name: "7 Iron", distance: clubDistances.sevenIron },
            { name: "6 Iron", distance: clubDistances.sixIron },
            { name: "5 Iron", distance: clubDistances.fiveIron },
            { name: "4 Iron", distance: clubDistances.fourIron },
            { name: "3 Iron", distance: clubDistances.threeIron },
            { name: "5 Wood", distance: clubDistances.fiveWood },
            { name: "3 Wood", distance: clubDistances.threeWood }
        ];

        // Find the most appropriate club based on the distance
        const suggestedClub = clubs.find(club => yardage <= parseInt(club.distance));
        return suggestedClub ? suggestedClub.name : "No club found for the entered yardage.";

    } catch (error) {
        // console.error("Error suggesting club:", error.message);
        return "Club distances have not been set.";
    }
}

// Load settings when the page loads
loadSettings();

// Displays hole information
function displayHole(hole) {
    // Find the element with the class 'hole' in the DOM
    const holeElement = document.querySelector('.hole');

    // Set the inner HTML of the hole element with the hole information
    holeElement.innerHTML = `
        <h2>Hole #${hole.number}</h2>
        <p>Par: ${hole.par}</p>
        <p>Distance: ${hole.distance} yards</p>
        <div class="clubSuggestion" id="clubSuggestion${hole.number}">Suggested Club:</div>
        <div class="strokes-container">
        <div class="progress-container">
            <span>Power</span>
            <progress id="swingProgressBar${hole.number}" class="swingProgressBar" value="0" max="100"></progress>
            <span id="powerPercentage${hole.number}" class="powerPercentage">0%</span>
            <span class="strokes-label">Strokes:</span>
        </div>
        <span id="strokes${hole.number}" class="strokes">0</span>
        </div>
        <button id="nextHoleBtn">Next Hole</button>
        <button id="swingBtn${hole.number}" class="swingBtn" disabled>Swing</button>
    `;
}

// Hole completion function
function completeHole(holeNumber) {
    const completedHole = holes[holeNumber - 1]; // Retrieve the completed hole's information

    // Create a container div for the completed hole
    const holeContainer = document.createElement('div');
    holeContainer.classList.add('hole-container'); // Add a class for styling

    // Create HTML elements to represent the completed hole's information
    const holeInfo = document.createElement('div');
    holeInfo.classList.add('hole-info'); // Add a class for styling
    holeInfo.innerHTML = `
        <h2>Hole #${completedHole.number}</h2>
        <p>Par: ${completedHole.par}</p>
        <p>Distance: ${completedHole.distance} yards</p>
        <p>Strokes: ${document.getElementById('strokes' + holeNumber).textContent}</p>
    `;

    // Append the completed hole's information to the hole container
    holeContainer.appendChild(holeInfo);

    // Append the hole container to the previousHoleResults div in descending order
    const previousHoleResults = document.getElementById('previousHoleResults');
    const existingContainers = previousHoleResults.querySelectorAll('.hole-container');
    if (existingContainers.length > 0) {
        // If there are existing containers, insert new container before the first one
        previousHoleResults.insertBefore(holeContainer, existingContainers[0]);
    } else {
        // If no existing containers, simply append the new container
        previousHoleResults.appendChild(holeContainer);
        // Show the previousHoleResults div when the first hole is added
        previousHoleResults.style.display = 'block';
    }

    // Logic for handling completion of holes
    const remainingDistanceSpan = document.getElementById('remainingDistance');
    const remainingDistance = parseInt(remainingDistanceSpan.textContent.split(' ')[2]); // Extract the remaining distance

    // Sets the display style of an element by its ID and logs an error if the element is not found.
    const displayElement = (id, displayStyle) => {
    const element = document.getElementById(id);
        if (element) {
            element.style.display = displayStyle;
        } else {
            console.error(`${id} element not found.`);
        }
    };
    // Sets the text content of an element by its ID and logs an error if the element is not found.
    const setTextContent = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.error(`${id} element not found.`);
        }
    };
    // Hides an element selected by the given CSS selector.
    const hideElementBySelector = (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    };

    if (remainingDistance === 0 && holeNumber === holes.length) {
        // End of the 18th hole: Hide elements and show 'New Round' button
        displayElement('nextHoleBtn', 'none');
        setTextContent('holeCompletionMessage', '');
        setTextContent('roundCompletionMessage', 'All Holes Completed!');
        hideElementBySelector('.holes-container');
        hideElementBySelector('hr');
        displayElement('yardageInformation', 'none');
        displayElement('new-round', 'inline-block');
    } else {
         // For other holes: Show 'Next Hole' button and completion message
        displayElement('nextHoleBtn', 'inline-block');
        setTextContent('holeCompletionMessage', 'Hole Completed!');

        const nextHoleBtn = document.getElementById('nextHoleBtn');
        nextHoleBtn.addEventListener('click', function () {
        // On 'Next Hole' button click:
        // - Hide the button and clear the message
        // - Start the next hole or show completion message if all holes are done
            displayElement('nextHoleBtn', 'none');
            setTextContent('holeCompletionMessage', '');

            if (holeNumber < holes.length) {
                startRound(holeNumber + 1);
            } else {
                setTextContent('roundCompletionMessage', 'All Holes Completed!');
                hideElementBySelector('.holes-container');
            }
        });
    }
}

// Redirects to homepage
function handleNewRound() {
    window.location.href = 'index.html';
}