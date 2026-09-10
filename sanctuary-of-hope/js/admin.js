// Admin dashboard: only reachable after a Supabase-authenticated login
// (see admin-login.html). Handles posting a new sermon, listing existing
// ones, and deleting them. Anything written here shows up immediately on
// sermons.html and the homepage teaser because they read from the same
// "sermons" table.

const form = document.getElementById("sermon-form");
const listEl = document.getElementById("admin-sermon-list");
const statusEl = document.getElementById("form-status");
const logoutBtn = document.getElementById("logout-btn");

function showStatus(message, type = "success") {
  statusEl.textContent = message;
  statusEl.className = `form-status is-visible is-${type}`;
}

async function requireSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "admin-login.html";
  }
}

async function uploadPhoto(file) {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("sermon-photos")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseClient.storage
    .from("sermon-photos")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function loadAdminSermons() {
  listEl.innerHTML = `<p class="form-note">Loading&hellip;</p>`;

  const { data, error } = await supabaseClient
    .from("sermons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="empty-state">Could not load sermons.</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<div class="empty-state">Nothing posted yet — use the form above.</div>`;
    return;
  }

  listEl.innerHTML = data
    .map(
      (s) => `
      <div class="admin-row" data-id="${s.id}">
        <div>
          <strong>${s.title}</strong>
          <div class="form-note">${s.minister_name} &middot; ${new Date(s.created_at).toLocaleDateString("en-KE")}</div>
        </div>
        <div class="admin-row-actions">
          <button class="icon-btn" type="button" data-action="delete" aria-label="Delete sermon">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest(".admin-row");
      const id = row.dataset.id;
      if (!confirm("Delete this sermon? This cannot be undone.")) return;

      const { error } = await supabaseClient.from("sermons").delete().eq("id", id);
      if (error) {
        showStatus("Could not delete that sermon.", "error");
        return;
      }
      row.remove();
      showStatus("Sermon deleted.", "success");
    });
  });
}

if (form) {
  requireSession();
  loadAdminSermons();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";

    try {
      const photoFile = document.getElementById("minister_photo").files[0];
      const photoUrl = await uploadPhoto(photoFile);

      const { error } = await supabaseClient.from("sermons").insert({
        title: document.getElementById("title").value.trim(),
        minister_name: document.getElementById("minister_name").value.trim(),
        scripture_reference: document.getElementById("scripture_reference").value.trim(),
        body: document.getElementById("body").value.trim(),
        minister_photo_url: photoUrl,
      });

      if (error) throw error;

      showStatus("Sermon posted. It's now live on the site.", "success");
      form.reset();
      loadAdminSermons();
    } catch (err) {
      console.error(err);
      showStatus("Something went wrong posting that sermon. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post sermon";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "admin-login.html";
  });
}
