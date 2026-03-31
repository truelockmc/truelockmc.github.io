/* ── Cursor ──────────────────────────────────────────────── */
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + "px";
  cursor.style.top = my + "px";
});
(function loop() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(loop);
})();

function wireCursor() {
  document.querySelectorAll("a,button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = ring.style.width = "54px";
      cursor.style.height = ring.style.height = "54px";
      ring.style.opacity = "0.8";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "10px";
      cursor.style.height = "10px";
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.opacity = "0.5";
    });
  });
}
wireCursor();

/* ── Nav scroll ──────────────────────────────────────────── */
window.addEventListener("scroll", () =>
  document.getElementById("nav").classList.toggle("scrolled", scrollY > 40),
);

/* ── Intersection reveal ─────────────────────────────────── */
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

/* ── Pinned page cards ───────────────────────────────────── */
const PINNED = [
  {
    name: "flaggy",
    url: "https://truelockmc.github.io/flaggy/",
    title: "Flaggy",
    desc: "A flag quiz I built to stop getting embarrassed at geography questions. Covers pretty much every country.",
    emoji: "&#x1F3F3;&#xFE0F;",
    tag: "Quiz / Geography",
    ci: 0,
  },
  {
    name: "openwheel",
    url: "https://truelockmc.github.io/openwheel/",
    title: "OpenWheel",
    desc: "Wheelofnames but opensource and private. Multiple wheels, no tracking, everything saved in your browser.",
    emoji: "&#x1F3A1;",
    tag: "JS / Tool",
    ci: 2,
  },
  {
    name: "qr-gen",
    url: "https://truelockmc.github.io/qr-gen/",
    title: "QR Code Generator",
    desc: "A simple QR-Code Generator, no Bloat and locally in your Browser.",
    emoji: "&#x1F5B6;",
    tag: "JS / Tool",
    ci: 0,
  },
  {
    name: "games",
    url: "https://truelockmc.github.io/games/",
    title: "Games",
    desc: "A small collection of browser games. Runs in the tab, no install needed.",
    emoji: "&#x1F579;&#xFE0F;",
    tag: "Browser / Games",
    ci: 1,
  },
];

const EMOJIS = [
  "&#x1F310;",
  "&#x26A1;",
  "&#x1F579;",
  "&#x1F527;",
  "&#x1F6E1;",
  "&#x1F4E1;",
  "&#x1F52C;",
  "&#x1F4E6;",
  "&#x1F5C2;",
  "&#x1F680;",
  "&#x1F3AF;",
  "&#x1F4A1;",
  "&#x1F510;",
  "&#x1F5A5;",
  "&#x1F5B6;",
];

/* Language → colour map (GitHub colours) */
const LANG_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Rust: "#dea584",
  Go: "#00ADD8",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

function langColor(lang) {
  return LANG_COLORS[lang] || "var(--accent)";
}

/* ── Build a page card ───────────────────────────────────── */
function makeCard(cfg, idx, pinned) {
  const a = document.createElement("a");
  a.href = cfg.url;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "page-card reveal";
  a.style.transitionDelay = (idx * 0.07).toFixed(2) + "s";

  const badge = pinned
    ? '<span class="pin-badge">&#x2605; featured</span>'
    : "";
  const tag = cfg.tag || (cfg.language || "Web") + " &middot; GitHub Pages";

  a.innerHTML =
    badge +
    '<div class="card-icon ci-' +
    cfg.ci +
    '">' +
    cfg.emoji +
    "</div>" +
    '<div class="card-tag">// ' +
    tag +
    "</div>" +
    '<div class="card-title">' +
    cfg.title +
    "</div>" +
    '<p class="card-desc">' +
    cfg.desc +
    "</p>" +
    '<div class="card-arrow">Visit page</div>';
  return a;
}

