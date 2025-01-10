import { createTable, createAddRowButton, createHeaderCell, createCell, addRow, addColumn} from './domManipulation.js';


export async function fetchProjectDetails(projectId) {
    try {
        const projectResponse = await fetch(`http://127.0.0.1:3000/api/project/${projectId}`);
        if (!projectResponse.ok) {
            throw new Error(`HTTP error! status: ${projectResponse.status}`);
        }
        const project = await projectResponse.json();
        const projectNameElement = document.getElementById('projectName');
        const projectDescriptionElement = document.getElementById('projectDescription');
        projectNameElement.textContent = project.project_name;
        projectDescriptionElement.textContent = project.project_description;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
export async function fetchProjectData(projectId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/project/${projectId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projectData = await response.json();
        return projectData;
    } catch (error) {
        console.error('Error fetching project data:', error);
        return null;
    }
}
export async function fetchGroupDataWithTimeline(projectId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/project/${projectId}/groups_with_timeline`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const groupData = await response.json();
        return groupData;
    } catch (error) {
        console.error('Error fetching group data:', error);
        return null;
    }
}
export async function addGroup(projectId, groupContainer) {
    try {
        const groupName = prompt("Enter name:");
        if (!groupName) return;
        
        const response = await fetch('http://127.0.0.1:3000/api/proj_groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                name: groupName,
            }),
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const group = await response.json();
        const groupId = group.id;
        const table = createTable(groupId, groupName);
        groupContainer.appendChild(table);
        createAddRowButton(table, groupId, groupContainer);

        // Add three rows to the table as a template
        for (let i = 0; i < 3; i++) {
            await addRow(table, table.rows[0]);
        }

        // Select the header row and add the "Status" column
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            await addColumn('Text', table, headerRow);
            await addColumn('Status', table, headerRow);
            await addColumn('Timeline', table, headerRow);
            await addColumn('Key Persons', table, headerRow);
        } else {
            throw new Error('Header row not found');
        }
        
    } catch (error) {
        console.error('Error creating group:', error);
    }
}
export async function saveProjectDetails(projectId) {
    const projectNameElement = document.getElementById('projectName');
    const projectDescriptionElement = document.getElementById('projectDescription');
    const projectName = projectNameElement.textContent.trim();
    const projectDescription = projectDescriptionElement.textContent.trim();

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/update_project_details/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_name: projectName,
                project_description: projectDescription
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log('Project details update response:', result);
    } catch (error) {
        console.error('Update error:', error);
        alert(`Error updating project details: ${error.message}`);
    }
}
export async function fetchAndRenderGroups(projectId) {
    try {
        const groupContainer = document.querySelector('.group-container');
        groupContainer.innerHTML = ''; // Clear existing groups to prevent duplication

        const groupsResponse = await fetch(`http://127.0.0.1:3000/api/project/${projectId}/groups`);
        if (!groupsResponse.ok) {
            throw new Error(`HTTP error! status: ${groupsResponse.status}`);
        }
        const groups = await groupsResponse.json();

        for (const group of groups) {
            const table = createTable(group.id, group.name); // Pass group name to createTable
            groupContainer.appendChild(table);
            createAddRowButton(table, group.id, groupContainer); // Ensure groupContainer is passed

            // Fetch and render rows for each group
            await fetchAndRenderRows(group.id, table); // Move fetching rows to dedicated function
        }
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}
export async function fetchAndRenderRows(groupId, table) { // fetch and display
    try {
        const rowsResponse = await fetch(`http://127.0.0.1:3000/api/group/${groupId}/rows`);
        if (!rowsResponse.ok) {
            throw new Error(`HTTP error! status: ${rowsResponse.status}`);
        }
        const rows = await rowsResponse.json();

        const headerRow = table.rows[0];
        for (const row of rows) {
            const tr = document.createElement('tr');
            tr.dataset.rowId = row.id; // Set the row ID

            Array.from(headerRow.cells).forEach((header, index) => {
                const cell = createCell(header.textContent);
                cell.dataset.columnId = header.dataset.columnId; // Ensure cell has correct data-column-id
                tr.appendChild(cell);
            });

            table.appendChild(tr);
        }

        // Fetch and render cell data
        await fetchCellDataAndRender(groupId, table); // Move fetching cell data to dedicated function
    } catch (error) {
        console.error('Error fetching rows:', error);
    }
}
export async function fetchColumnsAndRender(groupId, table, headerRow) { //fetch and display
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/group/${groupId}/columns`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const columns = await response.json();
        console.log('Fetched columns:', columns); // Add logging

        columns.forEach(column => {
            const newHeader = createHeaderCell(column.name, '', true, column.id, column.field); // Pass column.id and column.field
            newHeader.dataset.columnId = column.id; // Ensure header has correct data-column-id
            headerRow.insertBefore(newHeader, headerRow.lastChild);

            Array.from(table.rows).forEach((row, index) => {
                if (index === 0) return; // Skip header row
                const newCell = createCell(column.name);
                newCell.dataset.columnId = column.id; // Ensure cell has correct data-column-id
                row.insertBefore(newCell, row.lastChild);
            });
        });
    } catch (error) {
        console.error('Error fetching columns:', error);
    }
}
//function to fetch all cell data
export async function fetchCellDataAndRender(groupId, table) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/group/${groupId}/cell_data`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const cellData = await response.json();
        console.log('Fetched cell data:', cellData); // Add logging

        cellData.forEach(data => {
            const row = table.querySelector(`tr[data-row-id="${data.row_id}"]`);
            const cell = row.querySelector(`td[data-column-id="${data.column_id}"]`);
            if (cell) {
                if (cell.dataset.field === 'Upload') {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = data.value;
                    downloadLink.textContent = 'Download';
                    cell.appendChild(downloadLink);
                } else {
                    cell.textContent = data.value; // Set the cell data
                }
            }
        });
    } catch (error) {
        console.error('Error fetching cell data:', error);
    }
}

