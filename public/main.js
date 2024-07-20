// Event listeners setup
document.getElementById('yardage').addEventListener('input', handleYardageInputChange);
document.getElementById('saveBtn').addEventListener('click', saveSettings);

// Event listeners
const startRoundBtn = document.querySelector('.startRoundBtn');
startRoundBtn.addEventListener('click', handleStartRound);
startRoundBtn.style.display = 'none';

document.querySelector('.reset').addEventListener('click', resetYardsAndResult);
document.querySelector('.resetClubs').addEventListener('click', resetAllClubs);
document.getElementById('new-round').addEventListener('click', handleNewRound);

// Define holes array
const holes = [
    { number: 1, par: 4, distance: 400 },
    { number: 2, par: 3, distance: 120 },
    { number: 3, par: 4, distance: 410 },
    { number: 4, par: 5, distance: 530 },
    { number: 5, par: 3, distance: 210 },
    { number: 6, par: 4, distance: 420 },
    { number: 7, par: 3, distance: 200 },
    { number: 8, par: 5, distance: 550 },
    { number: 9, par: 4, distance: 430 },
    { number: 10, par: 4, distance: 380 },
    { number: 11, par: 3, distance: 160 },
    { number: 12, par: 5, distance: 510 },
    { number: 13, par: 4, distance: 440 },
    { number: 14, par: 4, distance: 340 },
    { number: 15, par: 3, distance: 200 },
    { number: 16, par: 5, distance: 540 },
    { number: 17, par: 4, distance: 410 },
    { number: 18, par: 4, distance: 390 }
];

// Function for reseting all clubs
function resetYardsAndResult() {
    document.getElementById('yardage').value = '';
    document.getElementById('result').textContent = 'Suggested Club Will Appear Here';
}

// Function for suggesting club
function handleYardageInputChange(event) {
    const yardage = event.target.value;
    const suggestedClub = suggestClub(yardage);
    document.getElementById('result').innerText = suggestedClub;
}

// Function for saving all club distances
function saveSettings() {
    if (!allFieldsFilled()) {
        alert("Please fill in all club distances before saving.");
        return; // Exits the function if any field is not filled
    }

    const clubs = {};
    // Loops through input fileds
    document.querySelectorAll('.club-distances input[type="number"]').forEach(input => {
        clubs[input.id] = input.value;
    });

    // Saves "club's" object in local storage
    localStorage.setItem('clubs', JSON.stringify(clubs));

    // Show the "Start Round" button
    startRoundBtn.style.display = 'inline-block';

    // Hide the save button
    document.getElementById('saveBtn').style.display = 'none';
}

function allFieldsFilled() {
    let allFilled = true;
    document.querySelectorAll('.club-distances input[type="number"]').forEach(input => {
        if (!input.value) {
            allFilled = false;
        }
    });
    return allFilled;
}

