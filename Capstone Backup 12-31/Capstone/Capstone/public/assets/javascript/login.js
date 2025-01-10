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
const errorMessage = document.getElementById("error-message");

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
            body: JSON.stringify({
                email,
                password,
            }),
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Attempt to parse the response as JSON
        const result = await response.json();
        console.log('Parsed JSON Response:', result);

        alert(`Welcome back, ${result.user.email}`);
        window.location.href = "Dashboard.html";
    } catch (error) {
        errorMessage.textContent = error.message || 'Incorrect credentials, please try again.';
        console.error('Fetch error:', error);
    }
});