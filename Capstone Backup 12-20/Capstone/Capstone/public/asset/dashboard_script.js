// Get the elements
const newProjectBtn = document.getElementById('newProjectBtn');
const popupWindow = document.getElementById('popupWindow');
const closeBtns = document.querySelectorAll('.close-btn');
const projectForm = document.getElementById('projectForm');
const projectContainer = document.getElementById('projectContainer');
const noProjectsText = document.getElementById('noProjectsText');
const editPopupWindow = document.getElementById('editPopupWindow');
const editProjectForm = document.getElementById('editProjectForm');
let currentProjectBox = null; // Track the project being edited

// Show popup when 'Add Project' is clicked
newProjectBtn.addEventListener('click', () => {
    popupWindow.style.display = 'flex';
});

// Close popup when 'X' is clicked
closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        popupWindow.style.display = 'none';
        editPopupWindow.style.display = 'none';
    });
});

// Handle project creation
projectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Get form values
    const projectName = document.getElementById('project-name').value;
    const location = document.getElementById('location').value;
    const group = document.getElementById('group').value; // Get the selected group

    // Create project box
    const projectBox = document.createElement('div');
    projectBox.classList.add('project-box', group); // Add group class for styling

    // Add group indicator with a small colored element
    const groupIndicator = document.createElement('div');
    groupIndicator.classList.add('group-indicator', group); // Add group class for indicator styling

    projectBox.innerHTML = `
        <h3>${projectName}</h3>
        <p>${location}</p>
        <p class="completion-text">0% COMPLETED</p>
        <i class="fas fa-pencil-alt edit-icon"></i>
    `;
    
    projectBox.insertBefore(groupIndicator, projectBox.firstChild); // Insert the indicator at the top

    // Add project box to the container
    projectContainer.appendChild(projectBox);
    noProjectsText.style.display = 'none';

    // Clear form and close popup
    projectForm.reset();
    popupWindow.style.display = 'none';

    // Edit button functionality
    const editIcon = projectBox.querySelector('.edit-icon');
    editIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering project details click event
        currentProjectBox = projectBox;
        document.getElementById('edit-project-name').value = projectBox.querySelector('h3').textContent;
        document.getElementById('edit-location').value = projectBox.querySelector('p').textContent;
        editPopupWindow.style.display = 'flex';
    });

    // Add click functionality to navigate to ProjectTemplate.html
    projectBox.addEventListener('click', () => {
    const projectName = projectBox.querySelector('h3').textContent;
    const location = projectBox.querySelector('p').textContent;

    // Pass project details as query parameters
    const queryParams = new URLSearchParams({
        name: projectName,
        location: location,
    }).toString();

    // Navigate to ProjectTemplate.html with query parameters
    window.location.href = `ProjectTemplate.html?${queryParams}`;
});


    enableDragAndDrop(projectBox); // Enable drag-and-drop
});

// Handle project editing
editProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const updatedProjectName = document.getElementById('edit-project-name').value;
    const updatedLocation = document.getElementById('edit-location').value;
    currentProjectBox.querySelector('h3').textContent = updatedProjectName;
    currentProjectBox.querySelector('p').textContent = updatedLocation;
    editPopupWindow.style.display = 'none';
    editProjectForm.reset();
});

// Function to enable drag-and-drop functionality
function enableDragAndDrop(projectBox) {
    projectBox.addEventListener('dragstart', () => {
        projectBox.classList.add('dragging');
    });
    projectBox.addEventListener('dragend', () => {
        projectBox.classList.remove('dragging');
    });
    projectContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(projectContainer, e.clientY);
        if (afterElement == null) {
            projectContainer.appendChild(projectBox);
        } else {
            projectContainer.insertBefore(projectBox, afterElement);
        }
    });
}

// Helper function for drag-and-drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.project-box:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset: offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