// Function to handle input change in club distances
function handleClubDistanceInputChange() {
    // Check if all fields are filled
    if (allFieldsFilled()) {
        // Hide the message
        document.querySelector('.club-distances h3').style.visibility = 'hidden';
    } else {
        // Show the message
        document.querySelector('.club-distances h3').style.visibility = 'visible';
    }
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

// Function for starting round
function handleStartRound() {
    // Hides the "Start Round" button
    this.style.display = 'none';

    // Hide specific elements
    ['.intro-container', '.instructions', '.club-distances', '.yardsReset', '.clubs-reset'].forEach(selector => {
        const element = document.querySelector(selector);
        if (element) element.style.display = 'none';
    });

    // Show holes container and yards counter
    document.querySelector('.holes-container').style.display = 'block';
    document.querySelector('.yardsCounter').style.display = 'block';
    document.getElementById('new-round').style.display = 'block';

    // Start the round and load hole information and the suggested club for the first hole
    startRound(1);
}

// Function to check if all fields are filled
function allFieldsFilled() {
    return [...document.querySelectorAll('.club-distances input[type="number"]')].every(input => input.value);
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

    updateYardagesDisplay(0, hole.distance);

    // Updates Club Suggestion
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

    // Update Progress Bar IDs
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

    // Update Yardages Display
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
    
    function updateYardagesDisplay(traveled, remaining) {
        document.getElementById('yardsTraveled').textContent = `Yards Traveled: ${traveled} yards`;
        document.getElementById('remainingDistance').textContent = `Remaining Distance: ${remaining} yards`;
    }

    function simulateSwing(power) {
        strokes++;
        updateStrokeCount(hole.number, strokes);

        // Calculate the yards traveled based on the power and update remaining distance
        const suggestedClub = suggestClub(remainingDistance);
        const customYardage = clubs?.[suggestedClub.toLowerCase()] || hole.distance;
        const randomnessFactor = power < 80 ? Math.random() * 0.3 + 0.85 : Math.random() * 0.3 + 0.7;
        const yardsTraveled = Math.min(remainingDistance, Math.floor((power / 100) * customYardage * randomnessFactor));

        remainingDistance -= yardsTraveled;
        updateYardagesDisplay(yardsTraveled, remainingDistance);

        // Update club suggestion with the remaining distance
        const newSuggestedClub = suggestClub(remainingDistance);
        updateClubSuggestion(hole.number, newSuggestedClub);

        totalStrokes++;
        handleHoleCompletion(holeNumber, remainingDistance, strokes);
    }


    function updateStrokeCount(holeNumber, strokes) {
        const strokesSpan = document.getElementById(`strokes${holeNumber}`);
        if (strokesSpan) {
            strokesSpan.textContent = strokes;
        }
    }

    function handleHoleCompletion(holeNumber, remainingDistance) {
        if (remainingDistance <= 0) {
        const swingBtn = document.getElementById(`swingBtn${holeNumber}`);
        if (swingBtn) {
            swingBtn.disabled = true;
            swingBtn.style.display = 'none';
        }

        // Display Hole Completion
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

    // DisplayFinalScore Function
    function displayFinalScore() {
        const totalStrokesSpan = document.getElementById('totalStrokes'); // Retrieve Total Strokes Element
        const totalScoreSpan = document.getElementById('totalScore'); // Retrieve Total Score Element
        const relativeScore = totalStrokes - parForRound; // Calculate Relative Score

        // Update Total Strokes Display
        if (totalStrokesSpan) { 
            totalStrokesSpan.textContent = `Total Strokes: ${totalStrokes}`;
        }

        // Update Final Score Display
        if (totalScoreSpan) {
            totalScoreSpan.textContent = relativeScore === 0 ? 'You shot even par' :
                relativeScore > 0 ? `You shot ${relativeScore} over par` :
                `You shot ${Math.abs(relativeScore)} under par`;
        }

        // Hide Yardage Displays 
        document.getElementById('yardsTraveled').style.display = 'none';
        document.getElementById('remainingDistance').style.display = 'none';
        document.querySelector('.progress-container').style.display = 'none'; // Hide Progress Container
    }
    
    function addSwingButtonListeners(swingBtn, holeNumber) {
        swingBtn.addEventListener('mousedown', function () {
            if (timer === null) {
                power = 0;
                const targetPower = 100.9;  // target power
                timer = setInterval(function () {
                    // Check if the next increment will exceed 100%
                if (power <= 100 && power + (targetPower - power) * 0.1 > 100) {
                    power = 100;  // Set power to 100
                } else if (power + (targetPower - power) * 0.1 > 100.01) {
                    alert("Power exceeded 100% resulting in a bad swing.");
                    clearInterval(timer);
                    timer = null;
                    return; // Exit the function
                }

                // Smooth increment using an easing factor
                power += (targetPower - power) * 0.099;  // Easing factor
                updateProgressBar(holeNumber, power);

                if (power >= targetPower) {
                    clearInterval(timer);
                    timer = null;
                }
            }, 10);  // Interval for updates
        }
    });

        swingBtn.addEventListener('mouseup', function () {
            if (timer !== null) {
                clearInterval(timer);
                timer = null;
                simulateSwing(power);
            }

            let visualPower = power;
            updateVisualPower(holeNumber, visualPower);
        });
    }

    function updateVisualPower(holeNumber, visualPower) {
        const progressBar = document.getElementById(`swingProgressBar${holeNumber}`);
        const powerPercentage = document.getElementById(`powerPercentage${holeNumber}`);

        // Clear any existing visual timer
        if (visualTimer !== null) {
            clearInterval(visualTimer);
        }

        // Start a new visual timer
        visualTimer = setInterval(function () {
            // Decrease visual power more slowly for a smoother effect
            visualPower -= 1.5;  // Adjust this value for desired smoothness

            // Ensure visualPower doesn't go below zero
            if (visualPower < 0) {
                visualPower = 0;
            }

            // Update the progress bar with the visual power
            if (progressBar) progressBar.value = visualPower;

            // Show the actual power as the percentage
            if (powerPercentage) powerPercentage.textContent = `${Math.floor(power)}%`;

            // Stop the timer when visual power is zero
            if (visualPower <= 0) {
                clearInterval(visualTimer);
                visualTimer = null;
            }
        }, 10);
    }

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
            return "Click 'Next Hole' to continue.";
        }

        // if (isNaN(yardage) || yardage <= 0) {
        //     throw new Error('Please enter a valid yardage.');
        // }

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
            // { name: "driver", distance: clubDistances.driver }
        ];

        const suggestedClub = clubs.find(club => yardage <= parseInt(club.distance));
        return suggestedClub ? suggestedClub.name : "No club found for the entered yardage.";
    } catch (error) {
        // console.error("Error suggesting club:", error.message);
        return "Club distances have not been set.";
    }
}

