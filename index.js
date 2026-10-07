// Get buttons
const expt2Button = document.getElementById("expt2-button");
const expt3Button = document.getElementById("expt3-button");
const expt4Button = document.getElementById("expt4-button");
const expt5Button = document.getElementById("expt5-button");
const coordinationButton = document.getElementById("coordination-button");
const expt6Button = document.getElementById("expt6-button");

// Add click event listeners
expt2Button.addEventListener("click", () => {
    // Navigate to Expt 2 page (update the path if necessary)
    window.location.href = "./expt2_home.html"; // Update this to the correct path if needed
});

expt3Button.addEventListener("click", () => {
    // Navigate to Expt 3 page (update the path if necessary)
    window.location.href = "./expt3_home.html"; // Update this to the correct path if needed
});

expt4Button.addEventListener("click", () => {
    // Navigate to Expt 4 page
    window.location.href = "./expt4_home.html";
});

expt5Button.addEventListener("click", () => {
    // Navigate to Expt 5 page
    window.location.href = "./expt5_home.html";
});

coordinationButton.addEventListener("click", () => {
    window.location.href = "./coordination_home.html";
});

expt6Button.addEventListener("click", () => {
    window.location.href = "./expt6_home.html";
});
