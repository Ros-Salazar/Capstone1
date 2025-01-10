import { fetchColumnsAndRender, fetchGroupDataWithTimeline } from './apiCalls.js';

export function setActiveButton(buttonId) {
    const mainTableBtn = document.getElementById('mainTableBtn');
    const calendarBtn = document.getElementById('calendarBtn');
    mainTableBtn.classList.remove('active');
    calendarBtn.classList.remove('active');
    document.getElementById(buttonId).classList.add('active');
}

export function createTable(groupId, groupName) { // creation of table
    const table = document.createElement('table');
    table.className = 'group-table';
    table.dataset.id = groupId;

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = createHeaderRow(table, groupId, groupName);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    fetchColumnsAndRender(groupId, table, headerRow).then(() => { // fetching of displayed fields
    });

    return table;
}
export async function addRow(table, headerRow) {
    const groupId = table.dataset.id;

    try {
        const response = await fetch('http://127.0.0.1:3000/api/group_rows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id: groupId }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const row = await response.json();
        const rowId = row.id;

        const tr = document.createElement('tr');
        tr.dataset.rowId = rowId;

        Array.from(headerRow.cells).forEach((header, index) => {
            let newCell;
            const columnId = header.dataset.columnId;
            const field = header.dataset.field;
            const cellId = `${rowId}-${columnId}`; // Generate unique ID for the cell

            if (header.id === 'fixedColumnHeader') {
                newCell = createActionCell(tr);
                newCell.className = 'fixed-column';
            } else if (header.id === 'plusHeader') {
                newCell = document.createElement('td');
                newCell.className = 'plus-header';
                newCell.dataset.columnId = 'plusHeader';
                newCell.contentEditable = false;
            } else {
                switch (field) {
                    case 'Numbers':
                        newCell = createNumberCell(columnId);
                        break;
                    case 'Status':
                        newCell = createStatusCell(columnId);
                        break;
                    case 'Key Persons':
                        newCell = createKeyPersonsCell(columnId);
                        break;
                    case 'start_date':
                        newCell = createDateCell(columnId, 'start_date');
                        break;
                    case 'due_date':
                        newCell = createDateCell(columnId, 'due_date');
                        break;
                    case 'Upload File':
                        newCell = createUploadFileCell(columnId);
                        break;
                    default:
                        newCell = createCell(columnId);
                }
            }

            newCell.id = cellId; // Assign the unique ID to the cell
            tr.appendChild(newCell);
        });

        table.appendChild(tr);

        // Hide the plus-header column and its cells for staff users
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'staff') {
            const fixedColumnIndex = Array.from(headerRow.children).findIndex(header => header.id === 'fixedColumnHeader');
            const plusColumnIndex = Array.from(headerRow.children).findIndex(header => header.id === 'plusHeader');

            Array.from(tr.cells).forEach((cell, index) => {
                if (index === fixedColumnIndex || index === plusColumnIndex) {
                    cell.style.display = 'none';
                }
            });
        }

    } catch (error) {
        console.error('Error adding row:', error);
    }
}

