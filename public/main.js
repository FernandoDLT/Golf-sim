// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.reset').addEventListener('click', resetYardsAndResult);
    document.getElementById('yardage').addEventListener('input', handleYardageInputChange);
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    document.getElementById('new-round').addEventListener('click', handleNewRound);
    document.querySelector('.resetClubs').addEventListener('click', resetAllClubs);

    const startRoundBtn = document.querySelector('.startRoundBtn');
    startRoundBtn.addEventListener('click', handleStartRound);
    startRoundBtn.style.display = 'none';
});

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

function resetYardsAndResult() {
    document.getElementById('yardage').value = '';
    document.getElementById('result').textContent = 'Suggested Club Will Appear Here';
}

function handleYardageInputChange(event) {
    const yardage = event.target.value;
    const suggestedClub = suggestClub(yardage);
    document.getElementById('result').innerText = suggestedClub;
}

function saveSettings() {
    if (!allFieldsFilled()) {
        alert("Please fill in all club distances before saving.");
        return; // Exit the function if any field is not filled
    }
    
    const clubs = {};
    document.querySelectorAll('.club-distances input[type="number"]').forEach(input => {
        clubs[input.id] = input.value;
    });
    
    localStorage.setItem('clubs', JSON.stringify(clubs));

    // Show the "Start Round" button
    const startRoundBtn = document.querySelector('.startRoundBtn');
    if (startRoundBtn) {
        startRoundBtn.style.display = 'inline-block';
    }

    // Hide the save button
    document.getElementById('saveBtn').style.display = 'none';
}

function handleStartRound() {
    // Hide the "Start Round" button
    this.style.display = 'none';

    // Show the holes container and yards counter
    document.querySelector('.holes-container').style.display = 'block';
    document.querySelector('.yardsCounter').style.display = 'block';

    // Hide certain features
    hideFieldsAndButton();

    // Start the round and load hole information and the suggested club for the first hole
    startRound(1);
}

// Function to hide specific elements
function hideFieldsAndButton() {
    const elementsToHide = [
        '.club-distances',
        '.yardsReset',
        '.clubs-reset'
    ];
    
    elementsToHide.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    });
}

function handleNewRound() {
    // Redirect to the homepage
    window.location.href = 'index.html';
}

// Function to check if all fields are filled
function allFieldsFilled() {
    const inputs = document.querySelectorAll('.club-distances input[type="number"]');
    for (const input of inputs) {
        if (!input.value) {
            return false;
        }
    }
    return true;
}

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

    // Retrieve customized yardage for the suggested club from localStorage
    const clubs = JSON.parse(localStorage.getItem('clubs'));
    const suggestedClub = suggestClub(hole.distance);
    const customYardage = clubs && clubs[suggestedClub.toLowerCase()];

    // Update HTML to display suggested club
    const clubSuggestionElement = document.getElementById(`clubSuggestion${holeNumber}`);
    const swingBtn = document.getElementById(`swingBtn${holeNumber}`);

    if (clubSuggestionElement) {
        clubSuggestionElement.textContent = `Suggested Club: ${suggestedClub}${customYardage ? ` (${customYardage} yards)` : ''}`;
    } else {
        console.error(`clubSuggestionElement${holeNumber} not found.`);
    }

    if (swingBtn) {
        swingBtn.disabled = false;
    } else {
        console.error(`swingBtn${holeNumber} not found.`);
        return; // Exit the function if the button is not found
    }
    
    // Initialize variables for power buildup and timer
    let power = 0;
    let timer = null;
    let remainingDistance = hole.distance;

    // Initialize yardages display
    updateYardagesDisplay(0, hole.distance);

    // Function to update yardages display
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
        const customYardage = clubs && clubs[suggestedClub.toLowerCase()];

        // Determine the maximum yardage for the suggested club
        const maxYardage = customYardage || hole.distance; // Use hole distance if custom yardage is not available

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
                const totalScoreSpan = document.getElementById('totalScore');
                const yardsTraveledSpan = document.getElementById('yardsTraveled');
                const remainingDistanceSpan = document.getElementById('remainingDistance');
                const progressContainer = document.querySelector('.progress-container');

                if (totalStrokesSpan) {
                    totalStrokesSpan.textContent = `Total Strokes: ${totalStrokes}`;
                }

                const relativeScore = totalStrokes - parForRound;
                if (totalScoreSpan) {
                    totalScoreSpan.textContent = (relativeScore === 0) ? 'You shot even par' :
                        (relativeScore > 0) ? `You shot ${relativeScore} over par` :
                        `You shot ${Math.abs(relativeScore)} under par`;
                }

                if (yardsTraveledSpan) yardsTraveledSpan.style.display = 'none';
                if (remainingDistanceSpan) remainingDistanceSpan.style.display = 'none';
                if (progressContainer && remainingDistance <= 0) progressContainer.style.display = 'none';
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

// Function to load customized club distances from localStorage
function loadSettings() {
    const clubs = JSON.parse(localStorage.getItem('clubs'));
    if (clubs) {
        for (let club in clubs) {
            document.getElementById(club).value = clubs[club];
        }
    }
}

// Function to handle input change in club distances
function handleClubDistanceInputChange() {
    // Check if all fields are filled
    if (allFieldsFilled()) {
        // Hide the message
        document.querySelector('.yardsReset h3').style.display = 'none';
    } else {
        // Show the message
        document.querySelector('.yardsReset h3').style.display = 'block';
    }
}

