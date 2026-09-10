# Sanctuary of Hope Ministries — website

Plain HTML/CSS/JS site backed by Supabase. No build step — open any
page directly or serve the folder with any static host.

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run everything in `sql/schema.sql`.
3. Go to **Storage** and create a public bucket named `sermon-photos`.
4. Go to **Authentication → Users → Add user** and create the one (or
   two) accounts your admin team will use to log in and post sermons.
   There is no public sign-up page on purpose.
5. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key** into `js/supabase-client.js`, replacing the two
   placeholder values at the top of the file.

## 2. Replace placeholders before launch

- **Logo** — the dashed box at the top left of the header (`.logo-slot`
  in `css/style.css` / the `<span class="logo-slot">` markup on every
  page) is a placeholder. Swap it for an `<img>` once you have the
  church logo.
- **WhatsApp number** — currently `254700000000` in every
  `wa.me/254700000000` link across all pages. Find-and-replace with
  the real number, in international format with no `+` or spaces.
- **Map location** — `plan-your-visit.html` currently embeds a free
  Google Maps iframe centered on Nairobi CBD as a placeholder. To
  point it at the real church location: open Google Maps, search the
  address, click **Share → Embed a map**, and copy the `src` URL from
  the iframe code into the `src="..."` attribute of the `<iframe
  id="map">` in that file. No API key or billing account needed for
  this embed. Update the address/landmark text above it too.
- **Leadership bios and photos** — `leadership.html` has placeholder
  copy for the pastor and leadership team.
- **Service times** — currently 8:00 AM / 10:30 AM / 12:30 PM on the
  homepage and Plan Your Visit page; update if these differ.
- **Social links** — the footer icons on `index.html` link to `#`;
  point them at the real Facebook/Instagram/YouTube/TikTok pages.

## 3. Posting sermons

Go to `admin-login.html`, sign in with an account you created in
Supabase, and use the dashboard to post a sermon (title, minister
name, scripture reference, an optional photo, and the message text).
It appears immediately on `sermons.html` and as the "latest word"
teaser on the homepage — no page rebuild needed.

## Structure

```
index.html              Homepage
plan-your-visit.html    Location, directions, first-timer FAQ
ministries.html         Ministries grid
sermons.html            Full sermon list (reads from Supabase)
leadership.html         Pastor + leadership team
contact.html            WhatsApp CTA + message form
admin-login.html        Admin sign-in
admin.html              Post/manage sermons
css/style.css           All styling
js/                     Supabase client, shared behavior, page logic
sql/schema.sql          Database schema + Row Level Security policies
```
