// Get buttons
const expt2Button = document.getElementById("expt2-button");
const expt3Button = document.getElementById("expt3-button");
const expt4Button = document.getElementById("expt4-button");

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
