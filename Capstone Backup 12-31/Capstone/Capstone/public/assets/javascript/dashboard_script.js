// DOM Elements declarations
let newProjectBtn;
let popupWindow;
let closeBtns;
let projectForm;
let projectContainer;
let noProjectsText;
let editPopupWindow;
let editProjectForm;
let projectList;
let navigationPane;
let archiveLink;
let archivePopupWindow;
let archivedProjectsContainer;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements after the document has loaded
    newProjectBtn = document.getElementById('newProjectBtn');
    popupWindow = document.getElementById('popupWindow');
    closeBtns = document.querySelectorAll('.close-btn');
    projectForm = document.getElementById('projectForm');
    projectContainer = document.getElementById('projectContainer');
    noProjectsText = document.getElementById('noProjectsText');
    editPopupWindow = document.getElementById('editPopupWindow');
    editProjectForm = document.getElementById('editProjectForm');
    projectList = document.getElementById('projectList');
    navigationPane = document.getElementById('navigationPane');
    archiveLink = document.getElementById('archiveLink');
    archivePopupWindow = document.getElementById('archivePopupWindow');
    archivedProjectsContainer = document.getElementById('archivedProjectsContainer');

    // Ensure all elements are found
    if (!newProjectBtn || !popupWindow || !projectForm || !projectContainer || !noProjectsText || !editPopupWindow || !editProjectForm || !projectList || !navigationPane || !archiveLink || !archivePopupWindow || !archivedProjectsContainer) {
        console.error('One or more DOM elements are missing');
        return;
    }

    // Initialize the projects array
    let projects = [];

    // Fetch projects from the database when the page loads
    const fetchProjects = async () => {
        try {
            console.log('Fetching projects...');
            const response = await fetch('http://127.0.0.1:3000/api/projects');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            projects = data.map(project => ({
                id: project.project_id,
                name: project.project_name,
                location: project.project_location,
                description: project.project_description,
                completion: project.project_completion || '0%',
                group: 'default'
            }));
            console.log('Projects fetched:', projects);
            loadProjects();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    // Show popup when 'Add Project' is clicked
    newProjectBtn.addEventListener('click', () => {
        popupWindow.style.display = 'flex';
    });

    // Close popup
    closeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            popupWindow.style.display = 'none';
            editPopupWindow.style.display = 'none';
            archivePopupWindow.style.display = 'none';
        });
    });

    // Add Project
    projectForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const projectName = document.getElementById('project-name').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;

        try {
            const response = await fetch('http://127.0.0.1:3000/api/create_project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_name: projectName,
                    project_location: location,
                    project_description: description,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log('Project creation response:', result);

            const project = {
                id: result.projectId,
                name: projectName,
                location: location,
                description: description,
                group: 'default',
                completion: '0%',
            };

            projects.push(project);
            loadProjects();

            projectForm.reset();
            popupWindow.style.display = 'none';
        } catch (error) {
            console.error('Fetch error:', error);
            alert(`Error creating project: ${error.message}`);
        }
    });

    let currentProjectBox = null;

    // Redirect to Project Template
    const openProject = (projectId) => {
        window.location.href = `projectTemplate.html?projectId=${projectId}`;
    };

    // Populate Navigation Pane
    const populateNavigationPane = () => {
        projectList.innerHTML = ''; // Clear existing items
        projects.forEach((project) => {
            const li = document.createElement('li');
            li.textContent = project.name;
            li.className = project.group;
            li.addEventListener('click', () => openProject(project.id));
            projectList.appendChild(li);
        });
    };

    // Archive Project
    const archiveProject = (projectId) => {
        console.log(`Archiving project with ID: ${projectId}`); // Debugging line
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            project.group = 'archived';
            console.log(`Project with ID: ${projectId} archived`); // Debugging line
            loadProjects();
        } else {
            console.error(`Project with ID: ${projectId} not found`);
        }
    };

    // Load Projects
    const loadProjects = () => {
        projectContainer.innerHTML = ''; // Clear existing projects
        archivedProjectsContainer.innerHTML = ''; // Clear existing archived projects
        
        projects.forEach((project) => {
            const projectBox = document.createElement('div');
            projectBox.classList.add('project-box', project.group);
            projectBox.setAttribute('data-id', project.id);
            projectBox.innerHTML = `
                <div class="project-options">
                    <i class="fas fa-trash-alt delete-icon"></i>
                    <i class="fas fa-archive archive-icon"></i>
                </div>
                <h3>${project.name}</h3>
                <p>${project.location}</p>
                <p class="completion-text">${project.completion} COMPLETED</p>
                <i class="fas fa-pencil-alt edit-icon"></i>
            `;
    
            // Add click event for redirecting to project template
            projectBox.addEventListener('click', () => openProject(project.id));
    
            // Add click event for editing project
            projectBox.querySelector('.edit-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                currentProjectBox = projectBox;
                document.getElementById('edit-project-name').value = project.name;
                document.getElementById('edit-location').value = project.location;
                document.getElementById('edit-description').value = project.description;
                editPopupWindow.style.display = 'flex';
            });
    
            // Add delete functionality
            projectBox.querySelector('.delete-icon').addEventListener('click', async (e) => {
                e.stopPropagation();
                const projectId = projectBox.getAttribute('data-id');
                console.log(`Deleting project with ID: ${projectId}`);
    
                // Make a delete request to the server
                try {
                    const response = await fetch(`http://127.0.0.1:3000/api/delete_project/${projectId}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    console.log('Project deleted successfully');
    
                    // Remove the project from the projects array
                    projects = projects.filter((p) => p.id !== projectId);
    
                    // Remove the project element from the DOM
                    projectBox.remove();
    
                    // Update the noProjectsText display
                    if (projects.length === 0) {
                        noProjectsText.style.display = 'block';
                    }
    
                } catch (error) {
                    console.error('Deletion error:', error);
                    alert(`Error deleting project: ${error.message}`);
                }
            });
    
            // Add archive functionality
            projectBox.querySelector('.archive-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = projectBox.getAttribute('data-id');
                console.log(`Archiving project with ID: ${projectId}`); // Add this line to confirm the event listener is working
                archiveProject(projectId);
            });
    
            if (project.group === 'default') {
                projectContainer.appendChild(projectBox);
            } else if (project.group === 'archived') {
                archivedProjectsContainer.appendChild(projectBox);
            }
        });
    
        noProjectsText.style.display = projectContainer.children.length ? 'none' : 'block';
    };

    // Edit Project
    editProjectForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const updatedProjectName = document.getElementById('edit-project-name').value;
        const updatedLocation = document.getElementById('edit-location').value;
        const updatedDescription = document.getElementById('edit-description').value;

        const projectId = currentProjectBox.getAttribute('data-id');
        const project = projects.find((p) => p.id === projectId);

        if (project) {
            console.log('Updating project:', project);

            project.name = updatedProjectName;
            project.location = updatedLocation;
            project.description = updatedDescription;

            // Make an update request to the server
            try {
                const response = await fetch(`http://127.0.0.1:3000/api/update_project/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        project_name: updatedProjectName,
                        project_location: updatedLocation,
                        project_description: updatedDescription,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
                }

                const result = await response.json();
                console.log('Project update response:', result);

                // Update the project box display
                currentProjectBox.querySelector('h3').textContent = updatedProjectName;
                currentProjectBox.querySelector('p').textContent = updatedLocation;

                // Hide the edit popup
                editPopupWindow.style.display = 'none';
                editProjectForm.reset();

                // Reload the projects to reflect the changes
                loadProjects();

            } catch (error) {
                console.error('Update error:', error);
                alert(`Error updating project: ${error.message}`);
            }
        }
    });


  // Handle navigation pane toggle
  document.querySelector('.header-right a[href="#projects"]').addEventListener('click', (e) => {
    e.preventDefault();
    if (navigationPane.style.display === 'none' || !navigationPane.style.display) {
        populateNavigationPane();
        navigationPane.style.display = 'block';
    } else {
        navigationPane.style.display = 'none';
    }
});

// Show archive popup when 'Archive' is clicked
archiveLink.addEventListener('click', (e) => {
    e.preventDefault();
    archivePopupWindow.style.display = 'flex';
    loadProjects(); // Ensure the archived projects are loaded when the popup is displayed
});

// Initial projects load
fetchProjects();
});