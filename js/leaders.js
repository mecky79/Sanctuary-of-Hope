// Renders leaders posted from the admin dashboard on leadership.html:
// - the featured leader (senior pastor) as a large bio card
// - everyone else as a photo grid underneath

function leaderPhotoHTML(leader, sizeClass, placeholderClass) {
  return leader.photo_url
    ? `<img class="${sizeClass}" src="${leader.photo_url}" alt="${leader.name}">`
    : `<div class="${placeholderClass}"><i class="fa-solid fa-user"></i></div>`;
}

function featuredLeaderHTML(leader) {
  const photo = leaderPhotoHTML(leader, "leader-photo-lg", "leader-photo-lg-placeholder");
  const bio = leader.bio
    ? `<p style="white-space: pre-line;">${leader.bio}</p>`
    : "";

  return `
    ${photo}
    <div>
      <h2>${leader.name}</h2>
      <p class="card-meta">${leader.role}</p>
      ${bio}
    </div>
  `;
}

function leaderCardHTML(leader) {
  const photo = leaderPhotoHTML(leader, "card-photo", "card-photo-placeholder");
  return `
    <div class="card">
      ${photo}
      <h3>${leader.name}</h3>
      <p>${leader.role}</p>
    </div>
  `;
}

async function loadLeaders() {
  const featuredEl = document.getElementById("featured-leader");
  const gridEl = document.getElementById("leader-grid");
  if (!featuredEl && !gridEl) return;

  const { data, error } = await supabaseClient
    .from("leaders")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (featuredEl) featuredEl.innerHTML = `<div class="empty-state">Could not load leadership info right now.</div>`;
    console.error(error);
    return;
  }

  const leaders = data || [];
  const featured = leaders.find((l) => l.is_featured);
  const team = leaders.filter((l) => !l.is_featured);

  if (featuredEl) {
    featuredEl.innerHTML = featured
      ? featuredLeaderHTML(featured)
      : `<div class="empty-state">Pastor details haven't been added yet.</div>`;
  }

  if (gridEl) {
    gridEl.innerHTML = team.length
      ? team.map(leaderCardHTML).join("")
      : `<div class="empty-state">No leadership team members have been added yet.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadLeaders);