/* ── Build a repo card ───────────────────────────────────── */
function makeRepoCard(repo, idx) {
  const a = document.createElement("a");
  a.href = "https://github.com/truelockmc/" + repo.name;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "repo-card reveal";
  a.style.transitionDelay = (idx * 0.1).toFixed(2) + "s";

  /* Social preview*/
  const imgSrc = "https://opengraph.githubassets.com/1/truelockmc/" + repo.name;

  const topicsHtml = (repo.topics || [])
    .slice(0, 6)
    .map((t) => '<span class="repo-topic">' + t + "</span>")
    .join("");

  const langHtml = repo.language
    ? '<span class="repo-lang"><span class="lang-dot" style="background:' +
      langColor(repo.language) +
      '"></span>' +
      repo.language +
      "</span>"
    : "";

  a.innerHTML =
    /* preview image */
    '<div class="repo-preview">' +
    '<img src="' +
    imgSrc +
    '" alt="' +
    repo.name +
    ' preview" ' +
    "onerror=\"this.parentElement.innerHTML='<div class=repo-preview-placeholder>" +
    repo.name.toUpperCase() +
    '</div>\'" loading="lazy"></div>' +
    /* body */
    '<div class="repo-body">' +
    '<div class="repo-meta">' +
    '<span class="repo-tag">// ' +
    (repo.language || "Web") +
    " &middot; github.com</span>" +
    '<span class="repo-stars">' +
    '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.873 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>' +
    repo.stargazers_count +
    "</span>" +
    "</div>" +
    '<div class="repo-title">' +
    repo.name.replace(/-/g, " ") +
    "</div>" +
    '<p class="repo-desc">' +
    (repo.description || "No description provided.") +
    "</p>" +
    (topicsHtml ? '<div class="repo-topics">' + topicsHtml + "</div>" : "") +
    '<div class="repo-footer">' +
    langHtml +
    '<span class="repo-arrow">View on GitHub</span></div>' +
    "</div>";

  return a;
}

/* ── GitHub API fetch (paginated) ────────────────────────── */
async function fetchAllRepos() {
  let repos = [],
    page = 1;
  while (true) {
    const r = await fetch(
      "https://api.github.com/users/truelockmc/repos?per_page=100&page=" + page,
    );
    if (!r.ok) throw new Error("HTTP " + r.status);
    const batch = await r.json();
    repos = repos.concat(batch);
    if (batch.length < 100) break;
    page++;
  }
  return repos;
}

/* ── Load top repos by stars ─────────────────────────────── */
async function loadTopRepos(repos) {
  const grid = document.getElementById("repos-grid");
  const cntEl = document.getElementById("repos-star-total");

  const top4 = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4);

  /* animate total stars */
  if (cntEl) {
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    let n = 0;
    (function tick() {
      n = Math.min(n + Math.ceil(totalStars / 20), totalStars);
      cntEl.textContent = n;
      if (n < totalStars) requestAnimationFrame(tick);
    })();
  }

  grid.innerHTML = "";
  top4.forEach((repo, i) => {
    const card = makeRepoCard(repo, i);
    grid.appendChild(card);
    obs.observe(card);
  });

  wireCursor();
}

