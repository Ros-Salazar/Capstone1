document.addEventListener("DOMContentLoaded", function() {
    fetchUsers();
    fetchPendingUsers();
});

function fetchUsers() {
    fetch('http://127.0.0.1:3000/api/users?status=approved')
        .then(response => response.json())
        .then(data => {
            const usersTable = document.getElementById('users-table');
            usersTable.innerHTML = ''; // Clear the table first
            data.forEach(user => {
                const row = document.createElement('tr');
                
                // Generate options conditionally
                let optionsHtml = `
                    <a href="#" onclick='editAccount(${JSON.stringify(user)})'>Edit Account</a>
                    <a href="#" onclick="deleteAccount('${user.id}')">Delete Account</a>
                `;

                if (user.position !== 'admin' && user.position !== 'manager') {
                    optionsHtml = `
                        <a href="#" onclick="accessPrivileges('${user.id}', '${user.position}', '${encodeURIComponent(JSON.stringify(user.privileges))}')">Access Privileges</a>
                        ${optionsHtml}
                    `;
                }

                row.innerHTML = `
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.email}</td>
                    <td>${user.position}</td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                    <td>
                        <div class="dropdown">
                            <button class="dropdown-btn">⋮</button>
                            <div class="dropdown-content">
                                ${optionsHtml}
                            </div>
                        </div>
                    </td>
                `;
                usersTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function fetchPendingUsers() {
    fetch('http://127.0.0.1:3000/api/users?status=pending')
        .then(response => response.json())
        .then(data => {
            const pendingUsersTable = document.getElementById('pending-users-table');
            pendingUsersTable.innerHTML = ''; // Clear the table first
            data.forEach(user => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.email}</td>
                    <td>${user.position}</td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                    <td>
                        <button class="button-approve" onclick="approveUser('${user.id}')">Approve</button>
                        <button class="button-reject" onclick="rejectUser('${user.id}')">Reject</button>
                    </td>
                `;
                pendingUsersTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching pending users:', error));
}


function approveUser(userId) {
    fetch(`http://127.0.0.1:3000/api/approve-user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        alert('User approved successfully');
        fetchUsers();
        fetchPendingUsers();
    })
    .catch(error => console.error('Error approving user:', error));
}

function rejectUser(userId) {
    fetch(`http://127.0.0.1:3000/api/users/${userId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert('User rejected and deleted successfully');
        fetchPendingUsers();
    })
    .catch(error => console.error('Error rejecting user:', error));
}

function accessPrivileges(userId, position, encodedPrivileges) {
    let privileges = {};
    try {
        privileges = JSON.parse(decodeURIComponent(encodedPrivileges));
    } catch (e) {
        console.error('Error parsing privileges:', e);
        privileges = {
            canViewProjects: true,
            canEditProjects: false
        };
    }

    if (!privileges) {
        privileges = {
            canViewProjects: true,
            canEditProjects: false
        };
    }

    const popup = document.getElementById('privileges-popup');
    const form = document.getElementById('privileges-form');
    popup.style.display = 'block';

    form.privilegesUserId.value = userId;
    form.position.value = position;
    form.canViewProjects.checked = privileges.canViewProjects;
    form.canEditProjects.checked = privileges.canEditProjects;

    if (position === 'admin' || position === 'manager') {
        form.canViewProjects.disabled = true;
        form.canEditProjects.disabled = true;
    } else {
        form.canViewProjects.disabled = false;
        form.canEditProjects.disabled = false;
    }
}


function closePrivilegesPopup() {
    const popup = document.getElementById('privileges-popup');
    popup.style.display = 'none';
    const form = document.getElementById('privileges-form');
    form.reset();
}

function savePrivileges(event) {
    event.preventDefault();
    const form = event.target;

    const userId = form.privilegesUserId.value;
    const position = form.position.value;

    if (position === 'admin' || position === 'manager') {
        alert('Cannot change privileges for admin or manager.');
        return;
    }

    const updatedPrivileges = {
        canViewProjects: form.canViewProjects.checked,
        canEditProjects: form.canEditProjects.checked
    };

    updateUserPrivileges(userId, updatedPrivileges);
}

function updateUserPrivileges(userId, updatedPrivileges) {
    fetch(`http://127.0.0.1:3000/api/users/${userId}/privileges`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ privileges: updatedPrivileges })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        alert('Privileges updated successfully');
        closePrivilegesPopup();
        location.reload();
    })
    .catch(error => console.error('Error updating privileges:', error));
}

function editAccount(user) {
    const popup = document.getElementById('edit-popup');
    const form = document.getElementById('edit-form');
    popup.style.display = 'block';

    form.userId.value = user.id;
    form.firstName.value = user.first_name;
    form.lastName.value = user.last_name;
    form.email.value = user.email;
    form.position.value = user.position;
}

function closePopup() {
    document.getElementById('edit-popup').style.display = 'none';
}

function saveEdits(event) {
    event.preventDefault();
    const form = event.target;

    const userId = form.userId.value;
    const updatedUser = {
        first_name: form.firstName.value,
        last_name: form.lastName.value,
        email: form.email.value,
        position: form.position.value,
        password: form.password.value ? form.password.value : undefined
    };

    fetch(`http://127.0.0.1:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error updating user');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('User updated successfully');
        closePopup();
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert(error.message);
    });
    
    location.reload();
}

function deleteAccount(userId) {
    if (confirm('Are you sure you want to delete this account?')) {
        fetch(`http://127.0.0.1:3000/api/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert('User deleted successfully');
        })
        .catch(error => console.error('Error deleting user:', error));
    }
    location.reload();
}