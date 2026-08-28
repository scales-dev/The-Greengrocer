const form = document.getElementById("contact-form");
const submitButton = form.querySelector('button[type="submit"]');
const status = document.getElementById("contact-form-status");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    status.textContent = "Sending...";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(form.action, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to send message");
        }

        status.textContent = "Message sent successfully.";
        form.reset();
    } catch (error) {
        console.error(error);
        status.textContent = error.message || "Unable to send your message. Please try again.";
    } finally {
        submitButton.disabled = false;
    }
});
