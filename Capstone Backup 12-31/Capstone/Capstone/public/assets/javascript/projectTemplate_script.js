document.addEventListener('DOMContentLoaded', function() {
    // Initialize buttons and sections
    const mainTableBtn = document.getElementById('mainTableBtn');
    const calendarBtn = document.getElementById('calendarBtn');
    const groupSection = document.querySelector('.group-section');
    const calendarSection = document.querySelector('.calendar-section');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const groupContainer = document.querySelector('.group-container');
    const projectNameElement = document.getElementById('projectName');
    const projectDescriptionElement = document.getElementById('projectDescription');

    if (!mainTableBtn || !calendarBtn || !groupSection || !calendarSection || !addGroupBtn || !groupContainer || !projectNameElement || !projectDescriptionElement) {
        console.error('One or more DOM elements are missing');
        return;
    }

    // Data structure to store group information
    let groupData = [];

    // Event listeners for buttons
    mainTableBtn.addEventListener('click', function() {
        groupSection.classList.add('active-section');
        calendarSection.classList.remove('active-section');
        setActiveButton('mainTableBtn');
    });

    calendarBtn.addEventListener('click', function() {
        groupSection.classList.remove('active-section');
        calendarSection.classList.add('active-section');
        setActiveButton('calendarBtn');
        renderCalendar(); // Ensure calendar is rendered when the button is clicked
    });

    // Set main table as the default active section on page load
    groupSection.classList.add('active-section');
    calendarSection.classList.remove('active-section');
    setActiveButton('mainTableBtn');

    addGroupBtn.addEventListener('click', function() {
        const groupName = prompt("Enter group name:");
        if (!groupName) return;

        const groupId = `group-${Date.now()}`;
        const table = createTable(groupId, groupName);
        groupContainer.appendChild(table);
        createAddRowButton(table, groupId);

        // Add new group to groupData
        groupData.push({ id: groupId, name: groupName, rows: [] });
    });

    function setActiveButton(buttonId) {
        mainTableBtn.classList.remove('active');
        calendarBtn.classList.remove('active');
        document.getElementById(buttonId).classList.add('active');
    }

    function createTable(groupId, groupName) {
        const table = document.createElement('table');
        table.className = 'group-table';
        table.dataset.id = groupId;

        const headerRow = createHeaderRow(table, groupId, groupName);
        table.appendChild(headerRow);

        return table;
    }

    function createHeaderRow(table, groupId, groupName) {
        const headerRow = document.createElement('tr');

        const fixedColumnHeader = document.createElement('th');
        fixedColumnHeader.className = 'fixed-column';
        const dropdownBtn = document.createElement('button');
        dropdownBtn.textContent = '⋮';
        dropdownBtn.className = 'dropdown-btn';

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.display = 'none';

        const deleteGroupOption = document.createElement('div');
        deleteGroupOption.textContent = 'Delete Group';
        deleteGroupOption.className = 'dropdown-item';
        deleteGroupOption.addEventListener('click', () => {
            const addItemButton = document.querySelector(`.add-item-btn[data-id="${groupId}"]`);
            if (addItemButton) addItemButton.remove();
            groupContainer.removeChild(table);

            // Remove from groupData
            groupData = groupData.filter(group => group.id !== groupId);
        });

        dropdownBtn.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        dropdownMenu.appendChild(deleteGroupOption);
        fixedColumnHeader.appendChild(dropdownBtn);
        fixedColumnHeader.appendChild(dropdownMenu);
        headerRow.appendChild(fixedColumnHeader);

        headerRow.appendChild(createHeaderCell(groupName, '', true));

        const plusHeader = createHeaderCell('+', 'plus-header');
        plusHeader.style.cursor = 'pointer';

        const columnDropdownMenu = createDropdownMenu(
            ['Text', 'Numbers', 'Status', 'Key Persons', 'Timeline', 'Upload File'],
            (option) => {
                if (option === 'Timeline') {
                    addTimelineColumns(table, headerRow);
                } else {
                    addColumn(option, table, headerRow);
                }
                columnDropdownMenu.style.display = 'none';
            }
        );

        plusHeader.addEventListener('click', () => {
            columnDropdownMenu.style.display = columnDropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        plusHeader.appendChild(columnDropdownMenu);
        headerRow.appendChild(plusHeader);

        return headerRow;
    }

    function createActionCell(row) {
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
        deleteOption.addEventListener('click', () => row.remove());

        dropdownBtn.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        dropdownMenu.appendChild(deleteOption);
        cell.appendChild(dropdownBtn);
        cell.appendChild(dropdownMenu);
        return cell;
    }

    function createAddRowButton(table, groupId) {
        const addRowBtn = document.createElement('button');
        addRowBtn.className = 'add-item-btn';
        addRowBtn.dataset.id = groupId;
        addRowBtn.textContent = 'Add Item';
        addRowBtn.addEventListener('click', () => addRow(table, table.rows[0]));
        groupContainer.appendChild(addRowBtn);
        return addRowBtn;
    }

    function createHeaderCell(text, className = '', editable = false, columnId = null) {
        const header = document.createElement('th');
        header.textContent = text;
        header.className = className;
        if (editable) {
            header.contentEditable = true;
            header.dataset.columnId = columnId;
        }
        return header;
    }

    function createDropdownMenu(options, onSelect) {
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

    function addColumn(option, table, headerRow) {
        const newHeader = createHeaderCell(option, '', true);
        headerRow.insertBefore(newHeader, headerRow.lastChild);

        Array.from(table.rows).forEach((row, index) => {
            if (index === 0) return;
            const newCell = createCell(option);
            row.insertBefore(newCell, row.lastChild);
        });
    }

    function addTimelineColumns(table, headerRow) {
        ['Start Date', 'Due Date'].forEach(dateColumn => {
            const newHeader = createHeaderCell(dateColumn, '', true);
            headerRow.insertBefore(newHeader, headerRow.lastChild);

            Array.from(table.rows).forEach((row, index) => {
                if (index === 0) return;
                const dateCell = createDateCell();
                row.insertBefore(dateCell, row.lastChild);

                const dateInput = dateCell.querySelector('input[type="date"]');
                dateInput.addEventListener('change', () => syncDateToCalendar(dateInput.value));
            });
        });
    }

    function addRow(table, headerRow) {
        const groupId = table.dataset.id;
        const tr = document.createElement('tr');
        tr.dataset.rowId = `row-${Date.now()}`;

        Array.from(headerRow.cells).forEach((header, index) => {
            const cell = index === 0 ? createActionCell(tr) : createCell(header.textContent, tr, groupId);
            tr.appendChild(cell);
        });

        table.appendChild(tr);
    }

    function createCell(headerText, row, groupId) {
        const cell = document.createElement('td');
        cell.dataset.columnId = headerText; // Use header text as column ID for simplicity

        if (headerText === 'Start Date' || headerText === 'Due Date') {
            return createDateCell(row, headerText, groupId);
        } else if (headerText === 'Text') {
            cell.contentEditable = true;
            cell.addEventListener('blur', () => {
                const group = groupData.find(g => g.id === groupId);
                if (group) {
                    const existingRow = group.rows.find(r => r.id === row.dataset.rowId);
                    if (existingRow) {
                        existingRow[headerText] = cell.textContent;
                    } else {
                        const newRow = { id: row.dataset.rowId || Date.now().toString(), [headerText]: cell.textContent };
                        group.rows.push(newRow);
                        row.dataset.rowId = newRow.id;
                    }
                }
            });
        } else if (headerText === 'Numbers') {
            cell.appendChild(createInput('text', 'Enter Value'));
        } else if (headerText === 'Status') {
            cell.appendChild(createSelect(['To-do', 'In Progress', 'Done']));
        } else if (headerText === 'Key Persons') {
            cell.appendChild(createInput('email'));
        } else if (headerText === 'Upload File') {
            const fileInput = createInput('file');
            fileInput.addEventListener('change', handleFileUpload);
            cell.appendChild(fileInput);
        }

        return cell;
    }

    function createDateCell(row, headerText, groupId) {
        const cell = document.createElement('td');
        const dateInput = createInput('date');
        const dateDisplay = document.createElement('span');
        dateDisplay.className = 'formatted-date';
        dateDisplay.style.cursor = 'pointer';
        dateDisplay.style.display = 'none';

        dateInput.addEventListener('change', () => {
            const date = new Date(dateInput.value);
            if (!isNaN(date)) {
                dateDisplay.textContent = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                dateInput.style.display = 'none';
                dateDisplay.style.display = 'block';

                const group = groupData.find(g => g.id === groupId);
                if (group) {
                    const existingRow = group.rows.find(r => r.id === row.dataset.rowId);
                    if (existingRow) {
                        existingRow[headerText] = dateInput.value;
                    } else {
                        const newRow = { id: row.dataset.rowId || Date.now().toString(), [headerText]: dateInput.value };
                        group.rows.push(newRow);
                        row.dataset.rowId = newRow.id;
                    }
                }

                syncDateToCalendar(dateInput.value);
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

    function createInput(type, placeholder = '') {
        const input = document.createElement('input');
        input.type = type;
        input.style.width = '100%';
        if (placeholder) input.placeholder = placeholder;
        return input;
    }

    function createSelect(options) {
        const select = document.createElement('select');
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
        return select;
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('File content:', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Calendar Variables
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let pinnedDates = [];

    // Function to Render Calendar
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        monthYearDisplay.textContent = `${new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' })} ${currentYear}`;

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day');
            calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;
            dayCell.classList.add('calendar-day');
            const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (pinnedDates.includes(fullDate)) {
                dayCell.classList.add('pinned');
            }

            // Display group information in the calendar
            groupData.forEach(group => {
                group.rows.forEach(row => {
                    if (row['Start Date'] === fullDate || row['Due Date'] === fullDate) {
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'calendar-info';
                        infoDiv.textContent = `${group.name}: ${row['Text'] || ''}`;
                        dayCell.appendChild(infoDiv);
                    }
                });
            });

            dayCell.addEventListener('click', () => togglePinDate(fullDate, dayCell));
            calendarGrid.appendChild(dayCell);
        }
    }

    // Function to Toggle Pin Date
    function togglePinDate(date, dayCell) {
        if (pinnedDates.includes(date)) {
            pinnedDates = pinnedDates.filter(d => d !== date);
            dayCell.classList.remove('pinned');
        } else {
            pinnedDates.push(date);
            dayCell.classList.add('pinned');
        }
        renderCalendar();
    }

    // Navigation Buttons for Calendar
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Initialize Calendar
    document.addEventListener('DOMContentLoaded', renderCalendar);
});