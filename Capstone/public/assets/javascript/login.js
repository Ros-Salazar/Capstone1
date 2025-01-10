// Toggle Password Visibility
window.togglePassword = (id) => {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling.querySelector("ion-icon");

    if (input.type === "password") {
        input.type = "text";
        icon.name = "eye-off-outline";
    } else {
        input.type = "password";
        icon.name = "eye-outline";
    }
};

// Login functionality
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('http://127.0.0.1:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure credentials are included
            body: JSON.stringify({
                email,
                password,
            }),
        });

        // Attempt to parse the response as JSON
        const result = await response.json();
        console.log('Parsed JSON Response:', result);

        if (!response.ok) {
            throw new Error(result.message || 'Incorrect credentials, please try again.');
        }

        // Welcome the user by name
        alert(`Welcome back, ${result.user.email}!`);

        // Store user role in local storage
        localStorage.setItem('userRole', result.user.position);

        // Redirect based on user position
        if (result.user.position === 'admin') {
            window.location.href = "AdminPage.html";
        } else {
            window.location.href = "Dashboard.html";
        }
    } catch (error) {
        alert(error.message || 'Incorrect credentials, please try again.');
        console.error('Fetch error:', error);
    }
});