const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("register-error");
const successModal = document.getElementById("success-modal");
const successMessage = document.getElementById("success-message");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const emailPrefix = document.getElementById("email-prefix").value.trim();
    const email = `${emailPrefix}@ceo.com`;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const position = document.getElementById("position").value;

    if (password !== confirmPassword) {
        registerError.textContent = "Passwords do not match.";
        return;
    }

    if (!email.endsWith("@ceo.com")) {
        registerError.textContent = "Email must have the domain @ceo.com.";
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

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = 'index.html'; 
        } else {
            registerError.textContent = result.message || 'Registration failed. Please try again.';
        }
    } catch (error) {
        registerError.textContent = 'An error occurred. Please try again.';
    }
});

function closeModal() {
    successModal.style.display = "none";
}

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