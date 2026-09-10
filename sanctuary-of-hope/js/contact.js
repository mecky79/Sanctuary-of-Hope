document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    const { error } = await supabaseClient.from("contact_messages").insert({
      full_name: document.getElementById("full_name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim(),
    });

    if (error) {
      statusEl.textContent = "Something went wrong sending your message. Please try WhatsApp instead.";
      statusEl.className = "form-status is-visible is-error";
    } else {
      statusEl.textContent = "Message sent. We'll get back to you soon.";
      statusEl.className = "form-status is-visible is-success";
      form.reset();
    }

    submitBtn.disabled = false;
  });
});
