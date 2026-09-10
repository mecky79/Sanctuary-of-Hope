// Simple email/password login for the one or two people who manage
// content. Create the admin user from the Supabase dashboard
// (Authentication -> Users -> Add user) rather than a public sign-up form.

document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    window.location.href = "admin.html";
    return;
  }

  const form = document.getElementById("login-form");
  const statusEl = document.getElementById("login-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.className = "form-status";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      statusEl.textContent = "Incorrect email or password.";
      statusEl.className = "form-status is-visible is-error";
      return;
    }

    window.location.href = "admin.html";
  });
});
