// Renders sermons posted from the admin dashboard. Used by:
// - sermons.html (full list)
// - index.html (latest single sermon teaser, via #latest-sermon)

function sermonCardHTML(sermon, { collapsed = true } = {}) {
  const date = new Date(sermon.created_at).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const photo = sermon.minister_photo_url
    ? `<img class="sermon-photo" src="${sermon.minister_photo_url}" alt="${sermon.minister_name}">`
    : `<div class="sermon-photo-placeholder"><i class="fa-solid fa-user"></i></div>`;

  const scripture = sermon.scripture_reference
    ? `<span class="scripture">${sermon.scripture_reference}</span> &middot; `
    : "";

  const bodyClass = collapsed ? "sermon-body is-collapsed" : "sermon-body";

  return `
    <article class="sermon-card">
      ${photo}
      <div>
        <h3 class="sermon-title">${sermon.title}</h3>
        <p class="sermon-meta">${scripture}${sermon.minister_name} &middot; ${date}</p>
        <p class="${bodyClass}">${sermon.body}</p>
        ${collapsed ? `<button class="text-link-btn" type="button" data-action="expand">Read full message</button>` : ""}
      </div>
    </article>
  `;
}

function attachExpandHandlers(container) {
  container.querySelectorAll('[data-action="expand"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn.previousElementSibling;
      body.classList.remove("is-collapsed");
      btn.remove();
    });
  });
}

async function loadSermonList(container, limit = null) {
  container.innerHTML = `<p class="form-note">Loading sermons&hellip;</p>`;

  let query = supabaseClient
    .from("sermons")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    container.innerHTML = `<div class="empty-state">We couldn't load sermons right now. Please try again shortly.</div>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state">No sermons have been posted yet. Check back soon.</div>`;
    return;
  }

  container.innerHTML = data.map((s) => sermonCardHTML(s)).join("");
  attachExpandHandlers(container);
}

document.addEventListener("DOMContentLoaded", () => {
  const fullList = document.getElementById("sermon-list");
  if (fullList) loadSermonList(fullList);

  const teaser = document.getElementById("latest-sermon");
  if (teaser) loadSermonList(teaser, 1);
});
