let projectsData = []; // Store fetched projects data

document.addEventListener("DOMContentLoaded", function() {
    fetch('http://127.0.0.1:3000/api/projects')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched projects data:', data); // Log the data to console
            projectsData = data; // Store the fetched data
            const projectsTable = document.getElementById('projects-table');
            data.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project.project_name}</td>
                    <td>${project.project_location}</td>
                    <td>${project.project_description}</td>
                    <td>${project.project_completion}</td>
                    <td>${new Date(project.created_at).toLocaleDateString()}</td>
                    <td>
                        <div class="dropdown">
                            <button class="dropdown-btn">⋮</button>
                            <div class="dropdown-content">
                                <a href="#" onclick="editProject('${encodeURIComponent(JSON.stringify(project))}')">Edit Project</a>
                                <a href="#" onclick="deleteProject('${project.project_id}')">Delete Project</a>
                                <a href="#" onclick="downloadProjectAsCSV('${project.project_id}')">Download as .csv</a>
                            </div>
                        </div>
                    </td>
                `;
                projectsTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching projects:', error));
});

function editProject(project) {
    project = JSON.parse(decodeURIComponent(project));
    console.log('Edit project:', project); // Debugging: log project data
    // Show the edit form popup
    const popup = document.getElementById('edit-popup');
    const form = document.getElementById('edit-form');
    popup.style.display = 'block';

    // Populate the form with the project's current data
    form.projectId.value = project.project_id; // Set the hidden projectId field
    form.projectName.value = project.project_name;
    form.projectLocation.value = project.project_location;
    form.projectDescription.value = project.project_description;
}

function closePopup() {
    document.getElementById('edit-popup').style.display = 'none';
}

function saveEdits(event) {
    event.preventDefault();
    const form = event.target;

    const projectId = form.projectId.value;
    const updatedProject = {
        project_name: form.projectName.value,
        project_location: form.projectLocation.value,
        project_description: form.projectDescription.value
    };

    console.log('Saving edits for project:', projectId, updatedProject); // Debugging: log updated project data

    fetch(`http://127.0.0.1:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProject)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        alert('Project updated successfully');
        closePopup();
        location.reload(); // Reload the page to reflect changes
    })
    .catch(error => console.error('Error updating project:', error));
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        fetch(`http://127.0.0.1:3000/api/projects/${projectId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            alert('Project deleted successfully');
            location.reload(); // Reload the page to reflect changes
        })
        .catch(error => console.error('Error deleting project:', error));
    }
}

function downloadProjectAsCSV(projectId) {
    console.log('Attempting to download project as CSV:', projectId); // Debugging: log projectId
    const project = projectsData.find(p => p.project_id.toString() === projectId);

    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }

    const csvContent = `data:text/csv;charset=utf-8,${[
        ['Project Name', 'Project Location', 'Project Description', 'Project Completion', 'Created At'],
        [project.project_name, project.project_location, project.project_description, project.project_completion, new Date(project.created_at).toLocaleDateString()]
    ].map(e => e.join(",")).join("\n")}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.project_name}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
}