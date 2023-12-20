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
