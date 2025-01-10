// DOM Elements declarations
let newProjectBtn;
let popupWindow;
let closeBtns;
let projectForm;
let projectContainer;
let noProjectsText;
let editPopupWindow;
let editProjectForm;
let updateProjectBtn;
let projectList;
let navigationPane;
let archiveLink;

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
    updateProjectBtn = document.getElementById('updateProjectBtn');
    projectList = document.getElementById('projectList');
    navigationPane = document.getElementById('navigationPane');
    archiveLink = document.getElementById('archiveLink');

    // Ensure all elements are found
    if (!newProjectBtn || !popupWindow || !projectForm || !projectContainer || !noProjectsText || !editPopupWindow || !editProjectForm || !updateProjectBtn || !projectList || !navigationPane || !archiveLink) {
        console.error('One or more DOM elements are missing');
        return;
    }

    // Initialize the projects array
    let projects = [];

    // Fetch projects from the database when the page loads
    const fetchProjects = async () => {
        try {
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
                archived: project.archived || false
            }));
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

            const project = {
                id: result.projectId,
                name: projectName,
                location: location,
                description: description,
                archived: false,
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
            if (!project.archived) {
                const li = document.createElement('li');
                li.textContent = project.name;
                li.addEventListener('click', () => openProject(project.id));
                projectList.appendChild(li);
            }
        });
    };

    // Load Projects
    const loadProjects = () => {
        projectContainer.innerHTML = ''; // Clear existing projects

        projects.forEach((project) => {
            if (!project.archived) {
                const projectBox = document.createElement('div');
                projectBox.classList.add('project-box');
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


                // Hide the edit, archive, and delete icons for staff users
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'staff') {
                    projectBox.querySelector('.edit-icon').style.display = 'none';
                    projectBox.querySelector('.delete-icon').style.display = 'none';
                }

                // Add click event for editing project
                projectBox.querySelector('.edit-icon').addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    currentProjectBox = projectBox;
                    document.getElementById('edit-project-name').value = project.name;
                    document.getElementById('edit-location').value = project.location;
                    document.getElementById('edit-description').value = project.description;
                    editPopupWindow.style.display = 'flex';
                });

                // Add delete functionality
                projectBox.querySelector('.delete-icon').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const projectId = projectBox.getAttribute('data-id');
                    try {
                        const response = await fetch(`http://127.0.0.1:3000/api/delete_project/${projectId}`, {
                            method: 'DELETE',
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        projects = projects.filter((p) => p.id !== projectId);
                        projectBox.remove();
                        if (projects.length === 0) {
                            noProjectsText.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Deletion error:', error);
                        alert(`Error deleting project: ${error.message}`);
                    }
                    location.reload();
                });

                // Add archive functionality
                projectBox.querySelector('.archive-icon').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const projectId = projectBox.getAttribute('data-id');
                    try {
                        const response = await fetch(`http://127.0.0.1:3000/api/archive_project/${projectId}`, {
                            method: 'PUT',
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const project = projects.find((p) => p.id === projectId);
                        if (project) {
                            project.archived = true;
                            console.log(`Project with ID ${projectId} was archived successfully.`);
                        }
                    } catch (error) {
                        console.error('Archive error:', error);
                        alert(`Error archiving project: ${error.message}`);
                    }
                    location.reload();
                });

                projectContainer.appendChild(projectBox);
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
            project.name = updatedProjectName;
            project.location = updatedLocation;
            project.description = updatedDescription;

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

                currentProjectBox.querySelector('h3').textContent = updatedProjectName;
                currentProjectBox.querySelector('p').textContent = updatedLocation;
                editPopupWindow.style.display = 'none';
                editProjectForm.reset();
                await fetchProjects(); // Refresh the projects list
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

    // Initial projects load
    fetchProjects();
});