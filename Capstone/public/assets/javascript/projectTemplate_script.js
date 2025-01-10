import './js_proj_template/initialization.js';

document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');

    if (userRole === 'staff') {
        disableStaffInteractions();
    }
});

function disableStaffInteractions() {
    // Disable all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
        button.style.cursor = 'not-allowed';
    });

    // Disable all dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-btn');
    dropdowns.forEach(dropdown => {
        dropdown.disabled = true;
        dropdown.style.cursor = 'not-allowed';
    });

    // Hide specific elements if necessary
    const elementsToHide = document.querySelectorAll('.admin-only');
    elementsToHide.forEach(element => {
        element.style.display = 'none';
    });

    // Disable contentEditable elements
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
        element.contentEditable = false;
    });

    // Disable input fields
    const inputFields = document.querySelectorAll('input, select, textarea');
    inputFields.forEach(input => {
        input.disabled = true;
    });
}