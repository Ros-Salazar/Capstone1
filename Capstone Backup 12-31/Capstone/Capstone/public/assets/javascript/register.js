const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("register-error");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const emailPrefix = document.getElementById("email-prefix").value.trim();
    const email = `${emailPrefix}@ceo.com`;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const position = document.getElementById("position").value;

    console.log('Form Data:', { firstName, lastName, email, password, confirmPassword, position });

    if (password !== confirmPassword) {
        registerError.textContent = "Passwords do not match.";
        console.log('Passwords do not match');
        return;
    }

    if (!email.endsWith("@ceo.com")) {
        registerError.textContent = "Email must have the domain @ceo.com.";
        console.log('Invalid email domain');
        return;
    }
    try {
        const response = await fetch('http://127.0.0.1:3000/api/register', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password,
                position,
            }),
        });

        console.log('Raw Response:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Parsed JSON Response:', result);

        if (response.ok) {
            window.location.href = 'index.html'; 
        } else {
            registerError.textContent = result.message || 'Registration failed. Please try again.';
            console.error('Registration failed:', result.message);
        }
    } catch (error) {
        registerError.textContent = 'An error occurred. Please try again.';
        console.error('Fetch error:', error);
    }
});

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