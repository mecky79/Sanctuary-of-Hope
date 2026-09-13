// Admin dashboard: only reachable after a Supabase-authenticated login
// (see admin-login.html). Handles posting, editing, listing, and
// deleting sermons. Anything written here shows up immediately on
// sermons.html and the homepage teaser because they read from the same
// "sermons" table.

const form = document.getElementById("sermon-form");
const listEl = document.getElementById("admin-sermon-list");
const statusEl = document.getElementById("form-status");
const logoutBtn = document.getElementById("logout-btn");
const formHeading = document.getElementById("form-heading");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const sermonIdField = document.getElementById("sermon_id");
const currentPhotoPreview = document.getElementById("current-photo-preview");
const photoHint = document.getElementById("photo-hint");

let existingPhotoUrl = null; // photo URL already on the sermon being edited

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

function enterEditMode(sermon) {
  sermonIdField.value = sermon.id;
  document.getElementById("title").value = sermon.title;
  document.getElementById("minister_name").value = sermon.minister_name;
  document.getElementById("scripture_reference").value = sermon.scripture_reference || "";
  document.getElementById("body").value = sermon.body;

  existingPhotoUrl = sermon.minister_photo_url || null;
  currentPhotoPreview.innerHTML = existingPhotoUrl
    ? `<div class="current-photo"><img src="${existingPhotoUrl}" alt=""> <span>Current photo</span></div>`
    : "";
  photoHint.style.display = existingPhotoUrl ? "block" : "none";

  formHeading.textContent = "Edit sermon";
  submitBtn.textContent = "Save changes";
  cancelEditBtn.style.display = "inline-flex";

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitEditMode() {
  sermonIdField.value = "";
  existingPhotoUrl = null;
  currentPhotoPreview.innerHTML = "";
  photoHint.style.display = "none";
  formHeading.textContent = "Post a sermon";
  submitBtn.textContent = "Post sermon";
  cancelEditBtn.style.display = "none";
  form.reset();
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
          <button class="icon-btn" type="button" data-action="edit" aria-label="Edit sermon">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn" type="button" data-action="delete" aria-label="Delete sermon">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".admin-row").dataset.id;
      const sermon = data.find((s) => s.id === id);
      if (sermon) enterEditMode(sermon);
    });
  });

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
      if (sermonIdField.value === id) exitEditMode();
      row.remove();
      showStatus("Sermon deleted.", "success");
    });
  });
}

if (form) {
  requireSession();
  loadAdminSermons();

  cancelEditBtn.addEventListener("click", () => {
    exitEditMode();
    showStatus("Edit cancelled.", "success");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const editingId = sermonIdField.value;
    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? "Saving…" : "Posting…";

    try {
      const photoFile = document.getElementById("minister_photo").files[0];
      const uploadedUrl = await uploadPhoto(photoFile);
      const photoUrl = uploadedUrl || existingPhotoUrl || null;

      const record = {
        title: document.getElementById("title").value.trim(),
        minister_name: document.getElementById("minister_name").value.trim(),
        scripture_reference: document.getElementById("scripture_reference").value.trim(),
        body: document.getElementById("body").value.trim(),
        minister_photo_url: photoUrl,
      };

      const { error } = editingId
        ? await supabaseClient.from("sermons").update(record).eq("id", editingId)
        : await supabaseClient.from("sermons").insert(record);

      if (error) throw error;

      showStatus(editingId ? "Sermon updated." : "Sermon posted. It's now live on the site.", "success");
      exitEditMode();
      loadAdminSermons();
    } catch (err) {
      console.error(err);
      showStatus("Something went wrong saving that sermon. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Save changes" : "Post sermon";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "admin-login.html";
  });
}