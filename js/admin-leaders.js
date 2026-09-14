// Manages the "leaders" table from the admin dashboard: the featured
// senior pastor bio card plus the leadership team grid on leadership.html.
// Mirrors js/admin.js (sermons) but reuses the same "sermon-photos"
// storage bucket for photos, so no extra bucket setup is needed.

const leaderForm = document.getElementById("leader-form");
const leaderListEl = document.getElementById("admin-leader-list");
const leaderStatusEl = document.getElementById("leader-form-status");
const leaderFormHeading = document.getElementById("leader-form-heading");
const leaderSubmitBtn = document.getElementById("leader-submit-btn");
const leaderCancelEditBtn = document.getElementById("leader-cancel-edit-btn");
const leaderIdField = document.getElementById("leader_id");
const currentLeaderPhotoPreview = document.getElementById("current-leader-photo-preview");
const leaderPhotoHint = document.getElementById("leader-photo-hint");

let existingLeaderPhotoUrl = null;

function showLeaderStatus(message, type = "success") {
  leaderStatusEl.textContent = message;
  leaderStatusEl.className = `form-status is-visible is-${type}`;
}

async function uploadLeaderPhoto(file) {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("sermon-photos")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabaseClient.storage.from("sermon-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

function enterLeaderEditMode(leader) {
  leaderIdField.value = leader.id;
  document.getElementById("leader_name").value = leader.name;
  document.getElementById("leader_role").value = leader.role;
  document.getElementById("leader_bio").value = leader.bio || "";
  document.getElementById("leader_is_featured").checked = !!leader.is_featured;

  existingLeaderPhotoUrl = leader.photo_url || null;
  currentLeaderPhotoPreview.innerHTML = existingLeaderPhotoUrl
    ? `<div class="current-photo"><img src="${existingLeaderPhotoUrl}" alt=""> <span>Current photo</span></div>`
    : "";
  leaderPhotoHint.style.display = existingLeaderPhotoUrl ? "block" : "none";

  leaderFormHeading.textContent = "Edit pastor or leader";
  leaderSubmitBtn.textContent = "Save changes";
  leaderCancelEditBtn.style.display = "inline-flex";

  leaderForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitLeaderEditMode() {
  leaderIdField.value = "";
  existingLeaderPhotoUrl = null;
  currentLeaderPhotoPreview.innerHTML = "";
  leaderPhotoHint.style.display = "none";
  leaderFormHeading.textContent = "Add a pastor or leader";
  leaderSubmitBtn.textContent = "Add to Leadership page";
  leaderCancelEditBtn.style.display = "none";
  leaderForm.reset();
}

async function loadAdminLeaders() {
  leaderListEl.innerHTML = `<p class="form-note">Loading&hellip;</p>`;

  const { data, error } = await supabaseClient
    .from("leaders")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    leaderListEl.innerHTML = `<div class="empty-state">Could not load leaders.</div>`;
    return;
  }

  if (!data || data.length === 0) {
    leaderListEl.innerHTML = `<div class="empty-state">Nobody added yet &mdash; use the form above.</div>`;
    return;
  }

  leaderListEl.innerHTML = data
    .map(
      (l) => `
      <div class="admin-row" data-id="${l.id}">
        <div>
          <strong>${l.name}</strong>${l.is_featured ? ' <span class="card-meta">Featured</span>' : ""}
          <div class="form-note">${l.role}</div>
        </div>
        <div class="admin-row-actions">
          <button class="icon-btn" type="button" data-action="edit" aria-label="Edit leader">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn" type="button" data-action="delete" aria-label="Delete leader">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join("");

  leaderListEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".admin-row").dataset.id;
      const leader = data.find((l) => l.id === id);
      if (leader) enterLeaderEditMode(leader);
    });
  });

  leaderListEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest(".admin-row");
      const id = row.dataset.id;
      if (!confirm("Remove this person from the Leadership page? This cannot be undone.")) return;

      const { error } = await supabaseClient.from("leaders").delete().eq("id", id);
      if (error) {
        showLeaderStatus(`Could not delete: ${error.message}`, "error");
        return;
      }
      if (leaderIdField.value === id) exitLeaderEditMode();
      row.remove();
      showLeaderStatus("Removed.", "success");
    });
  });
}

if (leaderForm) {
  loadAdminLeaders();

  leaderCancelEditBtn.addEventListener("click", () => {
    exitLeaderEditMode();
    showLeaderStatus("Edit cancelled.", "success");
  });

  leaderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const editingId = leaderIdField.value;
    leaderSubmitBtn.disabled = true;
    leaderSubmitBtn.textContent = editingId ? "Saving…" : "Adding…";

    try {
      const photoFile = document.getElementById("leader_photo").files[0];
      const uploadedUrl = await uploadLeaderPhoto(photoFile);
      const photoUrl = uploadedUrl || existingLeaderPhotoUrl || null;

      const record = {
        name: document.getElementById("leader_name").value.trim(),
        role: document.getElementById("leader_role").value.trim(),
        bio: document.getElementById("leader_bio").value.trim(),
        is_featured: document.getElementById("leader_is_featured").checked,
        photo_url: photoUrl,
      };

      const { error } = editingId
        ? await supabaseClient.from("leaders").update(record).eq("id", editingId)
        : await supabaseClient.from("leaders").insert(record);

      if (error) throw error;

      showLeaderStatus(editingId ? "Changes saved." : "Added to the Leadership page.", "success");
      exitLeaderEditMode();
      loadAdminLeaders();
    } catch (err) {
      console.error(err);
      showLeaderStatus(`Could not save: ${err.message || "please try again."}`, "error");
    } finally {
      leaderSubmitBtn.disabled = false;
      leaderSubmitBtn.textContent = editingId ? "Save changes" : "Add to Leadership page";
    }
  });
}
