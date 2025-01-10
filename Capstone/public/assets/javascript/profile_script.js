document.addEventListener("DOMContentLoaded", function() {
    /** Fetch user data and populate form fields
    fetch('http://localhost:3000/api/user', { 
        method: 'GET',
        credentials: 'include' // Ensure credentials are included
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error(data.error);
        } else {
            document.getElementById('firstName').value = data.first_name;
            document.getElementById('lastName').value = data.last_name;
            document.getElementById('email').value = data.email;
            document.getElementById('password').value = data.user_password;
            document.getElementById('position').value = data.position;
        }
    })
    .catch(error => console.error('Error:', error));*/

    // Ensure elements exist before adding event listeners
    const editButton = document.getElementById('editButton');
    const logoutButton = document.getElementById('logoutButton');

    if (editButton) {
        editButton.addEventListener('click', function() {
            let inputs = document.querySelectorAll('#profileForm input');
            inputs.forEach(input => {
                input.disabled = !input.disabled;
            });
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                credentials: 'include' // Ensure credentials are included
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // Redirect to login page
                window.location.href = 'index.html';
            })
            .catch(error => console.error('Error:', error));
        });
    }
});