// document.getElementById("yardage").addEventListener("input", function () {
//     const yardageInput = document.getElementById("yardage");
//     const yardage = yardageInput.value;
//     const suggestedClub = suggestClub(yardage);
//     document.getElementById("result").innerText = suggestedClub;
// });

// Load settings when the page loads
loadSettings();

// Displays hole information
function displayHole(hole) {
    // Find the element with the class 'hole' in the DOM
    const holeElement = document.querySelector('.hole');

    // Check if the element exists
    if (!holeElement) {
        console.error('.hole element not found in the DOM.');
        return;
    }

    // Set the inner HTML of the hole element with the hole information
    holeElement.innerHTML = `
        <h2>Hole #${hole.number}</h2>
        <p>Par: ${hole.par}</p>
        <p>Distance: ${hole.distance} yards</p>
        <div class="clubSuggestion" id="clubSuggestion${hole.number}">Suggested Club:</div>
        <button id="swingBtn${hole.number}" class="swingBtn" disabled>Swing</button>
        <button id="nextHoleBtn">Next Hole</button>
        <div class="strokes-container">
            <div class="progress-container">
                <span>Power</span>
                <progress id="swingProgressBar${hole.number}" class="swingProgressBar" value="0" max="100"></progress>
                <span id="powerPercentage${hole.number}" class="powerPercentage">0%</span>
            </div>
            <span class="strokes-label">Strokes:</span>
            <span id="strokes${hole.number}" class="strokes">0</span>
        </div>
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

    const displayElement = (id, displayStyle) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = displayStyle;
        } else {
            console.error(`${id} element not found.`);
        }
    };

    const setTextContent = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.error(`${id} element not found.`);
        }
    };

    const hideElementBySelector = (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    };

    if (remainingDistance === 0 && holeNumber === holes.length) {
        // Logic to handle completion of the 18th hole
        displayElement('nextHoleBtn', 'none');
        setTextContent('holeCompletionMessage', '');
        setTextContent('roundCompletionMessage', 'All Holes Completed!');
        hideElementBySelector('.holes-container');
        hideElementBySelector('hr');
        displayElement('yardageInformation', 'none');
        displayElement('new-round', 'inline-block');
    } else {
        // Logic for holes other than the 18th hole
        displayElement('nextHoleBtn', 'inline-block');
        setTextContent('holeCompletionMessage', 'Hole Completed!');

        const nextHoleBtn = document.getElementById('nextHoleBtn');
        nextHoleBtn.addEventListener('click', function () {
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