/* ── Load pages ──────────────────────────────────────────── */
async function loadPages(repos) {
  const grid = document.getElementById("pages-grid");
  const errEl = document.getElementById("pages-error");
  const cntEl = document.getElementById("count-repos");
  const lblEl = document.getElementById("pages-count");

  /* animate total repo count */
  const total = repos.length;
  let n = 0;
  (function tick() {
    n = Math.min(n + Math.ceil(total / 20), total);
    cntEl.textContent = n;
    if (n < total) requestAnimationFrame(tick);
  })();

  const pinnedNames = new Set(PINNED.map((p) => p.name));
  const dynamic = repos
    .filter(
      (r) =>
        r.has_pages &&
        !pinnedNames.has(r.name) &&
        r.name !== "truelockmc.github.io",
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const rootRepo = repos.find((r) => r.name === "truelockmc.github.io");
  const totalPages =
    PINNED.length + dynamic.length + (rootRepo?.has_pages ? 1 : 0);
  if (lblEl) lblEl.textContent = totalPages + " live pages";

  grid.innerHTML = "";

  PINNED.forEach((cfg, i) => {
    const card = makeCard(cfg, i, true);
    grid.appendChild(card);
    obs.observe(card);
  });

  dynamic.forEach((repo, i) => {
    const idx = PINNED.length + i;
    const cfg = {
      url: "https://truelockmc.github.io/" + repo.name + "/",
      title: repo.name.replace(/-/g, " "),
      desc: repo.description || "A hosted page — click to explore.",
      emoji: EMOJIS[idx % EMOJIS.length],
      ci: idx % 6,
      tag: (repo.language || "Web") + " &middot; GitHub Pages",
    };
    const card = makeCard(cfg, idx, false);
    grid.appendChild(card);
    obs.observe(card);
  });

  if (grid.children.length === 0) {
    grid.innerHTML =
      "<p style=\"font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:.8rem;color:var(--muted)\">// No pages found.</p>";
  }

  wireCursor();
  if (errEl) errEl.style.display = "none";
}

/* ── Load contributed-to repos ───────────────────────────── */
async function loadContributions() {
  const list = document.getElementById("contrib-list");

  try {
    // Search for all merged PRs by truelockmc on repos they don't own
    const q = encodeURIComponent(
      "type:pr author:truelockmc is:merged -user:truelockmc",
    );
    const searchUrl =
      "https://api.github.com/search/issues?q=" +
      q +
      "&per_page=100&sort=updated";

    const r = await fetch(searchUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();

    if (!data.items || data.items.length === 0) {
      list.innerHTML =
        "<li style=\"padding:1.2rem 1.4rem;font-family:'DM Mono',monospace;" +
        'font-size:.75rem;color:var(--muted)">// No merged PRs found.</li>';
      return;
    }

    // Deduplicate by repo, count PRs per repo
    const repoMap = new Map();
    for (const item of data.items) {
      // item.repository_url = "https://api.github.com/repos/owner/name"
      const repoUrl = item.repository_url;
      if (!repoMap.has(repoUrl)) {
        repoMap.set(repoUrl, { count: 1, repoUrl });
      } else {
        repoMap.get(repoUrl).count++;
      }
    }

    // Fetch repo details in parallel
    const entries = [...repoMap.values()];
    const details = await Promise.all(
      entries.map(({ repoUrl, count }) =>
        fetch(repoUrl)
          .then((r) =>
            r.ok ? r.json().then((d) => ({ ...d, prCount: count })) : null,
          )
          .catch(() => null),
      ),
    );

    // Sort by stars descending, only show repos with more than 2 stars
    const repos = details
      .filter(Boolean)
      .filter((r) => r.stargazers_count > 2)
      .sort((a, b) => b.stargazers_count - a.stargazers_count);

    const STAR_SVG =
      '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 ' +
      "1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 " +
      "0 01-1.088-.79l.72-4.194L.873 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 " +
      '0 018 .25z"/></svg>';

    list.innerHTML = "";
    repos.forEach((repo, i) => {
      const li = document.createElement("li");

      const avatarUrl = repo.owner.avatar_url + "&s=64";
      const ownerName = repo.owner.login;
      const repoName = repo.name;
      const desc = repo.description
        ? repo.description.length > 80
          ? repo.description.slice(0, 78) + "…"
          : repo.description
        : "No description.";
      const stars =
        repo.stargazers_count >= 1000
          ? (repo.stargazers_count / 1000).toFixed(1) + "k"
          : repo.stargazers_count;
      const langDot = repo.language
        ? '<span class="lang-dot" style="background:' +
          langColor(repo.language) +
          '"></span>'
        : "";
      const prBadge =
        '<span class="contrib-pr-count">' +
        repo.prCount +
        " PR" +
        (repo.prCount > 1 ? "s" : "") +
        " merged</span>";

      const a = document.createElement("a");
      a.href = repo.html_url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "contrib-item";
      a.style.transitionDelay = (i * 0.06).toFixed(2) + "s";

      a.innerHTML =
        '<span class="contrib-rank">' +
        (i + 1) +
        "</span>" +
        '<img class="contrib-avatar" src="' +
        avatarUrl +
        '" alt="' +
        ownerName +
        '" loading="lazy">' +
        '<div class="contrib-info">' +
        '<span class="contrib-name">' +
        '<span class="contrib-owner">' +
        ownerName +
        " / </span>" +
        '<span class="contrib-repo">' +
        repoName +
        "</span>" +
        "</span>" +
        '<span class="contrib-desc">' +
        desc +
        "</span>" +
        "</div>" +
        '<div class="contrib-right">' +
        prBadge +
        (repo.language
          ? '<span class="contrib-lang">' + langDot + repo.language + "</span>"
          : "") +
        '<span class="contrib-stars">' +
        STAR_SVG +
        stars +
        "</span>" +
        "</div>" +
        '<span class="contrib-arrow">→</span>';

      li.appendChild(a);
      list.appendChild(li);
      obs.observe(a);
    });

    wireCursor();
  } catch (err) {
    console.error("contributions:", err);
    list.innerHTML =
      "<li style=\"padding:1.2rem 1.4rem;font-family:'DM Mono',monospace;" +
      'font-size:.75rem;color:var(--muted)">// Could not load contributions.</li>';
  }
}

/* ── Bootstrap ───────────────────────────────────────────── */
(async function init() {
  try {
    const repos = await fetchAllRepos();
    await Promise.all([
      loadTopRepos(repos),
      loadPages(repos),
      loadContributions(),
    ]);
  } catch (err) {
    console.error(err);

    /* fallback: still render pinned page cards */
    const grid = document.getElementById("pages-grid");
    const errEl = document.getElementById("pages-error");
    grid.innerHTML = "";
    PINNED.forEach((cfg, i) => {
      const card = makeCard(cfg, i, true);
      grid.appendChild(card);
      obs.observe(card);
    });
    if (errEl) errEl.style.display = "block";

    /* repos section fallback */
    const rGrid = document.getElementById("repos-grid");
    rGrid.innerHTML =
      "<p style=\"font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:.8rem;color:var(--muted)\">// Could not load repos.</p>";

    wireCursor();
  }
})();
