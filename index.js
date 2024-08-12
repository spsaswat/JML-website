// Get buttons
const expt3Button = document.getElementById("expt3-button");
const expt4Button = document.getElementById("expt4-button");

// Add click event listeners
expt3Button.addEventListener("click", () => {
    // Navigate to Expt 3 page (update the path if necessary)
    window.location.href = "./expt3_home.html";
});

expt4Button.addEventListener("click", () => {
    // Navigate to Expt 4 page
    window.location.href = "./expt4_home.html";
});