async function deleteColumn(header, columnId) { // options for deleting columns
    if (!columnId) {
        console.error('Invalid columnId:', columnId);
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/group_column/${columnId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        // Remove the column from the table
        const table = header.closest('table');
        const columnIndex = Array.from(header.parentElement.children).indexOf(header);

        Array.from(table.rows).forEach(row => {
            row.deleteCell(columnIndex);
        });

        console.log('Column deleted successfully');
    } catch (error) {
        console.error('Error deleting column:', error);
    }
}

export function createAddRowButton(table, groupId, groupContainer) { // Assign task by creating another row
    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'add-item-btn';
    addRowBtn.dataset.id = groupId;
    addRowBtn.textContent = 'Assign Task';

    const userRole = localStorage.getItem('userRole');
    if (userRole === 'staff') {
        addRowBtn.disabled = true;
        addRowBtn.style.cursor = 'not-allowed';
    } else {
        addRowBtn.addEventListener('click', () => addRow(table, table.rows[0]));
    }

    groupContainer.appendChild(addRowBtn);
    return addRowBtn;
}

export function createHeaderRow(table, groupId, groupName) { 
    const headerRow = document.createElement('tr');

    // Fixed Column Header
    const fixedColumnHeader = document.createElement('th');
    fixedColumnHeader.className = 'fixed-column';
    fixedColumnHeader.id = 'fixedColumnHeader'; // Assigning a dedicated ID
    const dropdownBtn = document.createElement('button');
    dropdownBtn.textContent = '⋮';
    dropdownBtn.className = 'dropdown-btn';

    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.style.display = 'none';

    const deleteGroupOption = document.createElement('div');
    deleteGroupOption.textContent = 'Delete Group';
    deleteGroupOption.className = 'dropdown-item';
    deleteGroupOption.addEventListener('click', async () => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/group/${groupId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const addItemButton = document.querySelector(`.add-item-btn[data-id="${groupId}"]`);
            if (addItemButton) addItemButton.remove();
            table.remove();

            console.log('Group deleted successfully');
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    });

    dropdownBtn.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    dropdownMenu.appendChild(deleteGroupOption);
    fixedColumnHeader.appendChild(dropdownBtn);
    fixedColumnHeader.appendChild(dropdownMenu);
    headerRow.appendChild(fixedColumnHeader);

    // Group Name Header
    const groupNameHeader = createHeaderCell(groupName, 'groupTask', true);
    //groupNameHeader.dataset.columnId = group; // Set a unique column ID
    headerRow.appendChild(groupNameHeader);

    // Plus Header for Adding Columns
    const plusHeader = createHeaderCell('+', 'plus-header');
    plusHeader.id = 'plusHeader'; 
    plusHeader.classList.add('task-columns'); // Adding class directly
    plusHeader.dataset.columnId = 2; // Set a unique column ID
    plusHeader.style.cursor = 'pointer';

    const columnDropdownMenu = createDropdownMenu(
        ['Text', 'Numbers', 'Status', 'Key Persons', 'Timeline', 'Upload File'],
        async (option) => {
            if (option === 'Timeline') {
                await addTimelineColumns(table, headerRow);
            } else {
                await addColumn(option, table, headerRow);
            }
            columnDropdownMenu.style.display = 'none';
        }
    );

    plusHeader.addEventListener('click', () => {
        columnDropdownMenu.style.display = columnDropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    plusHeader.appendChild(columnDropdownMenu);
    headerRow.appendChild(plusHeader);

    // Hide the fixed column and plus header for staff users
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'staff') {
        fixedColumnHeader.style.display = 'none';
        plusHeader.style.display = 'none'; // Hide the plus header itself

        // Hide the columns associated with fixed-column header and plus-header
        const fixedColumnIndex = Array.from(headerRow.children).indexOf(fixedColumnHeader);
        const plusColumnIndex = Array.from(headerRow.children).indexOf(plusHeader);

        table.querySelectorAll('tr').forEach((row) => {
            if (row.children[fixedColumnIndex]) {
                row.children[fixedColumnIndex].style.display = 'none';
            }
            if (row.children[plusColumnIndex]) {
                row.children[plusColumnIndex].style.display = 'none';
            }
        });
    }

    return headerRow;
}

export function createActionCell(row) { // the options for the deletiong of row
    const cell = document.createElement('td');
    cell.className = 'fixed-column';

    const dropdownBtn = document.createElement('button');
    dropdownBtn.textContent = '⋮';
    dropdownBtn.className = 'dropdown-btn';

    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.style.display = 'none';

    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete Row';
    deleteOption.className = 'dropdown-item';
    deleteOption.addEventListener('click', async () => {
        const rowId = row.dataset.rowId;
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/group_row/${rowId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            row.remove();
            console.log('Row deleted successfully');
        } catch (error) {
            console.error('Error deleting row:', error);
        }
    });

    dropdownBtn.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    dropdownMenu.appendChild(deleteOption);
    cell.appendChild(dropdownBtn);
    cell.appendChild(dropdownMenu);

    // Hide the fixed column for staff users
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'staff') {
        cell.style.display = 'none';
    }

    return cell;
}

export function createHeaderCell(text, className = '', editable = false, columnId = null, field = '') {
    const header = document.createElement('th');
    header.className = className;
    header.dataset.field = field;

    if (text === '+') {
        header.textContent = text;
        header.contentEditable = false;
        header.style.cursor = 'default';
    } else if (editable) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';
        container.style.width = '100%';

        const textNode = document.createElement('span');
        textNode.textContent = text;
        textNode.contentEditable = true; // Make the textNode itself editable
        textNode.dataset.columnId = columnId;

        textNode.addEventListener('blu  r', async function () {
            const newName = textNode.textContent.trim();

            if (columnId) {
                try {
                    const response = await fetch(`http://127.0.0.1:3000/api/group_column/${columnId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newName }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
                    }

                    const result = await response.json();
                    console.log('Column name updated:', result);
                } catch (error) {
                    console.error('Error updating column name:', error);
                    alert(`Error updating column name: ${error.message}`);
                }
            }
        });

        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'relative';

        const dropdownBtn = document.createElement('button');
        dropdownBtn.textContent = '⋮';
        dropdownBtn.className = 'dropdown-btn header-dropdown-btn'; 

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.display = 'none';

        const deleteOption = document.createElement('div');
        deleteOption.textContent = 'Delete Column';
        deleteOption.className = 'dropdown-item';
        deleteOption.addEventListener('click', async () => {
            await deleteColumn(header, columnId);
        });

        dropdownBtn.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        dropdownMenu.appendChild(deleteOption);
        dropdownContainer.appendChild(dropdownBtn);
        dropdownContainer.appendChild(dropdownMenu);

        container.appendChild(textNode);
        container.appendChild(dropdownContainer);
        header.appendChild(container);

        // Hide dropdown buttons for staff users
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'staff') {
            Array.from(header.querySelectorAll('.dropdown-btn')).forEach(button => {
                button.style.display = 'none'; // Hide the three-dot buttons
            });
        }
    } else {
        header.textContent = text;
    }

    return header;
}

export async function addColumn(option, table, headerRow) {
    const groupId = table.dataset.id;
    const enumFields = ['TEXT', 'Numbers', 'Status', 'Key Persons', 'Timeline', 'Upload File'];

    if (option === 'Timeline') {
        // Handle Timeline as a special case with two columns
        const dateFields = [
            { name: 'Start Date', field: 'start_date' },
            { name: 'Due Date', field: 'due_date' }
        ];

        for (let { name, field } of dateFields) {
            try {
                const response = await fetch('http://127.0.0.1:3000/api/group_columns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        group_id: groupId,
                        name: name,
                        type: 'Timeline',
                        field: field
                    }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const column = await response.json();

                const newHeader = createHeaderCell(name, '', true, column.id, field);
                headerRow.insertBefore(newHeader, headerRow.lastChild);

                Array.from(table.rows).forEach((row, rowIndex) => {
                    if (rowIndex === 0) return;
                    const dateCell = createDateCell(column.id, field);
                    row.insertBefore(dateCell, row.lastChild);
                });

                // Hide the plus-header column and its cells for staff users
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'staff') {
                    newHeader.style.display = 'none';
                    Array.from(table.rows).forEach(row => {
                        row.cells[row.cells.length - 1].style.display = 'none';
                    });
                }

            } catch (error) {
                console.error(`Error adding ${name} column:`, error);
            }
        }
    } else {
        // Handle all other single-column additions
        try {
            const response = await fetch('http://127.0.0.1:3000/api/group_columns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_id: groupId,
                    name: option,
                    type: option,
                    field: option
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const column = await response.json();

            const field = enumFields.includes(option) ? option : 'TEXT';

            const newHeader = createHeaderCell(option, '', true, column.id, field);
            newHeader.dataset.columnId = column.id;
            newHeader.dataset.field = field;
            headerRow.insertBefore(newHeader, headerRow.lastChild);

            Array.from(table.rows).forEach((row, index) => {
                if (index === 0) return;
                let newCell;
                if (field === 'Numbers') {
                    newCell = createNumberCell(column.id);
                } else if (field === 'Status') {
                    newCell = createStatusCell(column.id);
                } else if (field === 'Key Persons') {
                    newCell = createKeyPersonsCell(column.id);
                } else if (field === 'Upload File') {
                    newCell = createUploadFileCell(column.id);
                } else {
                    newCell = createCell(column.id, field === 'Upload File');
                }
                row.insertBefore(newCell, row.lastChild);
            });

            const userRole = localStorage.getItem('userRole');
            if (userRole === 'staff') {
                newHeader.style.display = 'none';
                Array.from(table.rows).forEach(row => {
                    row.cells[row.cells.length - 1].style.display = 'none';
                });
            }

        } catch (error) {
            console.error('Error adding column:', error);
        }
    }
}

export function createDropdownMenu(options, onSelect) {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.style.display = 'none';

    options.forEach(option => {
        const item = document.createElement('div');
        item.textContent = option;
        item.className = 'dropdown-item';
        item.addEventListener('click', () => onSelect(option));
        menu.appendChild(item);
    });

    return menu;
}
export function createCell(columnId, isNonEditable = false) {
    const cell = document.createElement('td');
    cell.dataset.columnId = columnId;

    if (isNonEditable) {
        cell.contentEditable = false;
        cell.style.pointerEvents = 'none';
        cell.style.backgroundColor = '#f0f0f0';
    } else {
        cell.contentEditable = true;
        cell.addEventListener('blur', async function () {
            const value = cell.textContent.trim();
            const rowElement = cell.closest('tr');
            if (!rowElement) {
                console.error('Row element not found for cell:', cell);
                return;
            }
            const rowId = rowElement.dataset.rowId;
            const cellColumnId = parseInt(cell.dataset.columnId, 10);

            const tableElement = cell.closest('table');
            if (!tableElement) {
                console.error('Table element not found for cell:', cell);
                return;
            }
            const headerElement = tableElement.querySelector(`th[data-column-id="${cellColumnId}"]`);
            if (!headerElement) {
                console.error('Header element not found for column ID:', cellColumnId);
                return;
            }
            let field = headerElement.dataset.field || 'TEXT';

            console.log('Saving cell data:', { rowId, columnId: cellColumnId, field, value });

            if (!rowId || isNaN(cellColumnId) || !field) {
                console.error('Row ID, Column ID, or Field is missing or invalid');
                return;
            }

            const enumFields = ['TEXT', 'Numbers', 'Status', 'Key Persons', 'Timeline', 'Upload File'];
            if (!enumFields.includes(field)) {
                console.error('Invalid field value');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:3000/api/cell_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        row_id: rowId,
                        column_id: cellColumnId,
                        field: field,
                        value: value,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
                }

                const result = await response.json();
                console.log('Cell data saved:', result);

            } catch (error) {
                console.error('Error saving cell data:', error);
            }
        });
    }
    return cell;
}

// Create a cell for numeric input, restricted to integers
export function createNumberCell(columnId) {
    const cell = document.createElement('td');
    cell.dataset.columnId = columnId;
    cell.contentEditable = true;

    // Validate and save the number input on blur event
    cell.addEventListener('blur', async function () {
        let value = cell.textContent.trim();

        // Ensure the input is a valid integer
        if (!/^\d+$/.test(value)) {
            alert('Please enter a valid integer.');
            cell.textContent = ''; // Clear invalid input
            return;
        }

        const rowId = cell.closest('tr').dataset.rowId;
        if (!columnId || !rowId) {
            console.error('Invalid columnId or rowId:', { columnId, rowId });
            return;
        }

        console.log('Saving cell data:', { rowId, columnId, field: 'Numbers', value });

        try {
            const response = await fetch('http://127.0.0.1:3000/api/cell_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    row_id: rowId,
                    column_id: columnId,
                    field: 'Numbers',
                    value: value
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log('Cell data saved:', result);

        } catch (error) {
            console.error('Error saving cell data:', error);
        }
    });

    // Validate input to ensure only digits are entered
    cell.addEventListener('input', function () {
        cell.textContent = cell.textContent.replace(/\D/g, ''); // Remove non-digit characters
    });

    return cell;
}
// Create a cell with a dropdown menu for status options
export function createStatusCell(columnId) {
    const cell = document.createElement('td');
    cell.dataset.columnId = columnId;

    const statusSelect = document.createElement('select');
    const options = ["Not Started", "In Progress", "Done"];

    options.forEach(option => {
        const statusOption = document.createElement('option');
        statusOption.value = option;
        statusOption.textContent = option;
        statusSelect.appendChild(statusOption);
    });

    statusSelect.addEventListener('change', async function () {
        const value = statusSelect.value;
        const rowId = cell.closest('tr').dataset.rowId;

        if (!columnId || !rowId) {
            console.error('Invalid columnId or rowId:', { columnId, rowId });
            return;
        }

        console.log('Saving cell data:', { rowId, columnId, field: 'Status', value });

        try {
            const response = await fetch('http://127.0.0.1:3000/api/cell_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    row_id: rowId,
                    column_id: columnId,
                    field: 'Status',
                    value: value
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log('Cell data saved:', result);

        } catch (error) {
            console.error('Error saving cell data:', error);
        }
    });

    cell.appendChild(statusSelect);
    return cell;
}
// Create a cell with an input for Gmail addresses
export function createKeyPersonsCell(columnId) {
    const cell = document.createElement('td');
    cell.dataset.columnId = columnId;
    cell.contentEditable = true;

    // Validate and save the email input on blur event
    cell.addEventListener('blur', async function () {
        const value = cell.textContent.trim();
        const rowId = cell.closest('tr').dataset.rowId;

        // Validate Gmail address
        const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail.com$/;
        if (!gmailPattern.test(value)) {
            alert('Please enter a valid Gmail address.');
            cell.textContent = ''; // Clear invalid input
            return;
        }

        if (!columnId || !rowId) {
            console.error('Invalid columnId or rowId:', { columnId, rowId });
            return;
        }

        console.log('Saving cell data:', { rowId, columnId, field: 'Key Persons', value });

        try {
            const response = await fetch('http://127.0.0.1:3000/api/cell_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    row_id: rowId,
                    column_id: columnId,
                    field: 'Key Persons',
                    value: value
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log('Cell data saved:', result);

        } catch (error) {
            console.error('Error saving cell data:', error);
        }
    });

    return cell;
}
export function createDateCell(columnId, field) {
    const cell = document.createElement('td');
    cell.dataset.columnId = columnId;
    cell.dataset.field = field;

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    const dateDisplay = document.createElement('span');
    dateDisplay.className = 'formatted-date';
    dateDisplay.style.cursor = 'pointer';
    dateDisplay.style.display = 'none';

    dateInput.addEventListener('change', async function () {
        const date = new Date(dateInput.value);
        if (!isNaN(date)) {
            dateDisplay.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dateInput.style.display = 'none';
            dateDisplay.style.display = 'block';

            const rowId = cell.closest('tr').dataset.rowId;
            const value = dateInput.value;

            if (!columnId || !rowId) {
                console.error('Invalid columnId or rowId:', { columnId, rowId });
                return;
            }

            console.log('Saving cell data:', { rowId, columnId, field, value });

            try {
                const response = await fetch('http://127.0.0.1:3000/api/cell_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        row_id: rowId,
                        column_id: columnId,
                        field: 'Timeline',
                        value: value,
                        start_date: field === 'start_date' ? value : null,
                        due_date: field === 'due_date' ? value : null
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
                }

                const result = await response.json();
                console.log('Cell data saved:', result);

            } catch (error) {
                console.error('Error saving cell data:', error);
            }
        }
    });

    dateDisplay.addEventListener('click', () => {
        dateInput.style.display = 'block';
        dateDisplay.style.display = 'none';
    });

    cell.appendChild(dateInput);
    cell.appendChild(dateDisplay);
    return cell;
}
export function createInput(type, placeholder = '') {
    const input = document.createElement('input');
    input.type = type;
    input.style.width = '100%';
    if (placeholder) input.placeholder = placeholder;
    return input;
}

// Create a cell with an input for file uploads and a link to download the file
export function createUploadFileCell(columnId, existingFilePath = null, originalFileName = null) {
    const cell = document.createElement('td');
    cell.dataset.columnId = columnId;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    const fileLink = document.createElement('a');
    fileLink.style.display = 'none';
    fileLink.target = '_blank';
    
    if (existingFilePath && originalFileName) {
        fileLink.href = existingFilePath;
        fileLink.textContent = originalFileName;
        fileLink.style.display = 'block';
    }

    fileInput.addEventListener('change', async function () {
        const file = fileInput.files[0];
        if (!file) return;

        const rowId = cell.closest('tr').dataset.rowId;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('row_id', rowId);
        formData.append('column_id', columnId);
        formData.append('field', 'Upload File');

        try {
            const response = await fetch('http://127.0.0.1:3000/api/upload_file', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const result = await response.json();
            console.log('File uploaded:', result);

            // Update the cell to show the file path or URL
            fileLink.href = result.filePath;
            fileLink.textContent = result.originalFileName;
            fileLink.style.display = 'block';
            cell.appendChild(fileLink);

        } catch (error) {
            console.error('Error uploading file:', error);
        }
    });

    cell.appendChild(fileInput);
    if (existingFilePath && originalFileName) {
        cell.appendChild(fileLink);
    }
    return cell;
}
export function syncDateToCalendar(dateValue) {
    console.log('Synchronizing date to calendar:', dateValue);
}

/*export async function fetchAndRenderCalendar(projectId) {
    const projectData = await fetchProjectData(projectId);
    if (!projectData) return;

    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = ''; // Clear existing calendar items

    groupData.forEach(project => {
        const groupName = group.group_name;
        const keyPerson = group.key_person;
        const startDate = new Date(group.start_date);
        const dueDate = new Date(group.due_date);

        const startDay = document.createElement('div');
        startDay.className = 'calendar-day pinned';
        startDay.textContent = `${groupName} - ${keyPerson} (Start)`;
        startDay.style.gridColumn = startDate.getDay() + 1;
        startDay.dataset.date = group.start_date;

        const dueDay = document.createElement('div');
        dueDay.className = 'calendar-day pinned';
        dueDay.textContent = `${groupName} - ${keyPerson} (Due)`;
        dueDay.style.gridColumn = dueDate.getDay() + 1;
        dueDay.dataset.date = group.due_date;

        calendarGrid.appendChild(startDay);
        calendarGrid.appendChild(dueDay);
    });
}*/