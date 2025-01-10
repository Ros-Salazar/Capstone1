// DOM Elements declarations
let archivedProjectsContainer;
let noArchivedProjectsText;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements after the document has loaded
    archivedProjectsContainer = document.getElementById('archivedProjectsContainer');
    noArchivedProjectsText = document.getElementById('noArchivedProjectsText');

    // Ensure all elements are found
    if (!archivedProjectsContainer || !noArchivedProjectsText) {
        console.error('One or more DOM elements are missing');
        return;
    }

    // Initialize the projects array
    let projects = [];

    // Fetch archived projects from the database when the page loads
    const fetchArchivedProjects = async () => {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/projects');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            projects = data
                .filter(project => project.archived) // Filter archived projects
                .map(project => ({
                    id: project.project_id,
                    name: project.project_name,
                    location: project.project_location,
                    description: project.project_description,
                    completion: project.project_completion || '0%',
                    archived: project.archived || false
                }));
            loadArchivedProjects();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    // Load Archived Projects
    const loadArchivedProjects = () => {
        archivedProjectsContainer.innerHTML = ''; // Clear existing archived projects

        const userRole = localStorage.getItem('userRole');

        projects.forEach((project) => {
            const projectBox = document.createElement('div');
            projectBox.classList.add('project-box');
            projectBox.setAttribute('data-id', project.id);
            projectBox.innerHTML = `
                <div class="project-options">
                    <i class="fas fa-trash-alt delete-icon"></i>
                    <i class="fas fa-archive unarchive-icon"></i>
                </div>
                <h3>${project.name}</h3>
                <p>${project.location}</p>
                <p class="completion-text">${project.completion} COMPLETED</p>
            `;

            // Hide delete icon for staff users
            if (userRole === 'staff') {
                projectBox.querySelector('.delete-icon').style.display = 'none';
            }

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
                        noArchivedProjectsText.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Deletion error:', error);
                    alert(`Error deleting project: ${error.message}`);
                }
                location.reload();
            });

            // Add unarchive functionality
            projectBox.querySelector('.unarchive-icon').addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                const projectId = projectBox.getAttribute('data-id');
                try {
                    const response = await fetch(`http://127.0.0.1:3000/api/unarchive_project/${projectId}`, {
                        method: 'PUT',
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const project = projects.find((p) => p.id === projectId);
                    if (project) {
                        project.archived = false;
                        console.log(`Project with ID ${projectId} was unarchived successfully.`);
                    }
                } catch (error) {
                    console.error('Unarchive error:', error);
                    alert(`Error unarchiving project: ${error.message}`);
                }
                location.reload();
            });

            archivedProjectsContainer.appendChild(projectBox);
        });

        noArchivedProjectsText.style.display = archivedProjectsContainer.children.length ? 'none' : 'block';
    };

    // Initial archived projects load
    fetchArchivedProjects();
});