function resetAllClubs() {
    // Clear local storage
    localStorage.removeItem('clubs');

    // Reset all input fields within the club-distances div
    document.querySelectorAll('.club-distances input[type="number"]').forEach(input => {
        input.value = '';
    });

    // Redirect to the homepage
    window.location.href = 'index.html';
}

// Function to suggest the appropriate club based on distance
function suggestClub(distance) {
    try {
        const yardage = parseInt(distance);
        if (isNaN(yardage) || yardage <= 0) {
            throw new Error('Please enter a valid yardage.');
        }

        const clubDistancesJSON = localStorage.getItem("clubs");
        if (!clubDistancesJSON) {
            throw new Error('Club distances have not been set.');
        }

        const clubDistances = JSON.parse(clubDistancesJSON);
        const driverDistance = parseInt(clubDistances.driver);
        if (!isNaN(driverDistance) && yardage >= driverDistance) {
            return "Driver, swing for the fences!";
        }

        const threeWoodDistance = parseInt(clubDistances.threeWood);
        if (!isNaN(threeWoodDistance) && yardage >= threeWoodDistance && yardage < driverDistance) {
            return "3 Wood";
        }

        const clubs = [
            { name: "Putter, you got this...", distance: clubDistances.putter },
            { name: "60 Degree", distance: clubDistances.sixtyDegree },
            { name: "Sand Wedge", distance: clubDistances.wedgeSand },
            { name: "Pitching Wedge", distance: clubDistances.wedgePitch },
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

    const suggestedClub = clubs.find(club => yardage <= parseInt(club.distance));
    return suggestedClub ? suggestedClub.name : "No club found for the entered yardage.";
    } catch (error) {
        // console.error("Error suggesting club:", error.message);
        return "Club distances have not been set.";
    }
}

document.getElementById("yardage").addEventListener("input", function () {
    const yardageInput = document.getElementById("yardage");
    const yardage = yardageInput.value;
    const suggestedClub = suggestClub(yardage);
    document.getElementById("result").innerText = suggestedClub;
});

// Load settings when the page loads
loadSettings();

function displayHole(hole) {
    const holeElement = document.querySelector('.hole');
    holeElement.innerHTML = `
        <h2>Hole #${hole.number}</h2>
        <p>Par: ${hole.par}</p>
        <p>Distance: ${hole.distance} yards</p>
        <div class="clubSuggestion" id="clubSuggestion${hole.number}">Suggested Club:</div>
        <button id="swingBtn${hole.number}" class="swingBtn" disabled>Swing</button>
        <button id="nextHoleBtn">Next Hole</button>
        <div class="strokes-container">
            <div class="progress-container">
                <progress id="swingProgressBar${hole.number}" class="swingProgressBar" value="0" max="100"></progress>
            </div>
            <span class="strokes-label">Strokes:</span>
            <span id="strokes${hole.number}" class="strokes">0</span>
        </div>
    `;
}

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

    if (remainingDistance === 0 && holeNumber === holes.length) {
        // Logic to handle completion of the 18th hole
        const nextHoleBtn = document.getElementById('nextHoleBtn');
        if (nextHoleBtn) {
            nextHoleBtn.style.display = 'none';
        }

        const holeCompletionMessage = document.getElementById('holeCompletionMessage');
        if (holeCompletionMessage) {
            holeCompletionMessage.textContent = '';
        } else {
            console.error('Hole Completed message element not found.');
        }

        const newRoundBtn = document.getElementById('new-round');
        if (newRoundBtn) {
            newRoundBtn.style.display = 'inline-block';
        } else {
            console.error('New Round button element not found.');
        }

        const roundCompletionMessageSpan = document.getElementById('roundCompletionMessage');
        if (roundCompletionMessageSpan) {
            roundCompletionMessageSpan.textContent = 'All Holes Completed!';
            const holesContainer = document.querySelector('.holes-container');
            if (holesContainer) {
                holesContainer.style.display = 'none'; // Hide the holes container
            }
        }

        const hrElement = document.querySelector('hr');
        if (hrElement) {
            hrElement.style.display = 'none';
        }

        const yardageInformationElement = document.getElementById('yardageInformation');
        if (yardageInformationElement) {
            yardageInformationElement.style.display = 'none';
        }

        } else {
        // Logic for holes other than the 18th hole
        const nextHoleBtn = document.getElementById('nextHoleBtn');

        if (nextHoleBtn) {
            nextHoleBtn.style.display = 'inline-block';
        }

        const holeCompletionMessage = document.getElementById('holeCompletionMessage');
        if (holeCompletionMessage) {
            holeCompletionMessage.textContent = 'Hole Completed!';
        } else {
            console.error('Hole Completed message element not found.');
        }

        nextHoleBtn.addEventListener('click', function () {
            nextHoleBtn.style.display = 'none';

            const holeCompletionMessage = document.getElementById('holeCompletionMessage');
            if (holeCompletionMessage) {
                holeCompletionMessage.textContent = '';
            } else {
                console.error('Hole Completed message element not found.');
            }

            if (holeNumber < holes.length) {
                startRound(holeNumber + 1);
            } else {
                const roundCompletionMessageSpan = document.getElementById('roundCompletionMessage');
                roundCompletionMessageSpan.textContent = 'All Holes Completed!';
                const holesContainer = document.querySelector('.holes-container');
                if (holesContainer) {
                    holesContainer.style.display = 'none'; // Hide the holes container
                }
            }
        });
    }
}