// List of categories
const categories = [
    "ANIMAL", "ARMY", "CHILDREN", "COMPANY", "COUNTRY SPECIFIC", 
    "EDUCATION", "ENVIRONMENT", "FAMILY", "FOOD", "GENDER", 
    "GENERAL", "HEALTH", "HOMELESS", "LABOUR", "LOCAL", "RACE", "REFUGEE", "RELIGION"
];

// Path to the button image
const buttonImagePath = "./Cloud_icon.png";

// Get the button container element
const buttonContainer = document.getElementById("button-container");

// Create buttons dynamically
categories.forEach(category => {
    // Create button element
    const button = document.createElement("button");
    button.className = "category-button";

    // Create image element
    const img = document.createElement("img");
    img.src = buttonImagePath;
    img.alt = category;

    // Append image and text to button
    button.appendChild(img);
    button.appendChild(document.createTextNode(category));

    // Add click event listener to button
    button.addEventListener("click", () => {
        window.location.href = `./expt5_heatmap/${category}_heatmap.html`;
    });

    // Append button to container
    buttonContainer.appendChild(button);
});
